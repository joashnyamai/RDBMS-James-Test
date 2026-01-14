export type ColumnType = 'string' | 'number' | 'boolean';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  primaryKey?: boolean;
  unique?: boolean;
  nullable?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  primaryKey?: string;
}

export type Row = Record<string, string | number | boolean | null>;

export interface QueryResult {
  success: boolean;
  rows?: Row[];
  rowCount?: number;
  message?: string;
  error?: string;
}

export interface WhereClause {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
}

export interface JoinClause {
  type: 'INNER' | 'LEFT';
  table: string;
  on: {
    leftColumn: string;
    rightColumn: string;
  };
}
