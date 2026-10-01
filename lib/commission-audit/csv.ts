/**
 * CSV import engine for the commission audit module.
 *
 * Responsibilities
 *  1. Read an uploaded CSV file (PapaParse) into a raw table.
 *  2. Auto-map the file's headers onto the canonical transaction columns.
 *  3. Validate + coerce every row (zod) and produce `Transaction` records.
 *  4. Report exactly which rows failed and why.
 *
 * The module is deliberately free of React/DOM code so it can be unit tested
 * from Node (`npm run verify:csv`).
 */

import Papa from 'papaparse';
import { z } from 'zod';
import type {
  CsvColumnDefinition,
  CsvColumnKey,
  CsvColumnMapping,
  CsvRawTable,
  CsvRowError,
  CsvRowWarning,
  CsvValidationResult,
  Transaction,
} from '@/types/commission-audit';
import { formatMoney, formatPercent } from '@/lib/commission-audit/format';

/* -------------------------------------------------------------------------- */
/*  Limits                                                                    */
/* -------------------------------------------------------------------------- */

/** The UI advertises a 5 MB ceiling — enforced before we read the file. */
export const MAX_CSV_FILE_BYTES = 5 * 1024 * 1024;
/** Hard cap on data rows so a pathological file cannot lock up the browser. */
export const MAX_CSV_ROWS = 20_000;
/** Cap on row-level warnings kept in memory/UI. */
export const MAX_IMPORT_WARNINGS = 250;
/** How many rows the preview table shows. */
export const CSV_PREVIEW_ROW_COUNT = 5;

/** Thrown for file-level problems (too big, empty, unreadable). */
export class CsvImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvImportError';
  }
}

/* -------------------------------------------------------------------------- */
/*  Column definitions                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Canonical columns, their accepted header spellings and their fallbacks.
 * This is the single source of truth used by the auto-mapper, the manual
 * mapping UI and the downloadable template.
 */
export const CSV_COLUMN_DEFS: CsvColumnDefinition[] = [
  {
    key: 'address',
    label: 'Property Address',
    aliases: [
      'propertyaddress',
      'address',
      'property',
      'location',
      'propertylocation',
      'addressproperty',
      'propertyname',
      'listingaddress',
    ],
    fuzzyTokens: ['address'],
    required: true,
    defaultValue: null,
    hint: 'Street address of the sold property.',
  },
  {
    key: 'salePrice',
    label: 'Sale Price',
    aliases: [
      'saleprice',
      'salesprice',
      'salepriceusd',
      'saleamount',
      'soldprice',
      'purchaseprice',
      'price',
      'contractprice',
      'grosssalesprice',
    ],
    fuzzyTokens: ['saleprice', 'salesprice', 'soldprice'],
    required: true,
    defaultValue: null,
    hint: 'Gross contract price in dollars.',
  },
  {
    key: 'commRate',
    label: 'Total Commission Rate',
    aliases: [
      'totalcommissionrate',
      'commissionrate',
      'totalcommission',
      'totalcommrate',
      'commissionratepercent',
      'commrate',
      'commissionpct',
      'commission',
      'rate',
    ],
    fuzzyTokens: ['commissionrate', 'totalcommission', 'commrate'],
    required: true,
    defaultValue: null,
    hint: 'Percent of the sale price, e.g. 6 for 6%.',
  },
  {
    key: 'listingSplit',
    label: 'Listing Agent Split',
    aliases: [
      'listingagentsplit',
      'listingsplit',
      'listingagentsplitpercent',
      'listingagent',
      'listingside',
      'listing',
    ],
    fuzzyTokens: ['listingagentsplit', 'listingsplit', 'listing'],
    required: false,
    defaultValue: 50,
    hint: 'Listing side share of total commission. Defaults to 50%.',
  },
  {
    key: 'buyerSplit',
    label: 'Buyer Agent Split',
    aliases: [
      'buyeragentsplit',
      'buyersplit',
      'buyeragentsplitpercent',
      'buyeragent',
      'buyerside',
      'buyer',
    ],
    fuzzyTokens: ['buyeragentsplit', 'buyersplit', 'buyer'],
    required: false,
    defaultValue: 50,
    hint: 'Buyer side share of total commission. Defaults to 50%.',
  },
  {
    key: 'brokerSplit',
    label: 'Brokerage Split',
    aliases: [
      'brokeragesplit',
      'brokersplit',
      'brokeragecut',
      'brokercut',
      'brokeragepercent',
      'brokerage',
      'broker',
    ],
    fuzzyTokens: ['brokeragesplit', 'brokersplit', 'brokeragecut', 'brokercut'],
    required: false,
    defaultValue: 30,
    hint: 'Brokerage commission split. Defaults to 30%.',
  },
  {
    key: 'referralOut',
    label: 'Referral Fee Out',
    aliases: [
      'referralfeeout',
      'referralout',
      'referralfeeoutpercent',
      'referraloutpercent',
      'refout',
      'outboundreferral',
    ],
    fuzzyTokens: ['referralfeeout', 'referralout', 'refout'],
    required: false,
    defaultValue: 0,
    hint: 'Percent of listing commission paid away. Defaults to 0%.',
  },
  {
    key: 'referralIn',
    label: 'Referral Fee In',
    aliases: [
      'referralfeein',
      'referralin',
      'referralfeeinamount',
      'incomingreferral',
      'refin',
    ],
    fuzzyTokens: ['referralfeein', 'referralin', 'refin'],
    required: false,
    defaultValue: 0,
    hint: 'Incoming referral dollars still owed to the brokerage. Defaults to $0.00.',
  },
  {
    key: 'transactionFee',
    label: 'Transaction Fee',
    aliases: [
      'transactionfee',
      'transactionfeeusd',
      'transfee',
      'adminfee',
      'administrativefee',
      'compliancefee',
      'fee',
    ],
    fuzzyTokens: ['transactionfee', 'adminfee', 'transfee'],
    required: false,
    defaultValue: 0,
    hint: 'Flat fee charged to the agent. Defaults to $0.00.',
  },
  {
    key: 'actualPaid',
    label: 'Actual Amount Paid',
    aliases: [
      'actualamountpaid',
      'actualpaid',
      'actualagentpayment',
      'actualagentpay',
      'amountpaid',
      'agentpaid',
      'paidamount',
      'actual',
    ],
    fuzzyTokens: ['actualamountpaid', 'actualpaid', 'amountpaid'],
    required: true,
    defaultValue: null,
    hint: 'What the brokerage actually disbursed for this deal.',
  },
];

