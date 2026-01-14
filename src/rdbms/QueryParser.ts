import { ColumnDefinition, ColumnType, WhereClause, JoinClause } from './types';

export interface CreateTableQuery {
  type: 'CREATE_TABLE';
  tableName: string;
  columns: ColumnDefinition[];
}

export interface DropTableQuery {
  type: 'DROP_TABLE';
  tableName: string;
}

export interface InsertQuery {
  type: 'INSERT';
  tableName: string;
  columns?: string[];
  values: (string | number | boolean)[];
}

export interface SelectQuery {
  type: 'SELECT';
  columns: string[];
  from: string;
  where?: WhereClause[];
  join?: JoinClause;
}

export interface UpdateQuery {
  type: 'UPDATE';
  tableName: string;
  set: Record<string, string | number | boolean>;
  where?: WhereClause[];
}

export interface DeleteQuery {
  type: 'DELETE';
  from: string;
  where?: WhereClause[];
}

export interface ShowTablesQuery {
  type: 'SHOW_TABLES';
}

export interface DescribeTableQuery {
  type: 'DESCRIBE';
  tableName: string;
}

export type ParsedQuery =
  | CreateTableQuery
  | DropTableQuery
  | InsertQuery
  | SelectQuery
  | UpdateQuery
  | DeleteQuery
  | ShowTablesQuery
  | DescribeTableQuery;

export class QueryParser {
  parse(sql: string): ParsedQuery {
    const trimmed = sql.trim().replace(/;$/, '');
    const upperSQL = trimmed.toUpperCase();

    if (upperSQL.startsWith('CREATE TABLE')) {
      return this.parseCreateTable(trimmed);
    } else if (upperSQL.startsWith('DROP TABLE')) {
      return this.parseDropTable(trimmed);
    } else if (upperSQL.startsWith('INSERT INTO')) {
      return this.parseInsert(trimmed);
    } else if (upperSQL.startsWith('SELECT')) {
      return this.parseSelect(trimmed);
    } else if (upperSQL.startsWith('UPDATE')) {
      return this.parseUpdate(trimmed);
    } else if (upperSQL.startsWith('DELETE FROM')) {
      return this.parseDelete(trimmed);
    } else if (upperSQL === 'SHOW TABLES') {
      return { type: 'SHOW_TABLES' };
    } else if (upperSQL.startsWith('DESCRIBE') || upperSQL.startsWith('DESC')) {
      return this.parseDescribe(trimmed);
    }

    throw new Error(`Unsupported query: ${sql}`);
  }

