import { useState, useEffect } from 'react';
import { RDBMS, REPL } from './rdbms';
import { SQLConsole } from './components/SQLConsole';
import { BookManager } from './components/BookManager';
import { Database } from 'lucide-react';

const rdbms = new RDBMS();
const repl = new REPL(rdbms);

function initializeDatabase() {
  rdbms.query(
    'CREATE TABLE authors (id number PRIMARY KEY, name string NOT NULL, country string NOT NULL)'
  );

  rdbms.query(
    'CREATE TABLE books (id number PRIMARY KEY, title string NOT NULL, author_id number NOT NULL, year number NOT NULL, available boolean NOT NULL)'
  );

  rdbms.query("INSERT INTO authors (id, name, country) VALUES (1, 'George Orwell', 'UK')");
  rdbms.query("INSERT INTO authors (id, name, country) VALUES (2, 'Jane Austen', 'UK')");
  rdbms.query("INSERT INTO authors (id, name, country) VALUES (3, 'Mark Twain', 'USA')");

  rdbms.query(
    "INSERT INTO books (id, title, author_id, year, available) VALUES (1, '1984', 1, 1949, true)"
  );
  rdbms.query(
    "INSERT INTO books (id, title, author_id, year, available) VALUES (2, 'Animal Farm', 1, 1945, true)"
  );
  rdbms.query(
    "INSERT INTO books (id, title, author_id, year, available) VALUES (3, 'Pride and Prejudice', 2, 1813, true)"
  );
  rdbms.query(
    "INSERT INTO books (id, title, author_id, year, available) VALUES (4, 'Emma', 2, 1815, false)"
  );
  rdbms.query(
    "INSERT INTO books (id, title, author_id, year, available) VALUES (5, 'The Adventures of Tom Sawyer', 3, 1876, true)"
  );
}

function App() {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className={`container mx-auto px-4 py-8 max-w-7xl ${showInfo ? 'mt-56' : ''}`}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">James Nyamai RDBMS</h1>
              <p className="text-slate-600">
                A simple relational database management system built from scratch
              </p>
            </div>
          </div>

          {showInfo && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex justify-between items-start gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">About James Nyamai RDBMS</h3>
                    <p className="text-blue-100 mb-4 leading-relaxed">
                      A fully functional in-memory relational database management system built from scratch in TypeScript. 
                      Supports DDL, DML, constraints, indexing, and advanced querying.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <ul className="space-y-2 text-blue-50">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>Table creation with column types</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>Primary keys & unique constraints</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>Hash-based indexing for fast lookups</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>Full CRUD operations</span>
                        </li>
                      </ul>
                      <ul className="space-y-2 text-blue-50">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>WHERE clause filtering</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>INNER and LEFT JOIN support</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>SQL-like query language</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-200 font-bold">✓</span>
                          <span>Interactive REPL console</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="flex-shrink-0 text-blue-100 hover:text-white text-2xl font-bold transition-colors"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
          {showInfo && <div className="h-56"></div>}
        </div>

          <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">CRUD Operations</h3>
            <BookManager rdbms={rdbms} onUpdate={handleUpdate} />
          </div>

          <div>
            <SQLConsole repl={repl} key={updateTrigger} />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Implementation Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Core Components:</h4>
              <ul className="space-y-1">
                <li>• Database: Manages multiple tables</li>
                <li>• Table: Stores rows with schema validation</li>
                <li>• Index: Hash-based indexing for constraints</li>
                <li>• QueryParser: Parses SQL-like syntax</li>
                <li>• QueryExecutor: Executes parsed queries</li>
                <li>• REPL: Interactive console interface</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Supported Operations:</h4>
              <ul className="space-y-1">
                <li>• CREATE TABLE / DROP TABLE</li>
                <li>• INSERT INTO ... VALUES</li>
                <li>• SELECT ... FROM ... WHERE</li>
                <li>• UPDATE ... SET ... WHERE</li>
                <li>• DELETE FROM ... WHERE</li>
                <li>• INNER/LEFT JOIN ... ON</li>
                <li>• SHOW TABLES / DESCRIBE</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