/** Columns that must be present before an import can run. */
export const REQUIRED_CSV_COLUMNS: CsvColumnKey[] = CSV_COLUMN_DEFS.filter((def) => def.required).map(
  (def) => def.key,
);

export const CSV_COLUMN_DEF_MAP: Record<CsvColumnKey, CsvColumnDefinition> =
  CSV_COLUMN_DEFS.reduce((acc, def) => {
    acc[def.key] = def;
    return acc;
  }, {} as Record<CsvColumnKey, CsvColumnDefinition>);

/* -------------------------------------------------------------------------- */
/*  Header matching                                                           */
/* -------------------------------------------------------------------------- */

/** `"Total Commission Rate (%)"` -> `"totalcommissionrate"` */
export function normalizeHeaderLabel(header: string): string {
  return String(header ?? '')
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function emptyMapping(): CsvColumnMapping {
  return CSV_COLUMN_DEFS.reduce((acc, def) => {
    acc[def.key] = null;
    return acc;
  }, {} as CsvColumnMapping);
}

/**
 * Best-effort automatic mapping.
 *
 * Pass 1 matches headers exactly (after normalisation) so that a file
 * containing both "Price" and "Sale Price" maps correctly.
 * Pass 2 falls back to a "contains" match for decorated headers such as
 * "Total Commission Rate (%)".
 */
export function autoMapColumns(headers: string[]): CsvColumnMapping {
  const mapping = emptyMapping();
  const normalized = headers.map(normalizeHeaderLabel);
  const used = new Set<number>();

  // Pass 1 — exact match against every alias.
  for (const def of CSV_COLUMN_DEFS) {
    const aliasSet = new Set(def.aliases.map(normalizeHeaderLabel));
    const index = normalized.findIndex((h, i) => !used.has(i) && aliasSet.has(h));
    if (index !== -1) {
      mapping[def.key] = headers[index];
      used.add(index);
    }
  }

  // Pass 2 — looser "contains" match for anything still unmapped.
  for (const def of CSV_COLUMN_DEFS) {
    if (mapping[def.key]) continue;
    const tokens = def.fuzzyTokens.map(normalizeHeaderLabel).filter((t) => t.length >= 4);
    const index = normalized.findIndex(
      (h, i) => !used.has(i) && h.length > 0 && tokens.some((token) => h.includes(token)),
    );
    if (index !== -1) {
      mapping[def.key] = headers[index];
      used.add(index);
    }
  }

  return mapping;
}

/** Required columns that the current mapping does not cover. */
export function getMissingRequiredColumns(mapping: CsvColumnMapping): CsvColumnKey[] {
  return REQUIRED_CSV_COLUMNS.filter((key) => !mapping[key]);
}

/** True when every required column is mapped (import can proceed). */
export function isMappingComplete(mapping: CsvColumnMapping): boolean {
  return getMissingRequiredColumns(mapping).length === 0;
}

/**
 * True when every mapped column matched a documented header spelling exactly.
 * When this is `false` the UI surfaces the manual mapping panel so the user can
 * confirm the auto-guess before importing.
 */
export function didMappingMatchExactly(mapping: CsvColumnMapping): boolean {
  return CSV_COLUMN_DEFS.every((def) => {
    const mapped = mapping[def.key];
    if (!mapped) return !def.required;
    const aliasSet = new Set(def.aliases.map(normalizeHeaderLabel));
    return aliasSet.has(normalizeHeaderLabel(mapped));
  });
}

/* -------------------------------------------------------------------------- */
/*  Cell coercion                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Parse a spreadsheet-ish numeric cell.
 * Handles `$1,250.00`, `6%`, `(250)` (accounting negative), whitespace and `""`.
 * Returns `null` when the cell is blank or not a number at all.
 */
export function parseNumericCell(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  let text = String(raw).trim();
  if (!text) return null;

  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }

  // Strip currency symbols, thousands separators, percent signs, spaces, letters.
  text = text.replace(/[^0-9.\-]/g, '');
  if (!text || text === '-' || text === '.') return null;

  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return negative ? -Math.abs(value) : value;
}

