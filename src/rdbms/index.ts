export { RDBMS } from './RDBMS';
export { REPL } from './REPL';

export class Index {
  private index: Map<string | number | boolean, number[]>;

  constructor() {
    this.index = new Map();
  }

  add(value: string | number | boolean | null, rowIndex: number): void {
    if (value === null) return;

    const existing = this.index.get(value) || [];
    existing.push(rowIndex);
    this.index.set(value, existing);
  }

  remove(value: string | number | boolean | null, rowIndex: number): void {
    if (value === null) return;

    const existing = this.index.get(value);
    if (existing) {
      const filtered = existing.filter(idx => idx !== rowIndex);
      if (filtered.length === 0) {
        this.index.delete(value);
      } else {
        this.index.set(value, filtered);
      }
    }
  }

  find(value: string | number | boolean): number[] {
    return this.index.get(value) || [];
  }

  clear(): void {
    this.index.clear();
  }
}
