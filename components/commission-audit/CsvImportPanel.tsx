'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Info,
  Loader2,
  RefreshCw,
  Settings2,
  Upload,
  X,
} from 'lucide-react';

import {
  CSV_COLUMN_DEFS,
  CSV_PREVIEW_ROW_COUNT,
  CSV_TEMPLATE_FILE_NAME,
  CsvImportError,
  MAX_CSV_FILE_BYTES,
  MAX_CSV_ROWS,
  autoMapColumns,
  buildCsvTemplate,
  didMappingMatchExactly,
  getMissingRequiredColumns,
  parseCsvFile,
  parseNumericCell,
  validateCsvImport,
} from '@/lib/commission-audit/csv';
import { formatBytes, formatMoney, formatPercent } from '@/lib/commission-audit/format';
import type {
  CsvColumnDefinition,
  CsvColumnKey,
  CsvColumnMapping,
  CsvImportSummary,
  CsvRawTable,
  Transaction,
} from '@/types/commission-audit';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface CsvImportPanelProps {
  /** Receives every successfully validated transaction for the current file. */
  onImport: (transactions: Transaction[]) => void;
  /** Optional hook fired after a successful import (e.g. to switch views). */
  onImported?: (summary: CsvImportSummary) => void;
  /** How many transactions already exist, shown on the confirm button. */
  existingCount?: number;
}

type ImportStep = 'idle' | 'review' | 'done';

const MONEY_KEYS = new Set<CsvColumnKey>([
  'salePrice',
  'referralIn',
  'transactionFee',
  'actualPaid',
]);

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

function formatDefaultValue(def: CsvColumnDefinition): string {
  if (def.defaultValue === null) return '—';
  return MONEY_KEYS.has(def.key) ? formatMoney(def.defaultValue) : formatPercent(def.defaultValue);
}

interface PreviewCell {
  text: string;
  muted: boolean;
  invalid?: boolean;
  raw: string;
}

