import { Database } from './Database';
import { QueryResult, Row, WhereClause } from './types';
import {
  ParsedQuery,
  CreateTableQuery,
  InsertQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
} from './QueryParser';

export class QueryExecutor {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  execute(query: ParsedQuery): QueryResult {
    try {
      switch (query.type) {
        case 'CREATE_TABLE':
          return this.executeCreateTable(query);
        case 'DROP_TABLE':
          return this.executeDropTable(query);
        case 'INSERT':
          return this.executeInsert(query);
        case 'SELECT':
          return this.executeSelect(query);
        case 'UPDATE':
          return this.executeUpdate(query);
        case 'DELETE':
          return this.executeDelete(query);
        case 'SHOW_TABLES':
          return this.executeShowTables();
        case 'DESCRIBE':
          return this.executeDescribe(query);
        default:
          return { success: false, error: 'Unknown query type' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private executeCreateTable(query: CreateTableQuery): QueryResult {
    const result = this.database.createTable({
      name: query.tableName,
      columns: query.columns,
    });

    if (result.success) {
      return { success: true, message: `Table ${query.tableName} created` };
    }
    return { success: false, error: result.error };
  }

  private executeDropTable(query: { tableName: string }): QueryResult {
    const result = this.database.dropTable(query.tableName);

    if (result.success) {
      return { success: true, message: `Table ${query.tableName} dropped` };
    }
    return { success: false, error: result.error };
  }

  private executeInsert(query: InsertQuery): QueryResult {
    const table = this.database.getTable(query.tableName);
    if (!table) {
      return { success: false, error: `Table ${query.tableName} does not exist` };
    }

    const schema = table.getSchema();
    const row: Record<string, string | number | boolean> = {};

    if (query.columns) {
      query.columns.forEach((col, idx) => {
        row[col] = query.values[idx];
      });
    } else {
      schema.columns.forEach((col, idx) => {
        row[col.name] = query.values[idx];
      });
    }

    const result = table.insert(row);

    if (result.success) {
      return { success: true, message: '1 row inserted', rowCount: 1 };
    }
    return { success: false, error: result.error };
  }

  private executeSelect(query: SelectQuery): QueryResult {
    const table = this.database.getTable(query.from);
    if (!table) {
      return { success: false, error: `Table ${query.from} does not exist` };
    }

    let rows = table.select(query.columns);

    if (query.where) {
      rows = this.filterRows(rows, query.where);
    }

    if (query.join) {
      const joinTable = this.database.getTable(query.join.table);
      if (!joinTable) {
        return { success: false, error: `Join table ${query.join.table} does not exist` };
      }

      rows = this.executeJoin(rows, joinTable.select(), query.join, query.from, query.join.table);
    }

    return { success: true, rows, rowCount: rows.length };
  }

  private executeUpdate(query: UpdateQuery): QueryResult {
    const table = this.database.getTable(query.tableName);
    if (!table) {
      return { success: false, error: `Table ${query.tableName} does not exist` };
    }

    const predicate = query.where
      ? (row: Row) => this.evaluateWhere(row, query.where!)
      : () => true;

    const count = table.update(query.set, predicate);

    return { success: true, message: `${count} row(s) updated`, rowCount: count };
  }

  private executeDelete(query: DeleteQuery): QueryResult {
    const table = this.database.getTable(query.from);
    if (!table) {
      return { success: false, error: `Table ${query.from} does not exist` };
    }

    const predicate = query.where
      ? (row: Row) => this.evaluateWhere(row, query.where!)
      : () => true;

    const count = table.delete(predicate);

    return { success: true, message: `${count} row(s) deleted`, rowCount: count };
  }

  private executeShowTables(): QueryResult {
    const tables = this.database.getTables();
    const rows = tables.map(name => ({ table_name: name }));

    return { success: true, rows, rowCount: rows.length };
  }

  private executeDescribe(query: { tableName: string }): QueryResult {
    const table = this.database.getTable(query.tableName);
    if (!table) {
      return { success: false, error: `Table ${query.tableName} does not exist` };
    }

    const schema = table.getSchema();
    const rows = schema.columns.map(col => ({
      column: col.name,
      type: col.type,
      nullable: col.nullable ? 'YES' : 'NO',
      key: col.primaryKey ? 'PRI' : col.unique ? 'UNI' : '',
    }));

    return { success: true, rows, rowCount: rows.length };
  }

  private filterRows(rows: Row[], where: WhereClause[]): Row[] {
    return rows.filter(row => this.evaluateWhere(row, where));
  }

  private evaluateWhere(row: Row, conditions: WhereClause[]): boolean {
    return conditions.every(condition => {
      const rowValue = row[condition.column];
      const condValue = condition.value;

      switch (condition.operator) {
        case '=':
          return rowValue === condValue;
        case '!=':
          return rowValue !== condValue;
        case '>':
          return (rowValue as number) > (condValue as number);
        case '<':
          return (rowValue as number) < (condValue as number);
        case '>=':
          return (rowValue as number) >= (condValue as number);
        case '<=':
          return (rowValue as number) <= (condValue as number);
        default:
          return false;
      }
    });
  }

  private executeJoin(
    leftRows: Row[],
    rightRows: Row[],
    join: { type: 'INNER' | 'LEFT'; on: { leftColumn: string; rightColumn: string } },
    leftTableName: string,
    rightTableName: string
  ): Row[] {
    const result: Row[] = [];

    const [, leftCol] = join.on.leftColumn.split('.');
    const [, rightCol] = join.on.rightColumn.split('.');

    for (const leftRow of leftRows) {
      let matched = false;

      for (const rightRow of rightRows) {
        if (leftRow[leftCol] === rightRow[rightCol]) {
          matched = true;
          const joinedRow: Row = {};

          Object.entries(leftRow).forEach(([key, value]) => {
            joinedRow[`${leftTableName}.${key}`] = value;
          });

          Object.entries(rightRow).forEach(([key, value]) => {
            joinedRow[`${rightTableName}.${key}`] = value;
          });

          result.push(joinedRow);
        }
      }

      if (!matched && join.type === 'LEFT') {
        const joinedRow: Row = {};

        Object.entries(leftRow).forEach(([key, value]) => {
          joinedRow[`${leftTableName}.${key}`] = value;
        });

        result.push(joinedRow);
      }
    }

    return result;
  }
}
