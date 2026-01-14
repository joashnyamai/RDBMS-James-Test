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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">About this RDBMS</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    This is a fully functional in-memory relational database management system
                    implemented in TypeScript with the following features:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4">
                    <li>• Table creation with column types (string, number, boolean)</li>
                    <li>• Primary keys and unique constraints</li>
                    <li>• Basic indexing for fast lookups</li>
                    <li>• CRUD operations (INSERT, SELECT, UPDATE, DELETE)</li>
                    <li>• WHERE clause filtering with comparison operators</li>
                    <li>• INNER and LEFT JOIN support</li>
                    <li>• SQL-like query language with a custom parser</li>
                    <li>• Interactive REPL console</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
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
