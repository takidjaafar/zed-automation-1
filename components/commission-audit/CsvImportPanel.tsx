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
      // Allow re-selecting the same file.
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
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">Import failed</p>
            <p className="text-xs text-rose-700 mt-0.5">{fileError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 transition"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {fileNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 flex-1">{fileNotice}</p>
          <button
            type="button"
            onClick={() => setFileNotice(null)}
            className="p-1 rounded-lg text-amber-600 hover:bg-amber-100 transition"
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
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/60'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30'
            }`}
          >
            {isReading ? (
              <Loader2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-spin" />
            ) : (
              <Upload
                className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`}
              />
            )}
            <h3 className="text-sm font-semibold text-slate-800">
              {isReading ? 'Reading file…' : 'Drag & drop your commission CSV here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              or <span className="font-semibold text-emerald-600 underline">browse your files</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-3">
              CSV / TSV &middot; max {formatBytes(MAX_CSV_FILE_BYTES)} &middot; up to{' '}
              {MAX_CSV_ROWS.toLocaleString('en-US')} rows &middot; nothing leaves your browser
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Download CSV template
            </button>
            <button
              type="button"
              onClick={() => setShowHeaderReference((value) => !value)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
              Standalone HTML tool
            </Link>
          </div>

          {showHeaderReference && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs text-slate-600 mb-3">
                Header matching is case-insensitive and ignores spaces, symbols and percent signs.
                Columns marked <span className="font-semibold text-rose-600">required</span> must be
                present; optional columns fall back to the documented default.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-1.5 pr-4">Canonical column</th>
                      <th className="py-1.5 pr-4">Also accepts</th>
                      <th className="py-1.5 pr-4">Fallback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {CSV_COLUMN_DEFS.map((def) => (
                      <tr key={def.key}>
                        <td className="py-1.5 pr-4 font-semibold text-slate-800 whitespace-nowrap">
                          {def.label}
                          {def.required && <span className="ml-1 text-rose-600">*</span>}
                        </td>
                        <td className="py-1.5 pr-4 text-slate-600 font-mono">
                          {def.aliases.slice(0, 4).join(', ')}
                          {def.aliases.length > 4 ? ', …' : ''}
                        </td>
                        <td className="py-1.5 pr-4 text-slate-600">
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate" title={table.fileName}>
                  {table.fileName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatBytes(table.fileSizeBytes)} &middot; {table.rows.length} data rows &middot;{' '}
                  {table.headers.length} columns &middot; delimiter “
                  {table.delimiter === '\t' ? '\\t' : table.delimiter}”
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openFileDialog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Choose another file
              </button>
              <button
                type="button"
                onClick={resetToIdle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>

          {/* Mapping banner */}
          {!mappingIsExact && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Settings2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  Some headers did not match exactly
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  We auto-detected the mapping below. Review it and correct any column before
                  importing — mismatched columns silently produce wrong audit numbers.
                </p>
              </div>
            </div>
          )}

          {missingRequired.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-900">Required columns missing</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Map: {missingRequired.map((key) => CSV_COLUMN_DEFS.find((d) => d.key === key)?.label).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Column mapping editor */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMappingEditor((value) => !value)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition text-left"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900">Column mapping</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    missingRequired.length === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
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
              <div className="border-t border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {CSV_COLUMN_DEFS.map((def) => {
                    const value = mapping[def.key] ?? '';
                    const isMissing = def.required && !value;
                    return (
                      <div key={def.key} className="bg-white rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <label
                            htmlFor={`csv-map-${def.key}`}
                            className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider"
                          >
                            {def.label}
                            {def.required && <span className="text-rose-500 ml-1">*</span>}
                          </label>
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isMissing ? 'bg-rose-500' : value ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                        <select
                          id={`csv-map-${def.key}`}
                          value={value}
                          onChange={(event) => updateMapping(def.key, event.target.value)}
                          className={`w-full px-2.5 py-2 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                            isMissing ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-white'
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    Reset to auto-detected mapping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Preview — first {Math.min(CSV_PREVIEW_ROW_COUNT, table.rows.length)} of{' '}
                  {table.rows.length} rows
                </h3>
                <p className="text-[11px] text-slate-500">
                  Values shown after mapping, cleaning and defaulting. Hover a cell to see the raw
                  file value.
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                {existingCount} existing transaction{existingCount === 1 ? '' : 's'} will be kept
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    {CSV_COLUMN_DEFS.map((def) => (
                      <th key={def.key} className="py-2.5 px-3 whitespace-nowrap">
                        <div>{def.label}</div>
                        <div className="font-normal normal-case text-[9px] text-slate-400">
                          {mapping[def.key] ?? 'not mapped'}
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewRows.map((row, index) => {
                    const rowNumber = index + 2;
                    const rowIssues = errorRowNumbers.get(rowNumber);
                    const isBlank = row.every((cell) => !String(cell ?? '').trim());
                    return (
                      <tr
                        key={`preview-${rowNumber}`}
                        className={rowIssues ? 'bg-rose-50/60' : 'hover:bg-slate-50/70'}
                      >
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{rowNumber}</td>
                        {CSV_COLUMN_DEFS.map((def) => {
                          const cell = buildPreviewCell(def, row, table.headers, mapping);
                          return (
                            <td
                              key={`${rowNumber}-${def.key}`}
                              title={cell.raw ? `Raw: ${cell.raw}` : 'No value in file'}
                              className={`py-2.5 px-3 whitespace-nowrap ${
                                cell.invalid
                                  ? 'text-rose-600 font-semibold'
                                  : cell.muted
                                    ? 'text-slate-400 italic'
                                    : 'text-slate-700'
                              }`}
                            >
                              {cell.text}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3">
                          {isBlank ? (
                            <span className="text-[10px] text-slate-400">blank row</span>
                          ) : rowIssues ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700"
                              title={rowIssues.join(' ')}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Will fail
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Ready to import
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{importCount}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                Rows with errors
              </p>
              <p className="mt-1 text-xl font-bold text-rose-700">{validation.errors.length}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Row warnings
              </p>
              <p className="mt-1 text-xl font-bold text-amber-700">
                {validation.warnings.length}
                {validation.warningsTruncated ? '+' : ''}
              </p>
            </div>
          </div>

          {/* File-level warnings */}
          {validation.fileWarnings.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
              {validation.fileWarnings.map((warning) => (
                <p key={warning} className="text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Row errors */}
          {validation.errors.length > 0 && (
            <div className="rounded-xl border border-rose-200 overflow-hidden">
              <div className="px-4 py-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {validation.errors.length} row{validation.errors.length === 1 ? '' : 's'} will be
                  skipped
                </h3>
                {validation.errors.length > 25 && (
                  <button
                    type="button"
                    onClick={() => setShowAllErrors((value) => !value)}
                    className="text-[11px] font-semibold text-rose-700 hover:underline"
                  >
                    {showAllErrors ? 'Show fewer' : `Show all ${validation.errors.length}`}
                  </button>
                )}
              </div>
              <ul className="divide-y divide-rose-100 bg-white max-h-72 overflow-y-auto">
                {visibleErrors.map((rowError) => (
                  <li key={`error-${rowError.rowNumber}`} className="px-4 py-2.5">
                    <p className="text-[11px] font-semibold text-slate-800">
                      Row {rowError.rowNumber}
                      <span className="font-normal text-slate-500"> — {rowError.address}</span>
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {rowError.messages.map((message) => (
                        <li key={message} className="text-[11px] text-rose-700">
                          • {message}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              {!showAllErrors && validation.errors.length > 25 && (
                <p className="px-4 py-2 text-[11px] text-slate-500 bg-slate-50 border-t border-rose-100">
                  …and {validation.errors.length - 25} more. Fix the CSV and re-upload, or continue —
                  the valid rows still import.
                </p>
              )}
            </div>
          )}

          {/* Row warnings */}
          {validation.warnings.length > 0 && (
            <details className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
              <summary className="px-4 py-3 text-xs font-semibold text-amber-900 cursor-pointer">
                {validation.warnings.length}
                {validation.warningsTruncated ? '+' : ''} row
                {validation.warnings.length === 1 ? '' : 's'} used a default value
              </summary>
              <ul className="divide-y divide-amber-100 bg-white max-h-64 overflow-y-auto">
                {visibleWarnings.map((warning) => (
                  <li
                    key={`warning-${warning.rowNumber}-${warning.message}`}
                    className="px-4 py-2 text-[11px] text-amber-800"
                  >
                    Row {warning.rowNumber} — {warning.address}: {warning.message}
                  </li>
                ))}
              </ul>
              {!showAllWarnings && validation.warnings.length > 15 && (
                <button
                  type="button"
                  onClick={() => setShowAllWarnings(true)}
                  className="w-full px-4 py-2 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition border-t border-amber-100"
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
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={!canImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-base font-bold text-emerald-900">
              {summary.imported} transaction{summary.imported === 1 ? '' : 's'} imported successfully
            </p>
            <p className="text-xs text-emerald-800 mt-1">
              {summary.imported} added &middot; {summary.failed} skipped &middot;{' '}
              {summary.warnings} defaulted &middot; {summary.totalRows} rows read
            </p>
          </div>

          {summary.failed > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold text-rose-900">
                {summary.failed} row{summary.failed === 1 ? '' : 's'} were not imported
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Re-upload the file with those rows corrected to bring them into the audit. The
                imported rows are already listed in the audited commission log below.
              </p>
            </div>
          )}

          {summary.warnings > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-900">
                {summary.warnings} row{summary.warnings === 1 ? '' : 's'} used a defaulted column
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Add the missing columns to future exports so every figure is audited from source data.
              </p>
            </div>
          )}

          {summary.notes.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-800">Import notes</p>
              {summary.notes.map((note) => (
                <p key={note} className="text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  {note}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetToIdle}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              Import another CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
