/**
 * Verification harness for the CSV import engine.
 *
 *   npx tsx scripts/verify-csv-import.ts
 *
 * Covers header auto-mapping, manual mapping, cell coercion, error reporting,
 * file-size/extension guards, the downloadable template and the TSV path.
 */

import { File as NodeFile } from 'node:buffer';

import {
  CSV_TEMPLATE_HEADERS,
  CsvImportError,
  autoMapColumns,
  buildCsvTemplate,
  didMappingMatchExactly,
  getMissingRequiredColumns,
  parseCsvFile,
  parseNumericCell,
  validateCsvImport,
} from '../lib/commission-audit/csv';
import type { CsvColumnMapping } from '../types/commission-audit';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(condition: unknown, message: string): void {
  if (!condition) throw new Error(message || 'assertion failed');
}

function eq<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed += 1;
    console.log(`  \u2713 ${name}`);
  } catch (error) {
    failed += 1;
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${message}`);
    console.log(`  \u2717 ${name}\n      ${message}`);
  }
}

/**
 * Node's `File` (undici) lacks the DOM-only `webkitRelativePath` property, so we
 * cast to the browser `File` type the production code consumes.
 */
function nodeFile(parts: BlobPart[], name: string): File {
  return new NodeFile(parts as never[], name, { type: 'text/csv' }) as unknown as File;
}

function csvFile(content: string, name = 'test.csv'): File {
  return nodeFile([content], name);
}

const SPEC_HEADERS =
  'Property Address,Sale Price,Total Commission Rate,Listing Agent Split,Buyer Agent Split,Brokerage Split,Referral Fee Out,Referral Fee In,Transaction Fee,Actual Amount Paid';

function specRow(...values: string[]): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return values.map(quote).join(',');
}

async function main(): Promise<void> {
  console.log('\nCSV import engine — verification\n');

  /* ------------------------------------------------------------------ */
  console.log('parseNumericCell');

  await test('parses plain numbers', () => {
    eq(parseNumericCell('450000'), 450000, 'plain');
    eq(parseNumericCell('6.5'), 6.5, 'decimal');
  });

  await test('strips currency symbols, thousands separators and percent signs', () => {
    eq(parseNumericCell('$1,250.00'), 1250, 'dollar formatted');
    eq(parseNumericCell('  $ 450,000.50  '), 450000.5, 'spaced');
    eq(parseNumericCell('6%'), 6, 'percent');
    eq(parseNumericCell('$9,200'), 9200, 'no decimals');
  });

  await test('reads accounting negatives in parentheses', () => {
    eq(parseNumericCell('(250)'), -250, 'parentheses');
    eq(parseNumericCell('($1,000.00)'), -1000, 'parentheses dollars');
  });

  await test('returns null for blanks and non-numeric text', () => {
    eq(parseNumericCell(''), null, 'empty');
    eq(parseNumericCell('   '), null, 'spaces');
    eq(parseNumericCell('N/A'), null, 'N/A');
    eq(parseNumericCell('-'), null, 'dash');
    eq(parseNumericCell(null), null, 'null');
    eq(parseNumericCell(undefined), null, 'undefined');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nautoMapColumns');

  await test('maps the documented header set exactly', () => {
    const headers = SPEC_HEADERS.split(',');
    const mapping = autoMapColumns(headers);
    eq(mapping.address, 'Property Address', 'address');
    eq(mapping.salePrice, 'Sale Price', 'salePrice');
    eq(mapping.commRate, 'Total Commission Rate', 'commRate');
    eq(mapping.listingSplit, 'Listing Agent Split', 'listingSplit');
    eq(mapping.buyerSplit, 'Buyer Agent Split', 'buyerSplit');
    eq(mapping.brokerSplit, 'Brokerage Split', 'brokerSplit');
    eq(mapping.referralOut, 'Referral Fee Out', 'referralOut');
    eq(mapping.referralIn, 'Referral Fee In', 'referralIn');
    eq(mapping.transactionFee, 'Transaction Fee', 'transactionFee');
    eq(mapping.actualPaid, 'Actual Amount Paid', 'actualPaid');
    eq(getMissingRequiredColumns(mapping).length, 0, 'nothing missing');
    eq(didMappingMatchExactly(mapping), true, 'exact match');
  });

  await test('maps the snake_case header set exactly', () => {
    const headers = [
      'address',
      'sale_price',
      'commission_rate',
      'listing_split',
      'buyer_split',
      'brokerage_split',
      'referral_out',
      'referral_in',
      'transaction_fee',
      'actual_paid',
    ];
    const mapping = autoMapColumns(headers);
    eq(mapping.commRate, 'commission_rate', 'commRate');
    eq(mapping.brokerSplit, 'brokerage_split', 'brokerSplit');
    eq(mapping.actualPaid, 'actual_paid', 'actualPaid');
    eq(getMissingRequiredColumns(mapping).length, 0, 'nothing missing');
    eq(didMappingMatchExactly(mapping), true, 'exact match');
  });

  await test('is case/space/symbol insensitive and handles decorated headers', () => {
    const headers = [
      'PROPERTY ADDRESS',
      'Sale Price (USD)',
      'Total Commission Rate (%)',
      'Listing Agent Split %',
      'Buyer Agent Split %',
      'Brokerage Split %',
      'Referral Fee Out %',
      'Referral Fee In',
      'Transaction Fee ($)',
      'Actual Amount Paid ($)',
    ];
    const mapping = autoMapColumns(headers);
    eq(getMissingRequiredColumns(mapping).length, 0, 'required columns all mapped');
    eq(mapping.salePrice, 'Sale Price (USD)', 'salePrice');
    eq(didMappingMatchExactly(mapping), true, 'all decorated headers are known aliases');
  });

  await test('does not reuse a single column for two fields', () => {
    const mapping = autoMapColumns(['Address', 'Price', 'Rate']);
    const used = Object.values(mapping).filter(Boolean);
    eq(new Set(used).size, used.length, 'no duplicate assignment');
  });

  await test('reports required columns it cannot find', () => {
    const mapping = autoMapColumns(['Foo', 'Bar', 'Baz']);
    const missing = getMissingRequiredColumns(mapping);
    check(missing.includes('address'), 'address reported missing');
    check(missing.includes('salePrice'), 'salePrice reported missing');
    check(missing.includes('commRate'), 'commRate reported missing');
    check(missing.includes('actualPaid'), 'actualPaid reported missing');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nparseCsvFile');

  await test('parses BOM + CRLF + quoted commas + embedded newline', async () => {
    const content =
      '\uFEFF' +
      SPEC_HEADERS +
      '\r\n' +
      specRow('742 Evergreen Terrace, Springfield', '450000', '6', '50', '50', '30', '0', '0', '250', '9200') +
      '\r\n' +
      specRow('Suite 100,\r\n100 Ocean Drive', '850000', '5', '60', '40', '20', '25', '0', '400', '14900') +
      '\r\n';

    const table = await parseCsvFile(csvFile(content, 'with-quotes.csv'));
    eq(table.headers.length, 10, 'header count');
    eq(table.headers[0], 'Property Address', 'BOM stripped from first header');
    eq(table.rows.length, 2, 'data row count');
    eq(table.rows[1][0], 'Suite 100,\r\n100 Ocean Drive', 'embedded newline preserved');
    eq(table.delimiter, ',', 'delimiter detected');
  });

  await test('auto-detects tab delimited files', async () => {
    const content = `${CSV_TEMPLATE_HEADERS.join('\t')}\n${[
      '1 Main St',
      '300000',
      '6',
      '50',
      '50',
      '30',
      '0',
      '0',
      '0',
      '8000',
    ].join('\t')}\n`;
    const table = await parseCsvFile(csvFile(content, 'tabs.tsv'));
    eq(table.delimiter, '\t', 'tab delimiter');
    eq(table.rows.length, 1, 'row count');
  });

  await test('deduplicates repeated header names', async () => {
    const table = await parseCsvFile(
      csvFile('Address,Price,Price,Rate,Actual Paid\n1 Main St,1,2,3,4\n', 'dupes.csv'),
    );
    eq(table.headers[2], 'Price (2)', 'second Price renamed');
  });

  await test('rejects files larger than 5 MB', async () => {
    const big = nodeFile([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.csv');
    let threw: unknown = null;
    try {
      await parseCsvFile(big);
    } catch (error) {
      threw = error;
    }
    check(threw instanceof CsvImportError, 'expected CsvImportError');
    check(/5 MB/.test((threw as Error).message), 'message mentions the 5 MB limit');
  });

  await test('rejects non-CSV extensions', async () => {
    let threw: unknown = null;
    try {
      await parseCsvFile(csvFile('a,b\n1,2', 'book.xlsx'));
    } catch (error) {
      threw = error;
    }
    check(threw instanceof CsvImportError, 'expected CsvImportError');
  });

  await test('rejects empty files', async () => {
    let threw: unknown = null;
    try {
      await parseCsvFile(csvFile('   \n  ', 'blank.csv'));
    } catch (error) {
      threw = error;
    }
    check(threw instanceof CsvImportError, 'expected CsvImportError');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nvalidateCsvImport — happy path');

  const happyCsv =
    SPEC_HEADERS +
    '\n' +
    specRow('742 Evergreen Terrace, Springfield', '$450,000.00', '6', '50', '50', '30', '0', '0', '$250', '$9,200.00') +
    '\n' +
    specRow('100 Ocean Drive, Miami Beach, FL', '850000', '5.0', '60', '40', '20', '25', '0', '400', '14900') +
    '\n' +
    specRow('350 5th Avenue, Suite 12B, New York, NY', '950000', '6.0', '50', '50', '30', '0', '3500', '350', '19600') +
    '\n';

  await test('imports every valid row with correctly coerced numbers', async () => {
    const table = await parseCsvFile(csvFile(happyCsv, 'happy.csv'));
    const mapping = autoMapColumns(table.headers);
    const result = validateCsvImport(table, mapping, { idSeed: 'test' });

    eq(result.transactions.length, 3, 'transaction count');
    eq(result.errors.length, 0, 'no errors');
    eq(result.totalRows, 3, 'total rows');

    const first = result.transactions[0];
    eq(first.address, '742 Evergreen Terrace, Springfield', 'address');
    eq(first.salePrice, 450000, 'salePrice');
    eq(first.commRate, 6, 'commRate');
    eq(first.listingSplit, 50, 'listingSplit');
    eq(first.buyerSplit, 50, 'buyerSplit');
    eq(first.brokerSplit, 30, 'brokerSplit');
    eq(first.referralOut, 0, 'referralOut');
    eq(first.referralIn, 0, 'referralIn');
    eq(first.transactionFee, 250, 'transactionFee');
    eq(first.actualPaid, 9200, 'actualPaid');

    const ids = result.transactions.map((t) => t.id);
    eq(new Set(ids).size, 3, 'ids are unique');
    check(ids.every((id) => id.startsWith('csv-')), 'ids are prefixed');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nvalidateCsvImport — error reporting');

  const mixedCsv =
    SPEC_HEADERS +
    '\n' +
    specRow('1 Valid Way', '400000', '6', '50', '50', '30', '0', '0', '250', '9000') +
    '\n' +
    specRow('', '500000', '6', '50', '50', '30', '0', '0', '250', '9000') +
    '\n' +
    specRow('2 Broken Way', 'not-a-number', '6', '50', '50', '30', '0', '0', '250', '9000') +
    '\n' +
    specRow('3 Zero Way', '0', '6', '50', '50', '30', '0', '0', '250', '9000') +
    '\n' +
    specRow('4 Negative Fee Way', '500000', '6', '50', '50', '30', '0', '0', '-250', '9000') +
    '\n' +
    '\n' +
    specRow('5 Good Way', '600000', '5.5', '50', '50', '25', '10', '0', '395', '15000') +
    '\n';

  await test('imports valid rows and reports each failing row with a reason', async () => {
    const table = await parseCsvFile(csvFile(mixedCsv, 'mixed.csv'));
    const mapping = autoMapColumns(table.headers);
    const result = validateCsvImport(table, mapping, { idSeed: 'test' });

    eq(result.transactions.length, 2, 'valid rows imported');
    eq(result.errors.length, 4, 'failing rows reported');
    eq(result.skippedEmptyRows, 1, 'blank line skipped');

    eq(result.errors[0].rowNumber, 3, 'missing address row number');
    check(/Property Address is required/i.test(result.errors[0].messages.join(' ')), 'address reason');

    eq(result.errors[1].rowNumber, 4, 'bad sale price row number');
    check(/not a valid number/i.test(result.errors[1].messages.join(' ')), 'sale price reason');

    eq(result.errors[2].rowNumber, 5, 'zero sale price row number');
    check(/greater than \$0\.00/i.test(result.errors[2].messages.join(' ')), 'zero price reason');

    eq(result.errors[3].rowNumber, 6, 'negative fee row number');
    check(/cannot be negative/i.test(result.errors[3].messages.join(' ')), 'negative fee reason');

    eq(result.errors[0].address, '(row 3)', 'address placeholder for reporting');
  });

  await test('rejects out-of-range percentages', async () => {
    const content =
      SPEC_HEADERS +
      '\n' +
      specRow('9 Out Of Range Way', '500000', '150', '50', '50', '30', '0', '0', '0', '9000') +
      '\n';
    const table = await parseCsvFile(csvFile(content, 'range.csv'));
    const result = validateCsvImport(table, autoMapColumns(table.headers), { idSeed: 'test' });
    eq(result.transactions.length, 0, 'row rejected');
    eq(result.errors.length, 1, 'one error');
    check(/cannot be greater than 100/i.test(result.errors[0].messages.join(' ')), 'range reason');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nvalidateCsvImport — optional columns and manual mapping');

  await test('applies documented defaults and records a file-level warning', async () => {
    const content =
      'Property Address,Sale Price,Total Commission Rate,Actual Amount Paid\n' +
      '1 Main St,300000,6,7500\n' +
      '2 Main St,400000,6,10000\n';
    const table = await parseCsvFile(csvFile(content, 'sparse.csv'));
    const mapping = autoMapColumns(table.headers);
    const result = validateCsvImport(table, mapping, { idSeed: 'test' });

    eq(result.transactions.length, 2, 'both rows imported');
    eq(result.transactions[0].listingSplit, 50, 'listing split defaulted');
    eq(result.transactions[0].buyerSplit, 50, 'buyer split defaulted');
    eq(result.transactions[0].brokerSplit, 30, 'brokerage split defaulted');
    eq(result.transactions[0].transactionFee, 0, 'fee defaulted');
    check(
      result.fileWarnings.some((warning) => /Listing Agent Split was not found/.test(warning)),
      'file warning names the missing column',
    );
    eq(result.warnings.length, 0, 'unmapped columns do not spam row-level warnings');
  });

  await test('flags a single unparseable optional cell without failing the row', async () => {
    const content =
      'Property Address,Sale Price,Total Commission Rate,Actual Amount Paid,Brokerage Split\n' +
      '1 Main St,300000,6,7500,N/A\n';
    const table = await parseCsvFile(csvFile(content, 'dirty-cell.csv'));
    const result = validateCsvImport(table, autoMapColumns(table.headers), { idSeed: 'test' });

    eq(result.transactions.length, 1, 'row still imports');
    eq(result.transactions[0].brokerSplit, 30, 'falls back to the default');
    eq(result.warnings.length, 1, 'one row warning');
    check(/not a valid number/.test(result.warnings[0].message), 'warning explains the fallback');
  });

  await test('supports fully manual mapping of unrecognisable headers', async () => {
    const content =
      'Col A,Col B,Col C,Col D,Col E,Col F,Col G,Col H,Col I,Col J\n' +
      '5 Custom Ct,700000,6,50,50,30,0,0,500,18000\n';
    const table = await parseCsvFile(csvFile(content, 'manual.csv'));

    const auto = autoMapColumns(table.headers);
    check(getMissingRequiredColumns(auto).length > 0, 'auto-mapping cannot guess these headers');

    const blocked = validateCsvImport(table, auto, { idSeed: 'test' });
    eq(blocked.transactions.length, 0, 'import blocked while unmapped');
    check(/Map the required column/i.test(blocked.fileWarnings.join(' ')), 'blocked reason shown');

    const manual: CsvColumnMapping = {
      address: 'Col A',
      salePrice: 'Col B',
      commRate: 'Col C',
      listingSplit: 'Col D',
      buyerSplit: 'Col E',
      brokerSplit: 'Col F',
      referralOut: 'Col G',
      referralIn: 'Col H',
      transactionFee: 'Col I',
      actualPaid: 'Col J',
    };
    const result = validateCsvImport(table, manual, { idSeed: 'test' });
    eq(result.transactions.length, 1, 'row imported after manual mapping');
    eq(result.transactions[0].address, '5 Custom Ct', 'address from manual mapping');
    eq(result.transactions[0].actualPaid, 18000, 'actual paid from manual mapping');
    eq(result.transactions[0].transactionFee, 500, 'fee from manual mapping');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nTemplate round trip');

  await test('the downloadable template imports cleanly', async () => {
    eq(CSV_TEMPLATE_HEADERS.length, 10, 'template has ten columns');
    const table = await parseCsvFile(csvFile(buildCsvTemplate(), 'template.csv'));
    eq(table.headers.join('|'), CSV_TEMPLATE_HEADERS.join('|'), 'template headers match canonical labels');
    const result = validateCsvImport(table, autoMapColumns(table.headers), { idSeed: 'test' });
    eq(result.transactions.length, 1, 'example row imports');
    eq(result.transactions[0].salePrice, 450000, 'example sale price');
  });

  /* ------------------------------------------------------------------ */
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach((failure) => console.log(`  - ${failure}`));
    process.exitCode = 1;
  }
}

void main();