function buildPreviewCell(
  def: CsvColumnDefinition,
  row: string[],
  headers: string[],
  mapping: CsvColumnMapping,
): PreviewCell {
  const header = mapping[def.key];
  if (!header) {
    return {
      text: def.defaultValue !== null ? `${formatDefaultValue(def)} (default)` : '—',
      muted: true,
      raw: '',
    };
  }

  const index = headers.indexOf(header);
  const raw = index === -1 ? '' : String(row[index] ?? '');
  if (!raw.trim()) {
    return {
      text: def.defaultValue !== null ? `${formatDefaultValue(def)} (default)` : '—',
      muted: true,
      raw,
    };
  }

  if (def.key === 'address') return { text: raw.trim(), muted: false, raw };

  const parsed = parseNumericCell(raw);
  if (parsed === null) return { text: raw, muted: false, invalid: true, raw };

  return {
    text: MONEY_KEYS.has(def.key) ? formatMoney(parsed) : formatPercent(parsed),
    muted: false,
    raw,
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CsvImportPanel({
  onImport,
  onImported,
  existingCount = 0,
}: CsvImportPanelProps) {
  const [step, setStep] = useState<ImportStep>('idle');
  const [table, setTable] = useState<CsvRawTable | null>(null);
  const [mapping, setMapping] = useState<CsvColumnMapping | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileNotice, setFileNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showMappingEditor, setShowMappingEditor] = useState(false);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [showAllWarnings, setShowAllWarnings] = useState(false);
  const [showHeaderReference, setShowHeaderReference] = useState(false);
  const [summary, setSummary] = useState<CsvImportSummary | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  // Stable seed so re-validating after a mapping change keeps the same row ids.
  const idSeedRef = useRef<string>(Math.random().toString(36).slice(2, 8));

  const validation = useMemo(
    () => (table && mapping ? validateCsvImport(table, mapping, { idSeed: idSeedRef.current }) : null),
    [table, mapping],
  );

  const missingRequired = useMemo(
    () => (mapping ? getMissingRequiredColumns(mapping) : []),
    [mapping],
  );

  const mappingIsExact = useMemo(() => (mapping ? didMappingMatchExactly(mapping) : true), [mapping]);

  /* ---------------------------- file handling ----------------------------- */

  const resetToIdle = useCallback(() => {
    setStep('idle');
    setTable(null);
    setMapping(null);
    setFileError(null);
    setFileNotice(null);
    setShowMappingEditor(false);
    setShowAllErrors(false);
    setShowAllWarnings(false);
    setSummary(null);
    setIsDragging(false);
  }, []);

  const handleFile = useCallback(
    async (file: File | undefined | null, extraFileCount = 0) => {
      if (!file) return;

      setFileError(null);
      setFileNotice(null);
      setSummary(null);
      setIsReading(true);

      try {
        const parsedTable = await parseCsvFile(file);
        const autoMapping = autoMapColumns(parsedTable.headers);

        setTable(parsedTable);
        setMapping(autoMapping);
        setShowMappingEditor(!didMappingMatchExactly(autoMapping));
        setStep('review');
        if (extraFileCount > 0) {
          setFileNotice(
            `${extraFileCount + 1} files were dropped — only "${file.name}" was processed. Import the others one at a time.`,
          );
        }
      } catch (error) {
        const message =
          error instanceof CsvImportError
            ? error.message
            : `"${file.name}" could not be parsed. Make sure it is a valid CSV file.`;
        setFileError(message);
        setTable(null);
        setMapping(null);
        setStep('idle');
      } finally {
        setIsReading(false);
      }
    },
    [],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      void handleFile(files?.[0], files ? files.length - 1 : 0);
      event.target.value = '';
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const files = event.dataTransfer?.files;
      void handleFile(files?.[0], files ? files.length - 1 : 0);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /* ------------------------------ mapping --------------------------------- */

  const updateMapping = useCallback((key: CsvColumnKey, header: string) => {
    setMapping((current) => (current ? { ...current, [key]: header || null } : current));
  }, []);

  const resetMapping = useCallback(() => {
    if (!table) return;
    setMapping(autoMapColumns(table.headers));
  }, [table]);

  /* ------------------------------ importing ------------------------------- */

  const handleConfirmImport = useCallback(() => {
    if (!table || !mapping || !validation) return;
    if (!validation.transactions.length) return;

    onImport(validation.transactions);

    const nextSummary: CsvImportSummary = {
      imported: validation.transactions.length,
      failed: validation.errors.length,
      warnings: validation.warnings.length,
      totalRows: validation.totalRows,
      notes: validation.fileWarnings,
    };
    setSummary(nextSummary);
    setStep('done');
    onImported?.(nextSummary);
  }, [mapping, onImport, onImported, table, validation]);

  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([buildCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = CSV_TEMPLATE_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  /* ------------------------------- render --------------------------------- */

  const previewRows = table ? table.rows.slice(0, CSV_PREVIEW_ROW_COUNT) : [];
  const errorRowNumbers = useMemo(() => {
    const map = new Map<number, string[]>();
    validation?.errors.forEach((rowError) => map.set(rowError.rowNumber, rowError.messages));
    return map;
  }, [validation]);

  const visibleErrors = validation ? (showAllErrors ? validation.errors : validation.errors.slice(0, 25)) : [];
  const visibleWarnings = validation
    ? showAllWarnings
      ? validation.warnings
      : validation.warnings.slice(0, 15)
    : [];

  const importCount = validation?.transactions.length ?? 0;
  const canImport = importCount > 0 && missingRequired.length === 0 && step === 'review';

  return (
    <div className="p-6 space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv,.txt,.tsv"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Choose a CSV file to import"
      />

      {/* ------------------------------ Alerts ----------------------------- */}
      {fileError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-300">Import failed</p>
            <p className="text-xs text-rose-200/80 mt-0.5">{fileError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {fileNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-200/90 flex-1">{fileNotice}</p>
          <button
            type="button"
            onClick={() => setFileNotice(null)}
            className="p-1 rounded-lg text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------ Step 1 ----------------------------- */}
      {step === 'idle' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={openFileDialog}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFileDialog();
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
              isDragging
                ? 'border-[#10B981] bg-[#10B981]/10'
                : 'border-slate-700/80 bg-[#05080F] hover:border-[#10B981]/70 hover:bg-[#10B981]/5'
            }`}
          >
            {isReading ? (
              <Loader2 className="w-10 h-10 text-[#10B981] mx-auto mb-3 animate-spin" />
            ) : (
              <Upload
                className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-[#10B981]' : 'text-slate-500'}`}
              />
            )}
            <h3 className="text-sm font-semibold text-white">
              {isReading ? 'Reading file…' : 'Drag & drop your commission CSV here'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              or <span className="font-semibold text-[#10B981] underline">browse your files</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-3">
              CSV / TSV &middot; max {formatBytes(MAX_CSV_FILE_BYTES)} &middot; up to{' '}
              {MAX_CSV_ROWS.toLocaleString('en-US')} rows &middot; processed locally in browser
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#05080F] border border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              Download CSV template
            </button>
            <button
              type="button"
              onClick={() => setShowHeaderReference((value) => !value)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#05080F] border border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              Accepted column headers
              {showHeaderReference ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            <Link
              href="/commission-audit.html"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#10B981]" />
              Standalone HTML tool
            </Link>
          </div>

          {showHeaderReference && (
            <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4">
              <p className="text-xs text-slate-400 mb-3">
                Header matching is case-insensitive and ignores spaces, symbols and percent signs.
                Columns marked <span className="font-semibold text-rose-400">required</span> must be
                present; optional columns fall back to the documented default.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-1.5 pr-4">Canonical column</th>
                      <th className="py-1.5 pr-4">Also accepts</th>
                      <th className="py-1.5 pr-4">Fallback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {CSV_COLUMN_DEFS.map((def) => (
                      <tr key={def.key}>
                        <td className="py-1.5 pr-4 font-semibold text-slate-200 whitespace-nowrap">
                          {def.label}
                          {def.required && <span className="ml-1 text-rose-400">*</span>}
                        </td>
                        <td className="py-1.5 pr-4 text-slate-400 font-mono">
                          {def.aliases.slice(0, 4).join(', ')}
                          {def.aliases.length > 4 ? ', …' : ''}
                        </td>
                        <td className="py-1.5 pr-4 text-slate-400 font-mono tabular-nums">
                          {def.required ? 'Required' : formatDefaultValue(def)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------ Step 2 ----------------------------- */}
      {step === 'review' && table && mapping && validation && (
        <div className="space-y-5">
          {/* File summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#05080F] px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate" title={table.fileName}>
                  {table.fileName}
                </p>
                <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {formatBytes(table.fileSizeBytes)} &middot; {table.rows.length} data rows &middot;{' '}
                  {table.headers.length} columns &middot; delimiter &ldquo;
                  {table.delimiter === '\t' ? '\\t' : table.delimiter}&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openFileDialog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0B1120] border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Choose another file
              </button>
              <button
                type="button"
                onClick={resetToIdle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>

          {/* Mapping banner */}
          {!mappingIsExact && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <Settings2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-300">
                  Some headers did not match exactly
                </p>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  We auto-detected the mapping below. Review it and correct any column before
                  importing — mismatched columns silently produce wrong audit numbers.
                </p>
              </div>
            </div>
          )}

          {missingRequired.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-300">Required columns missing</p>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Map: {missingRequired.map((key) => CSV_COLUMN_DEFS.find((d) => d.key === key)?.label).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Column mapping editor */}
          <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-[#05080F]">
            <button
              type="button"
              onClick={() => setShowMappingEditor((value) => !value)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#0B1120] hover:bg-slate-900/90 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-white">Column mapping</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    missingRequired.length === 0
                      ? 'bg-emerald-500/10 text-[#10B981] border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {missingRequired.length === 0 ? 'Ready' : `${missingRequired.length} missing`}
                </span>
              </span>
              {showMappingEditor ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showMappingEditor && (
              <div className="border-t border-slate-800/80 bg-[#05080F] p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {CSV_COLUMN_DEFS.map((def) => {
                    const value = mapping[def.key] ?? '';
                    const isMissing = def.required && !value;
                    return (
                      <div key={def.key} className="bg-[#0B1120] rounded-lg border border-slate-800/80 p-3">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <label
                            htmlFor={`csv-map-${def.key}`}
                            className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider"
                          >
                            {def.label}
                            {def.required && <span className="text-rose-400 ml-1">*</span>}
                          </label>
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isMissing ? 'bg-rose-500' : value ? 'bg-[#10B981]' : 'bg-slate-600'
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                        <select
                          id={`csv-map-${def.key}`}
                          value={value}
                          onChange={(event) => updateMapping(def.key, event.target.value)}
                          className={`w-full px-2.5 py-2 rounded-lg border text-xs text-white outline-none focus:ring-2 focus:ring-[#10B981] transition ${
                            isMissing ? 'border-rose-500/50 bg-rose-950/30' : 'border-slate-800 bg-[#05080F]'
                          }`}
                        >
                          <option value="">— Not mapped —</option>
                          {table.headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          {def.required ? def.hint : `${def.hint} Fallback: ${formatDefaultValue(def)}.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={resetMapping}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    Reset to auto-detected mapping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview table */}
          <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-[#0B1120]">
            <div className="px-4 py-3 bg-[#0B1120] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Preview — first {Math.min(CSV_PREVIEW_ROW_COUNT, table.rows.length)} of{' '}
                  {table.rows.length} rows
                </h3>
                <p className="text-[11px] text-slate-400">
                  Values shown after mapping, cleaning and defaulting. Hover a cell to see the raw
                  file value.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                {existingCount} existing transaction{existingCount === 1 ? '' : 's'} will be kept
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800/80 text-left text-[11px]">
                <thead className="bg-[#05080F] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    {CSV_COLUMN_DEFS.map((def) => (
                      <th key={def.key} className="py-2.5 px-3 whitespace-nowrap">
                        <div>{def.label}</div>
                        <div className="font-normal normal-case text-[9px] text-slate-500">
                          {mapping[def.key] ?? 'not mapped'}
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0B1120]">
                  {previewRows.map((row, index) => {
                    const rowNumber = index + 2;
                    const rowIssues = errorRowNumbers.get(rowNumber);
                    const isBlank = row.every((cell) => !String(cell ?? '').trim());
                    return (
                      <tr
                        key={`preview-${rowNumber}`}
                        className={rowIssues ? 'bg-rose-500/10' : 'hover:bg-slate-800/40'}
                      >
                        <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">{rowNumber}</td>
                        {CSV_COLUMN_DEFS.map((def) => {
                          const cell = buildPreviewCell(def, row, table.headers, mapping);
                          return (
                            <td
                              key={`${rowNumber}-${def.key}`}
                              title={cell.raw ? `Raw: ${cell.raw}` : 'No value in file'}
                              className={`py-2.5 px-3 whitespace-nowrap font-mono tabular-nums ${
                                cell.invalid
                                  ? 'text-rose-400 font-semibold'
                                  : cell.muted
                                    ? 'text-slate-500 italic'
                                    : 'text-slate-200'
                              }`}
                            >
                              {cell.text}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3">
                          {isBlank ? (
                            <span className="text-[10px] text-slate-500">blank row</span>
                          ) : rowIssues ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400"
                              title={rowIssues.join(' ')}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Will fail
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#10B981]">
                              <CheckCircle2 className="w-3 h-3" />
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Result counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#10B981]">
                Ready to import
              </p>
              <p className="mt-1 text-xl font-bold text-[#10B981] font-mono tabular-nums">{importCount}</p>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                Rows with errors
              </p>
              <p className="mt-1 text-xl font-bold text-rose-400 font-mono tabular-nums">{validation.errors.length}</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Row warnings
              </p>
              <p className="mt-1 text-xl font-bold text-amber-400 font-mono tabular-nums">
                {validation.warnings.length}
                {validation.warningsTruncated ? '+' : ''}
              </p>
            </div>
          </div>

          {/* File-level warnings */}
          {validation.fileWarnings.length > 0 && (
            <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4 space-y-1.5">
              {validation.fileWarnings.map((warning) => (
                <p key={warning} className="text-[11px] text-slate-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Row errors */}
          {validation.errors.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 overflow-hidden">
              <div className="px-4 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {validation.errors.length} row{validation.errors.length === 1 ? '' : 's'} will be
                  skipped
                </h3>
                {validation.errors.length > 25 && (
                  <button
                    type="button"
                    onClick={() => setShowAllErrors((value) => !value)}
                    className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
                  >
                    {showAllErrors ? 'Show fewer' : `Show all ${validation.errors.length}`}
                  </button>
                )}
              </div>
              <ul className="divide-y divide-slate-800/80 bg-[#05080F] max-h-72 overflow-y-auto">
                {visibleErrors.map((rowError) => (
                  <li key={`error-${rowError.rowNumber}`} className="px-4 py-2.5">
                    <p className="text-[11px] font-semibold text-slate-200">
                      Row {rowError.rowNumber}
                      <span className="font-normal text-slate-400"> — {rowError.address}</span>
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {rowError.messages.map((message) => (
                        <li key={message} className="text-[11px] text-rose-400">
                          • {message}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              {!showAllErrors && validation.errors.length > 25 && (
                <p className="px-4 py-2 text-[11px] text-slate-400 bg-[#0B1120] border-t border-slate-800/80">
                  …and {validation.errors.length - 25} more. Fix the CSV and re-upload, or continue —
                  the valid rows still import.
                </p>
              )}
            </div>
          )}

          {/* Row warnings */}
          {validation.warnings.length > 0 && (
            <details className="rounded-xl border border-amber-500/30 bg-amber-500/10 overflow-hidden">
              <summary className="px-4 py-3 text-xs font-semibold text-amber-300 cursor-pointer">
                {validation.warnings.length}
                {validation.warningsTruncated ? '+' : ''} row
                {validation.warnings.length === 1 ? '' : 's'} used a default value
              </summary>
              <ul className="divide-y divide-slate-800/80 bg-[#05080F] max-h-64 overflow-y-auto">
                {visibleWarnings.map((warning) => (
                  <li
                    key={`warning-${warning.rowNumber}-${warning.message}`}
                    className="px-4 py-2 text-[11px] text-amber-300/90"
                  >
                    Row {warning.rowNumber} — {warning.address}: {warning.message}
                  </li>
                ))}
              </ul>
              {!showAllWarnings && validation.warnings.length > 15 && (
                <button
                  type="button"
                  onClick={() => setShowAllWarnings(true)}
                  className="w-full px-4 py-2 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition border-t border-amber-500/20 cursor-pointer"
                >
                  Show all {validation.warnings.length} warnings
                </button>
              )}
            </details>
          )}

          {/* Confirm */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={resetToIdle}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#05080F] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={!canImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm import ({importCount})
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------ Step 3 ----------------------------- */}
      {step === 'done' && summary && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
            <p className="text-base font-bold text-white">
              {summary.imported} transaction{summary.imported === 1 ? '' : 's'} imported successfully
            </p>
            <p className="text-xs text-emerald-300/90 mt-1 font-mono tabular-nums">
              {summary.imported} added &middot; {summary.failed} skipped &middot;{' '}
              {summary.warnings} defaulted &middot; {summary.totalRows} rows read
            </p>
          </div>

          {summary.failed > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold text-rose-300">
                {summary.failed} row{summary.failed === 1 ? '' : 's'} were not imported
              </p>
              <p className="text-[11px] text-rose-200/80 mt-0.5">
                Re-upload the file with those rows corrected to bring them into the audit. The
                imported rows are already listed in the audited commission log below.
              </p>
            </div>
          )}

          {summary.warnings > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold text-amber-300">
                {summary.warnings} row{summary.warnings === 1 ? '' : 's'} used a defaulted column
              </p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Add the missing columns to future exports so every figure is audited from source data.
              </p>
            </div>
          )}

          {summary.notes.length > 0 && (
            <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4 space-y-1.5">
              <p className="text-xs font-semibold text-white">Import notes</p>
              {summary.notes.map((note) => (
                <p key={note} className="text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                  {note}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetToIdle}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Import another CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