function cellAt(row: string[], headers: string[], header: string | null): string | null {
  if (!header) return null;
  const index = headers.indexOf(header);
  if (index === -1) return null;
  const value = row[index];
  return value === undefined || value === null ? null : String(value);
}

/* -------------------------------------------------------------------------- */
/*  Row validation (zod)                                                      */
/* -------------------------------------------------------------------------- */

const percent = z
  .number({ invalid_type_error: 'must be a number' })
  .finite('must be a finite number')
  .min(0, 'cannot be negative')
  .max(100, 'cannot be greater than 100');

const csvTransactionDraftSchema = z.object({
  address: z
    .string({ invalid_type_error: 'Property Address must be text' })
    .trim()
    .min(1, 'Property Address is required'),
  salePrice: z
    .number({ invalid_type_error: 'Sale Price must be a number' })
    .finite('Sale Price must be a finite number')
    .positive('Sale Price must be greater than $0.00'),
  commRate: percent.refine((v) => v > 0, 'Total Commission Rate must be greater than 0%'),
  listingSplit: percent,
  buyerSplit: percent,
  brokerSplit: percent,
  referralOut: percent,
  referralIn: z
    .number({ invalid_type_error: 'Referral Fee In must be a number' })
    .finite('Referral Fee In must be a finite number')
    .min(0, 'Referral Fee In cannot be negative'),
  transactionFee: z
    .number({ invalid_type_error: 'Transaction Fee must be a number' })
    .finite('Transaction Fee must be a finite number')
    .min(0, 'Transaction Fee cannot be negative'),
  actualPaid: z
    .number({ invalid_type_error: 'Actual Amount Paid must be a number' })
    .finite('Actual Amount Paid must be a finite number')
    .min(0, 'Actual Amount Paid cannot be negative'),
});

type CsvTransactionDraft = z.infer<typeof csvTransactionDraftSchema>;

/* -------------------------------------------------------------------------- */
/*  File parsing                                                              */
/* -------------------------------------------------------------------------- */

function ensureUniqueHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((raw, index) => {
    const base = String(raw ?? '').replace(/^\uFEFF/, '').trim() || `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

function padRows(rows: string[][], width: number): string[][] {
  return rows.map((row) => {
    if (row.length === width) return row;
    const next = row.slice(0, width);
    while (next.length < width) next.push('');
    return next;
  });
}

/**
 * Read a CSV file into a raw table. Never throws for recoverable problems —
 * rows with a different field count are padded/trimmed and reported as warnings.
 *
 * @throws {CsvImportError} when the file is too large, empty or unreadable.
 */
export async function parseCsvFile(file: File): Promise<CsvRawTable> {
  if (file.size > MAX_CSV_FILE_BYTES) {
    throw new CsvImportError(
      `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB. The maximum supported size is 5 MB.`,
    );
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName && !/\.(csv|txt|tsv)$/.test(lowerName)) {
    throw new CsvImportError(
      `"${file.name}" is not a CSV file. Please upload a .csv file exported from your transaction feed.`,
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new CsvImportError(`"${file.name}" could not be read. Please try again.`);
  }

  if (!text.trim()) {
    throw new CsvImportError(`"${file.name}" is empty.`);
  }

  const parsed = Papa.parse<string[]>(text, {
    header: false,
    // Blank lines are kept so that reported row numbers always match the line
    // numbers in the uploaded file; `validateCsvImport` skips them itself.
    skipEmptyLines: false,
    dynamicTyping: false,
  });

  const rows = (parsed.data ?? []).filter((row) => Array.isArray(row));
  if (rows.length === 0) {
    throw new CsvImportError(`"${file.name}" does not contain any rows.`);
  }

  const headers = ensureUniqueHeaders(rows[0].map((h) => String(h ?? '')));
  const dataRows = rows.slice(1);

  // A trailing newline is not a transaction — drop those artefacts.
  while (dataRows.length > 0 && isRowBlank(dataRows[dataRows.length - 1])) {
    dataRows.pop();
  }

  if (dataRows.length > MAX_CSV_ROWS) {
    throw new CsvImportError(
      `"${file.name}" contains ${dataRows.length.toLocaleString('en-US')} rows. The maximum supported is ${MAX_CSV_ROWS.toLocaleString('en-US')} rows per import.`,
    );
  }

  const parseWarnings = (parsed.errors ?? [])
    .slice(0, 20)
    .map((error) => {
      const line = typeof error.row === 'number' ? `line ${error.row + 2}: ` : '';
      return `${line}${error.message}`;
    });

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    headers,
    rows: padRows(dataRows, headers.length),
    delimiter: parsed.meta?.delimiter ?? ',',
    parseWarnings,
  };
}

/* -------------------------------------------------------------------------- */
/*  Mapping + validation                                                      */
/* -------------------------------------------------------------------------- */

function isRowBlank(row: string[]): boolean {
  return row.every((cell) => !String(cell ?? '').trim());
}

function createTransactionId(rowNumber: number, seed: string): string {
  const random = Math.random().toString(36).slice(2, 7);
  return `csv-${seed}-${rowNumber}-${random}`;
}

function describeDefault(def: CsvColumnDefinition): string {
  if (def.defaultValue === null) return 'no value';
  if (['listingSplit', 'buyerSplit', 'brokerSplit', 'referralOut', 'commRate'].includes(def.key)) {
    return formatPercent(def.defaultValue);
  }
  return formatMoney(def.defaultValue);
}

/**
 * Turn a raw table + column mapping into validated transactions.
 * The mapping is applied for every row, so a user can correct a bad
 * auto-guess in the UI and re-validate instantly.
 */
export function validateCsvImport(
  table: CsvRawTable,
  mapping: CsvColumnMapping,
  options: { idSeed?: string } = {},
): CsvValidationResult {
  const missingRequired = getMissingRequiredColumns(mapping);
  const errors: CsvRowError[] = [];
  const warnings: CsvRowWarning[] = [];
  const transactions: Transaction[] = [];
  const fileWarnings: string[] = [];
  const seed = options.idSeed ?? Date.now().toString(36);

  if (missingRequired.length > 0) {
    const labels = missingRequired.map((key) => CSV_COLUMN_DEF_MAP[key].label).join(', ');
    return {
      transactions: [],
      errors: [],
      warnings: [],
      fileWarnings: [`Map the required column(s) first: ${labels}.`],
      totalRows: table.rows.length,
      skippedEmptyRows: 0,
      warningsTruncated: false,
    };
  }

  // One aggregated note per optional column that had to fall back to defaults.
  const defaultCounts = new Map<CsvColumnKey, number>();
  const skippedEmptyRowsTracker = { count: 0 };
  let warningsTruncated = false;

  table.rows.forEach((row, index) => {
    // +2 => 1 for zero-index, 1 because line 1 is the header row.
    const rowNumber = index + 2;

    if (isRowBlank(row)) {
      skippedEmptyRowsTracker.count += 1;
      return;
    }

    const addressRaw = (cellAt(row, table.headers, mapping.address) ?? '').trim();
    const addressForReport = addressRaw || `(row ${rowNumber})`;

    const issues: string[] = [];
    const draft: Record<string, unknown> = { address: addressRaw };

    for (const def of CSV_COLUMN_DEFS) {
      if (def.key === 'address') continue;

      const header = mapping[def.key];
      const cellRaw = cellAt(row, table.headers, header);
      const hasText = cellRaw !== null && String(cellRaw).trim() !== '';
      const parsed = parseNumericCell(cellRaw);

      if (parsed === null) {
        if (def.required) {
          // Required column: a blank or unparseable cell is a hard error.
          if (!hasText) {
            issues.push(`${def.label} is required but the cell is empty.`);
          } else {
            issues.push(`${def.label} "${String(cellRaw).trim()}" is not a valid number.`);
          }
          continue;
        }

        // Optional column: fall back to the documented default.
        draft[def.key] = def.defaultValue ?? 0;
        defaultCounts.set(def.key, (defaultCounts.get(def.key) ?? 0) + 1);

        // An entirely unmapped column is reported once at file level; only a
        // mapped-but-dirty cell deserves a per-row warning.
        if (!mapping[def.key]) continue;

        if (warnings.length < MAX_IMPORT_WARNINGS) {
          warnings.push({
            rowNumber,
            address: addressForReport,
            message: hasText
              ? `${def.label} "${String(cellRaw).trim()}" is not a valid number — defaulted to ${describeDefault(def)}.`
              : `${def.label} is empty — defaulted to ${describeDefault(def)}.`,
          });
        } else {
          warningsTruncated = true;
        }
        continue;
      }

      draft[def.key] = parsed;
    }

    if (issues.length > 0) {
      errors.push({ rowNumber, address: addressForReport, messages: issues });
      return;
    }

    const validated = csvTransactionDraftSchema.safeParse(draft);
    if (!validated.success) {
      errors.push({
        rowNumber,
        address: addressForReport,
        messages: Array.from(new Set(validated.error.issues.map((issue) => issue.message))),
      });
      return;
    }

    const value: CsvTransactionDraft = validated.data;
    transactions.push({
      id: createTransactionId(rowNumber, seed),
      address: value.address,
      salePrice: value.salePrice,
      commRate: value.commRate,
      listingSplit: value.listingSplit,
      buyerSplit: value.buyerSplit,
      brokerSplit: value.brokerSplit,
      referralOut: value.referralOut,
      referralIn: value.referralIn,
      transactionFee: value.transactionFee,
      actualPaid: value.actualPaid,
    });
  });

  // File-level notes for columns that were entirely absent.
  for (const [key, count] of defaultCounts) {
    const def = CSV_COLUMN_DEF_MAP[key];
    if (!mapping[key]) {
      fileWarnings.push(
        `${def.label} was not found in the file — ${describeDefault(def)} applied to ${count} row${count === 1 ? '' : 's'}.`,
      );
    }
  }

  if (table.parseWarnings.length > 0) {
    fileWarnings.push(
      `The file has ${table.parseWarnings.length} parsing note${table.parseWarnings.length === 1 ? '' : 's'} (e.g. rows with an unexpected number of columns).`,
    );
  }

  return {
    transactions,
    errors,
    warnings,
    fileWarnings,
    totalRows: table.rows.length,
    skippedEmptyRows: skippedEmptyRowsTracker.count,
    warningsTruncated,
  };
}

/* -------------------------------------------------------------------------- */
/*  CSV template                                                              */
/* -------------------------------------------------------------------------- */

/** The exact header row the importer documents for clients. */
export const CSV_TEMPLATE_HEADERS = CSV_COLUMN_DEFS.map((def) => def.label);

const CSV_TEMPLATE_EXAMPLE_ROW = [
  '742 Evergreen Terrace, Springfield',
  '450000',
  '6.0',
  '50',
  '50',
  '30',
  '0',
  '0',
  '250',
  '9200',
];

/** A ready-to-fill CSV template, generated with the same engine we import with. */
export function buildCsvTemplate(): string {
  return Papa.unparse([CSV_TEMPLATE_HEADERS, CSV_TEMPLATE_EXAMPLE_ROW], { newline: '\r\n' });
}

export const CSV_TEMPLATE_FILE_NAME = 'commission_audit_import_template.csv';
