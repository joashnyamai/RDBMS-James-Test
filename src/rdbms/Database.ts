import { Table } from './Table';
import { TableSchema } from './types';

export class Database {
  private tables: Map<string, Table>;

  constructor() {
    this.tables = new Map();
  }

  createTable(schema: TableSchema): { success: boolean; error?: string } {
    if (this.tables.has(schema.name)) {
      return { success: false, error: `Table ${schema.name} already exists` };
    }

    const primaryKeys = schema.columns.filter(col => col.primaryKey);
    if (primaryKeys.length > 1) {
      return { success: false, error: 'Multiple primary keys not supported' };
    }

    if (primaryKeys.length === 1) {
      schema.primaryKey = primaryKeys[0].name;
    }

    this.tables.set(schema.name, new Table(schema));
    return { success: true };
  }

  dropTable(tableName: string): { success: boolean; error?: string } {
    if (!this.tables.has(tableName)) {
      return { success: false, error: `Table ${tableName} does not exist` };
    }

    this.tables.delete(tableName);
    return { success: true };
  }

  getTable(tableName: string): Table | undefined {
    return this.tables.get(tableName);
  }

  getTables(): string[] {
    return Array.from(this.tables.keys());
  }

  hasTable(tableName: string): boolean {
    return this.tables.has(tableName);
  }
}
