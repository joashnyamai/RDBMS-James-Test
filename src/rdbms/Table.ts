import { Row, TableSchema, ColumnType } from './types';
import { Index } from './index';

export class Table {
  private rows: Row[];
  private schema: TableSchema;
  private indexes: Map<string, Index>;
  

  constructor(schema: TableSchema) {
    this.schema = schema;
    this.rows = [];
    this.indexes = new Map();

    this.schema.columns.forEach(col => {
      if (col.primaryKey || col.unique) {
        this.indexes.set(col.name, new Index());
      }
    });
  }

  getSchema(): TableSchema {
    return this.schema;
  }

  insert(row: Partial<Row>): { success: boolean; error?: string } {
    const newRow: Row = {};

    for (const col of this.schema.columns) {
      const value = row[col.name];

      if (value === undefined || value === null) {
        if (!col.nullable && !col.primaryKey) {
          return { success: false, error: `Column ${col.name} cannot be null` };
        }
        newRow[col.name] = null;
        continue;
      }

      if (!this.validateType(value, col.type)) {
        return { success: false, error: `Invalid type for column ${col.name}` };
      }

      if (col.unique || col.primaryKey) {
        const index = this.indexes.get(col.name);
        if (index && index.find(value).length > 0) {
          return { success: false, error: `Duplicate value for ${col.primaryKey ? 'primary key' : 'unique'} column ${col.name}` };
        }
      }

      newRow[col.name] = value;
    }

    const rowIndex = this.rows.length;
    this.rows.push(newRow);

    this.schema.columns.forEach(col => {
      if (col.primaryKey || col.unique) {
        const index = this.indexes.get(col.name);
        if (index && newRow[col.name] !== null) {
          index.add(newRow[col.name] as string | number | boolean, rowIndex);
        }
      }
    });

    return { success: true };
  }

  select(columns: string[] = []): Row[] {
    if (columns.length === 0 || columns[0] === '*') {
      return this.rows.map(row => ({ ...row }));
    }

    return this.rows.map(row => {
      const selected: Row = {};
      columns.forEach(col => {
        if (row.hasOwnProperty(col)) {
          selected[col] = row[col];
        }
      });
      return selected;
    });
  }

  update(updates: Partial<Row>, predicate: (row: Row) => boolean): number {
    let updatedCount = 0;

    this.rows.forEach((row, idx) => {
      if (predicate(row)) {
        for (const [key, value] of Object.entries(updates)) {
          const col = this.schema.columns.find(c => c.name === key);
          if (!col) continue;

          const v = value as string | number | boolean | null | undefined;
          if (v === undefined) continue;

          if (v !== null && !this.validateType(v, col.type)) {
            continue;
          }

          if ((col.unique || col.primaryKey) && v !== row[key]) {
            const index = this.indexes.get(key);
            if (index) {
              index.remove(row[key] as string | number | boolean | null, idx);
              index.add(v as string | number | boolean | null, idx);
            }
          }

          row[key] = v as any;
        }
        updatedCount++;
      }
    });

    return updatedCount;
  }

  delete(predicate: (row: Row) => boolean): number {
    const toDelete: number[] = [];

    this.rows.forEach((row, idx) => {
      if (predicate(row)) {
        toDelete.push(idx);
      }
    });

    toDelete.reverse().forEach(idx => {
      const row = this.rows[idx];
      this.schema.columns.forEach(col => {
        if (col.primaryKey || col.unique) {
          const index = this.indexes.get(col.name);
          if (index) {
            index.remove(row[col.name], idx);
          }
        }
      });
      this.rows.splice(idx, 1);
    });

    this.rebuildIndexes();

    return toDelete.length;
  }

  findByIndex(columnName: string, value: string | number | boolean): Row[] {
    const index = this.indexes.get(columnName);
    if (!index) return [];

    const rowIndexes = index.find(value);
    return rowIndexes.map(idx => ({ ...this.rows[idx] }));
  }

  private validateType(value: unknown, type: ColumnType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  private rebuildIndexes(): void {
    this.indexes.forEach(index => index.clear());

    this.rows.forEach((row, idx) => {
      this.schema.columns.forEach(col => {
        if (col.primaryKey || col.unique) {
          const index = this.indexes.get(col.name);
          if (index && row[col.name] !== null) {
            index.add(row[col.name] as string | number | boolean, idx);
          }
        }
      });
    });
  }
}
