import { Database } from './Database';
import { QueryParser } from './QueryParser';
import { QueryExecutor } from './QueryExecutor';
import { QueryResult } from './types';

export class RDBMS {
  private database: Database;
  private parser: QueryParser;
  private executor: QueryExecutor;

  constructor() {
    this.database = new Database();
    this.parser = new QueryParser();
    this.executor = new QueryExecutor(this.database);
  }

  query(sql: string): QueryResult {
    try {
      const parsed = this.parser.parse(sql);
      return this.executor.execute(parsed);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getDatabase(): Database {
    return this.database;
  }
}
