import { useState } from 'react';
import { REPL } from '../rdbms';
import { Terminal } from 'lucide-react';

interface SQLConsoleProps {
  repl: REPL;
}

export function SQLConsole({ repl }: SQLConsoleProps) {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState<string[]>([]);

  const executeQuery = () => {
    if (!query.trim()) return;

    const result = repl.execute(query);
    setOutput(prev => [...prev, `> ${query}`, result, '']);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeQuery();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-800">SQL Console</h2>
      </div>

      <div className="bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-lg mb-4 h-64 overflow-y-auto">
        {output.length === 0 ? (
          <div className="text-slate-500">
            Welcome to RDBMS Console. Type SQL commands and press Ctrl+Enter to execute.
          </div>
        ) : (
          <pre className="whitespace-pre-wrap">{output.join('\n')}</pre>
        )}
      </div>

      <div className="flex gap-2">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter SQL query... (Ctrl+Enter to execute)"
          className="flex-1 p-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          onClick={executeQuery}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Execute
        </button>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p className="font-medium mb-2">Example queries:</p>
        <ul className="space-y-1 text-xs font-mono bg-slate-50 p-3 rounded">
          <li>• SHOW TABLES</li>
          <li>• SELECT * FROM books</li>
          <li>• SELECT * FROM authors</li>
          <li>• SELECT * FROM books INNER JOIN authors ON books.author_id = authors.id</li>
        </ul>
      </div>
    </div>
  );
}
