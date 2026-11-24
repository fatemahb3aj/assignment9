import { useState, useEffect } from "react";

const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

const EMPTY_FORM = {
  title: "",
  author: "",
  genre: "fiction",
  year: new Date().getFullYear(),
  read: false,
  rating: "",
};

export default function BookForm({ onSubmit, initialData = null, onCancel = null }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        author: initialData.author,
        genre: initialData.genre,
        year: initialData.year,
        read: initialData.read,
        rating: initialData.rating ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "read" && !checked) next.rating = "";
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      year: Number(form.year),
      read: Boolean(form.read),
      rating: form.read && form.rating !== "" ? Number(form.rating) : null,
    };
    onSubmit(payload);
    if (!initialData) setForm(EMPTY_FORM);
  }

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        name="author"
        placeholder="Author"
        value={form.author}
        onChange={handleChange}
        required
      />
      <select name="genre" value={form.genre} onChange={handleChange}>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <input
        name="year"
        type="number"
        value={form.year}
        onChange={handleChange}
        required
      />
      <label>
        <input
          name="read"
          type="checkbox"
          checked={form.read}
          onChange={handleChange}
        />
        Read
      </label>
      {form.read && (
        <select name="rating" value={form.rating} onChange={handleChange}>
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} ★</option>
          ))}
        </select>
      )}
      <button type="submit">{initialData ? "Save" : "Add Book"}</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}