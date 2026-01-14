import { useState, useEffect } from 'react';
import { RDBMS } from '../rdbms';
import { Book, Users, Plus, Trash2 } from 'lucide-react';

interface BookManagerProps {
  rdbms: RDBMS;
  onUpdate: () => void;
}

interface BookType {
  id: number;
  title: string;
  author_id: number;
  year: number;
  available: boolean;
}

interface AuthorType {
  id: number;
  name: string;
  country: string;
}

export function BookManager({ rdbms, onUpdate }: BookManagerProps) {
  const [books, setBooks] = useState<BookType[]>([]);
  const [authors, setAuthors] = useState<AuthorType[]>([]);
  const [newBook, setNewBook] = useState({ title: '', author_id: '', year: '' });
  const [newAuthor, setNewAuthor] = useState({ name: '', country: '' });
  

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const booksResult = rdbms.query('SELECT * FROM books');
    const authorsResult = rdbms.query('SELECT * FROM authors');

    if (booksResult.success && booksResult.rows) {
      setBooks((booksResult.rows as unknown) as BookType[]);
    }

    if (authorsResult.success && authorsResult.rows) {
      setAuthors((authorsResult.rows as unknown) as AuthorType[]);
    }
  };

  const addBook = () => {
    if (!newBook.title || !newBook.author_id || !newBook.year) return;

    const result = rdbms.query(
      `INSERT INTO books (id, title, author_id, year, available) VALUES (${Date.now()}, '${newBook.title}', ${newBook.author_id}, ${newBook.year}, true)`
    );

    if (result.success) {
      setNewBook({ title: '', author_id: '', year: '' });
      loadData();
      onUpdate();
    }
  };

  const deleteBook = (id: number) => {
    const result = rdbms.query(`DELETE FROM books WHERE id = ${id}`);
    if (result.success) {
      loadData();
      onUpdate();
    }
  };

  const toggleAvailability = (id: number, currentStatus: boolean) => {
    const result = rdbms.query(`UPDATE books SET available = ${!currentStatus} WHERE id = ${id}`);
    if (result.success) {
      loadData();
      onUpdate();
    }
  };

  const addAuthor = () => {
    if (!newAuthor.name || !newAuthor.country) return;

    const result = rdbms.query(
      `INSERT INTO authors (id, name, country) VALUES (${Date.now()}, '${newAuthor.name}', '${newAuthor.country}')`
    );

    if (result.success) {
      setNewAuthor({ name: '', country: '' });
      loadData();
      onUpdate();
    }
  };

  const deleteAuthor = (id: number) => {
    const hasBooks = books.some(book => book.author_id === id);
    if (hasBooks) {
      alert('Cannot delete author with existing books');
      return;
    }

    const result = rdbms.query(`DELETE FROM authors WHERE id = ${id}`);
    if (result.success) {
      loadData();
      onUpdate();
    }
  };

  const getAuthorName = (authorId: number) => {
    const author = authors.find(a => a.id === authorId);
    return author ? author.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-800">Authors</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Author name"
            value={newAuthor.name}
            onChange={e => setNewAuthor({ ...newAuthor, name: e.target.value })}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Country"
            value={newAuthor.country}
            onChange={e => setNewAuthor({ ...newAuthor, country: e.target.value })}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addAuthor}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {authors.map(author => (
            <div
              key={author.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div>
                <span className="font-medium text-slate-800">{author.name}</span>
                <span className="text-slate-500 ml-3">({author.country})</span>
              </div>
              <button
                onClick={() => deleteAuthor(author.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Book className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-800">Books</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Book title"
            value={newBook.title}
            onChange={e => setNewBook({ ...newBook, title: e.target.value })}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newBook.author_id}
            onChange={e => setNewBook({ ...newBook, author_id: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select author</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Year"
            value={newBook.year}
            onChange={e => setNewBook({ ...newBook, year: e.target.value })}
            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addBook}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {books.map(book => (
            <div
              key={book.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1">
                <span className="font-medium text-slate-800">{book.title}</span>
                <span className="text-slate-500 ml-3">by {getAuthorName(book.author_id)}</span>
                <span className="text-slate-400 ml-2">({book.year})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAvailability(book.id, book.available)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    book.available
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {book.available ? 'Available' : 'Checked Out'}
                </button>
                <button
                  onClick={() => deleteBook(book.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