  private parseCreateTable(sql: string): CreateTableQuery {
    // Accept multi-line column lists by using [\s\S]* to match across newlines
    const match = sql.match(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*)\)/i);
    if (!match) throw new Error('Invalid CREATE TABLE syntax');

    const tableName = match[1];
    // split on commas but tolerate newlines and extra spaces
    const columnDefs = match[2]
      .split(',')
      .map(def => def.trim())
      .filter(Boolean);

    const columns: ColumnDefinition[] = columnDefs.map(def => {
      // Basic tokenization; ignore inline DEFAULT clauses and constraints we don't fully support
      const parts = def.split(/\s+/);
      const name = parts[0];
      const rawType = parts[1] ? parts[1].toLowerCase() : 'string';

      // Map common SQL types to the simplified ColumnType used by the RDBMS
      let type: ColumnType;
      if (/^varchar\(/i.test(rawType) || /^char\(/i.test(rawType) || rawType === 'text' || /^timestamp/i.test(rawType)) {
        type = 'string';
      } else if (/^serial/i.test(rawType) || /^int(er)?$/i.test(rawType) || /^number$/i.test(rawType) || /^bigint/i.test(rawType)) {
        type = 'number';
      } else if (/^bool(ean)?$/i.test(rawType)) {
        type = 'boolean';
      } else {
        // default fallback
        type = 'string';
      }

      const column: ColumnDefinition = {
        name,
        type,
        nullable: true,
      };

      const upperDef = def.toUpperCase();
      if (upperDef.includes('PRIMARY KEY')) {
        column.primaryKey = true;
        column.nullable = false;
      }
      if (upperDef.includes('UNIQUE')) {
        column.unique = true;
      }
      if (upperDef.includes('NOT NULL')) {
        column.nullable = false;
      }

      return column;
    });

    return { type: 'CREATE_TABLE', tableName, columns };
  }

  private parseDropTable(sql: string): DropTableQuery {
    const match = sql.match(/DROP TABLE\s+(\w+)/i);
    if (!match) throw new Error('Invalid DROP TABLE syntax');

    return { type: 'DROP_TABLE', tableName: match[1] };
  }

  private parseInsert(sql: string): InsertQuery {
    const match = sql.match(/INSERT INTO\s+(\w+)\s*(?:\((.*?)\))?\s*VALUES\s*\((.*?)\)/i);
    if (!match) throw new Error('Invalid INSERT syntax');

    const tableName = match[1];
    const columns = match[2] ? match[2].split(',').map(c => c.trim()) : undefined;
    const valuesStr = match[3];

    const values = this.parseValues(valuesStr);

    return { type: 'INSERT', tableName, columns, values };
  }

  private parseSelect(sql: string): SelectQuery {
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(.*)/i);
    if (!selectMatch) throw new Error('Invalid SELECT syntax');

    const columnsStr = selectMatch[1].trim();
    const columns = columnsStr === '*' ? ['*'] : columnsStr.split(',').map(c => c.trim());
    const from = selectMatch[2];
    const rest = selectMatch[3].trim();

    let join: JoinClause | undefined;
    let where: WhereClause[] | undefined;

    const joinMatch = rest.match(/(?:INNER|LEFT)\s+JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
    if (joinMatch) {
      const joinType = rest.toUpperCase().includes('LEFT') ? 'LEFT' : 'INNER';
      join = {
        type: joinType,
        table: joinMatch[1],
        on: {
          leftColumn: `${joinMatch[2]}.${joinMatch[3]}`,
          rightColumn: `${joinMatch[4]}.${joinMatch[5]}`,
        },
      };
    }

    const whereMatch = rest.match(/WHERE\s+(.+?)(?:ORDER BY|GROUP BY|$)/i);
    if (whereMatch) {
      where = this.parseWhere(whereMatch[1]);
    }

    return { type: 'SELECT', columns, from, where, join };
  }

  private parseUpdate(sql: string): UpdateQuery {
    const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) throw new Error('Invalid UPDATE syntax');

    const tableName = match[1];
    const setClause = match[2];
    const whereClause = match[3];

    const set: Record<string, string | number | boolean> = {};
    setClause.split(',').forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim());
      set[key] = this.parseValue(value);
    });

    const where = whereClause ? this.parseWhere(whereClause) : undefined;

    return { type: 'UPDATE', tableName, set, where };
  }

  private parseDelete(sql: string): DeleteQuery {
    const match = sql.match(/DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) throw new Error('Invalid DELETE syntax');

    const from = match[1];
    const whereClause = match[2];

    const where = whereClause ? this.parseWhere(whereClause) : undefined;

    return { type: 'DELETE', from, where };
  }

  private parseDescribe(sql: string): DescribeTableQuery {
    const match = sql.match(/(?:DESCRIBE|DESC)\s+(\w+)/i);
    if (!match) throw new Error('Invalid DESCRIBE syntax');

    return { type: 'DESCRIBE', tableName: match[1] };
  }

  private parseWhere(whereClause: string): WhereClause[] {
    const conditions = whereClause.split(/\s+AND\s+/i);
    return conditions.map(condition => {
      const match = condition.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*(.+)/);
      if (!match) throw new Error(`Invalid WHERE condition: ${condition}`);

      return {
        column: match[1],
        operator: match[2] as WhereClause['operator'],
        value: this.parseValue(match[3]),
      };
    });
  }

  private parseValues(valuesStr: string): (string | number | boolean)[] {
    return valuesStr.split(',').map(v => this.parseValue(v.trim()));
  }

  private parseValue(value: string): string | number | boolean {
    value = value.trim();

    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }

    const num = Number(value);
    if (!isNaN(num)) return num;

    return value;
  }
}
