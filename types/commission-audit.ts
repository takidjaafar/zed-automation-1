/**
 * Shared types for the Zed Automation "Commission Audit & Leakage Detector" module.
 *
 * Everything that is shared between the page shell, the calculation engine,
 * the CSV importer and the report generators lives here so that a single
 * source of truth is used across the module.
 */

/* -------------------------------------------------------------------------- */
/*  Core domain model                                                         */
/* -------------------------------------------------------------------------- */

/** A single audited real-estate transaction. */
export interface Transaction {
  id: string;
  address: string;
  salePrice: number;
  /** Total commission rate as a percentage, e.g. 6 means 6%. */
  commRate: number;
  /** Listing-side split as a percentage of total commission. */
  listingSplit: number;
  /** Buyer-side split as a percentage of total commission. */
  buyerSplit: number;
  /** Brokerage cut as a percentage of the amount left after referrals. */
  brokerSplit: number;
  /** Outgoing referral fee as a percentage of the listing-side commission. */
  referralOut: number;
  /** Incoming referral fee (currency) that is still expected/outstanding. */
  referralIn: number;
  /** Flat transaction/admin fee charged to the agent. */
  transactionFee: number;
  /** What the brokerage actually paid the agent for this deal. */
  actualPaid: number;
}

export type AuditStatus = 'overpaid' | 'underpaid' | 'correct';

/** The full result of running the audit formula over one transaction. */
export interface AuditResult {
  totalCommission: number;
  listingCommission: number;
  buyerCommission: number;
  referralFeeOutAmount: number;
  amountAfterReferral: number;
  brokerageCut: number;
  expectedAgentPayment: number;
  /** actualPaid - expectedAgentPayment. Positive means the broker overpaid. */
  discrepancy: number;
  status: AuditStatus;
  statusText: string;
  hasMissingReferral: boolean;
}

export type AuditFilter =
  | 'all'
  | 'discrepancy'
  | 'overpaid'
  | 'underpaid'
  | 'referral';

/* -------------------------------------------------------------------------- */
/*  CSV import                                                                */
/* -------------------------------------------------------------------------- */

/** Canonical columns the importer understands. */
export type CsvColumnKey =
  | 'address'
  | 'salePrice'
  | 'commRate'
  | 'listingSplit'
  | 'buyerSplit'
  | 'brokerSplit'
  | 'referralOut'
  | 'referralIn'
  | 'transactionFee'
  | 'actualPaid';

export const CSV_COLUMN_KEYS: CsvColumnKey[] = [
  'address',
  'salePrice',
  'commRate',
  'listingSplit',
  'buyerSplit',
  'brokerSplit',
  'referralOut',
  'referralIn',
  'transactionFee',
  'actualPaid',
];

/** Extra metadata about a canonical column (label, aliases, defaults). */
export interface CsvColumnDefinition {
  key: CsvColumnKey;
  label: string;
  /** Header names that are matched exactly (after normalisation). */
  aliases: string[];
  /** Substrings used for a looser "contains" match when exact match fails. */
  fuzzyTokens: string[];
  /** A row cannot be imported when this column is unmapped/empty. */
  required: boolean;
  /** Value used when the column is optional and not present in the file. */
  defaultValue: number | null;
  hint: string;
}

/**
 * Maps a canonical column to the header name found in the uploaded file.
 * `null` means "not mapped" (either the header is missing or the user cleared it).
 */
export type CsvColumnMapping = Record<CsvColumnKey, string | null>;

/** Raw, untouched result of reading the uploaded file. */
export interface CsvRawTable {
  fileName: string;
  fileSizeBytes: number;
  /** First non-empty row of the file. */
  headers: string[];
  /** Data rows, one string-array per line, aligned to `headers` by index. */
  rows: string[][];
  /** Delimiter PapaParse auto-detected. */
  delimiter: string;
  /** Non-fatal issues reported by PapaParse (ragged rows etc.). */
  parseWarnings: string[];
}

/** A single row that failed validation, with a human readable reason. */
export interface CsvRowError {
  /** 1-based line number in the original file (includes the header line). */
  rowNumber: number;
  /** Best-effort address so the user can find the row. */
  address: string;
  messages: string[];
}

/** A non-fatal observation about an imported row (e.g. a defaulted column). */
export interface CsvRowWarning {
  rowNumber: number;
  address: string;
  message: string;
}

/** Outcome of mapping + validating a raw CSV table. */
export interface CsvValidationResult {
  transactions: Transaction[];
  errors: CsvRowError[];
  warnings: CsvRowWarning[];
  /** Notes that apply to the whole file (missing columns, delimiter issues…). */
  fileWarnings: string[];
  /** Number of data rows seen in the file (excluding the header row). */
  totalRows: number;
  /** Data rows that were skipped because every mapped cell was blank. */
  skippedEmptyRows: number;
  /** True when `warnings` was capped to keep the UI responsive. */
  warningsTruncated: boolean;
}

/** Aggregate counters surfaced in the success banner. */
export interface CsvImportSummary {
  imported: number;
  failed: number;
  /** Number of rows that used a defaulted/dirty optional cell. */
  warnings: number;
  totalRows: number;
  /** File-level notes (missing columns, parsing notes) kept for the success screen. */
  notes: string[];
}

/* -------------------------------------------------------------------------- */
/*  Client portal (multi-client support)                                      */
/* -------------------------------------------------------------------------- */

/** A brokerage that the tool is audited for. */
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp of the last edit. */
  updatedAt: string;
  notes?: string;
}

/**
 * One audit run for one client.
 *
 * Persisted in localStorage under `audit_[clientId]_[auditId]` so every audit
 * is stored separately per client.
 */
export interface AuditRecord {
  id: string;
  clientId: string;
  name: string;
  /** ISO `yyyy-MM-dd` — the period this audit covers. */
  periodStart: string;
  periodEnd: string;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp of the last transaction change. */
  updatedAt: string;
  transactions: Transaction[];
}

/** Rolled-up view of one audit, used by the client audit history list. */
export interface AuditHistoryEntry {
  id: string;
  clientId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
  transactionCount: number;
  totalOverpaid: number;
  totalUnderpaid: number;
  totalMissingReferral: number;
  netDiscrepancy: number;
  discrepancyCount: number;
}

/** A client plus every audit on file for them. */
export interface ClientWithHistory extends Client {
  history: AuditHistoryEntry[];
  /** Total transactions across all of the client's audits. */
  transactionCount: number;
}

/** Result of booting the workspace from localStorage. */
export interface WorkspaceBootstrap {
  clients: Client[];
  activeClientId: string | null;
  /** True when legacy single-list records were migrated into a client audit. */
  migratedLegacyRecords: boolean;
  /** True when storage is unavailable (SSR or a browser that blocks localStorage). */
  storageUnavailable: boolean;
}
