import { useState, useEffect, useCallback } from "react";
import {
  fetchBooks,
  fetchStats,
  createBook,
  replaceBookById,
  patchBookById,
  deleteBookById,
} from "./api/books.js";
import StatsPanel from "./components/StatsPanel.jsx";
import BookForm from "./components/BookForm.jsx";
import "./App.css";

const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    genre: "",
    read: "",
    sort: "id",
    order: "asc",
  });
  const [editingBook, setEditingBook] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (signal) => {
    try {
      setError("");
      const [booksData, statsData] = await Promise.all([
        fetchBooks(filters, signal),
        fetchStats(signal),
      ]);
      setBooks(booksData);
      setStats(statsData);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  async function handleAdd(payload) {
    try {
      setError("");
      await createBook(payload);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(payload) {
    try {
      setError("");
      await replaceBookById(editingBook.id, payload);
      setEditingBook(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleRead(book) {
    try {
      setError("");
      const nextRead = !book.read;
      await patchBookById(book.id, {
        read: nextRead,
        rating: nextRead ? book.rating : null,
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRate(book, ratingValue) {
    try {
      setError("");
      await patchBookById(book.id, {
        rating: ratingValue === "" ? null : Number(ratingValue),
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      setError("");
      await deleteBookById(id);
      if (editingBook?.id === id) setEditingBook(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <h1>Reading List</h1>
      <StatsPanel stats={stats} />

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>{editingBook ? "Edit Book" : "Add a Book"}</h2>
        <BookForm
          onSubmit={editingBook ? handleUpdate : handleAdd}
          initialData={editingBook}
          onCancel={editingBook ? () => setEditingBook(null) : null}
        />
      </section>

      <section className="filters">
        <input
          placeholder="Search title or author..."
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <select
          value={filters.genre}
          onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value }))}
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={filters.read}
          onChange={(e) => setFilters((f) => ({ ...f, read: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
        >
          <option value="id">Sort: ID</option>
          <option value="title">Sort: Title</option>
          <option value="author">Sort: Author</option>
          <option value="year">Sort: Year</option>
          <option value="rating">Sort: Rating</option>
        </select>
        <select
          value={filters.order}
          onChange={(e) => setFilters((f) => ({ ...f, order: e.target.value }))}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </section>

      {loading ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul className="book-list">
          {books.map((book) => (
            <li key={book.id} className="book-item">
              <div>
                <strong>{book.title}</strong> by {book.author} ({book.year}) —{" "}
                <span>[{book.genre}]</span>
              </div>
              <div className="actions">
                <button onClick={() => handleToggleRead(book)}>
                  {book.read ? "✓ Read" : "Mark Read"}
                </button>
                {book.read && (
                  <select
                    value={book.rating ?? ""}
                    onChange={(e) => handleRate(book, e.target.value)}
                  >
                    <option value="">Rate</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r} ★</option>
                    ))}
                  </select>
                )}
                <button onClick={() => setEditingBook(book)}>Edit</button>
                <button onClick={() => handleDelete(book.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}