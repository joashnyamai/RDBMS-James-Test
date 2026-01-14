import { RDBMS } from './RDBMS';
import { QueryResult, Row } from './types';

export class REPL {
  private rdbms: RDBMS;
  private history: string[];

  constructor(rdbms: RDBMS) {
    this.rdbms = rdbms;
    this.history = [];
  }

  execute(sql: string): string {
    if (!sql.trim()) {
      return '';
    }

    this.history.push(sql);

    const result = this.rdbms.query(sql);
    return this.formatResult(result);
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  private formatResult(result: QueryResult): string {
    if (!result.success) {
      return `ERROR: ${result.error}`;
    }

    if (result.message) {
      return result.message;
    }

    if (result.rows && result.rows.length > 0) {
      return this.formatTable(result.rows);
    }

    if (result.rows && result.rows.length === 0) {
      return 'Empty result set';
    }

    return 'OK';
  }

  private formatTable(rows: Row[]): string {
    if (rows.length === 0) return 'Empty result set';

    const columns = Object.keys(rows[0]);
    const columnWidths: number[] = columns.map(col =>
      Math.max(col.length, ...rows.map(row => String(row[col] ?? 'NULL').length))
    );

    const separator = '+' + columnWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    const header =
      '|' +
      columns.map((col, i) => ` ${col.padEnd(columnWidths[i])} `).join('|') +
      '|';

    const rowStrings = rows.map(
      row =>
        '|' +
        columns
          .map((col, i) => ` ${String(row[col] ?? 'NULL').padEnd(columnWidths[i])} `)
          .join('|') +
        '|'
    );

    return [separator, header, separator, ...rowStrings, separator, `${rows.length} row(s)`].join(
      '\n'
    );
  }
}
