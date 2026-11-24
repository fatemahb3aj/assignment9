import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  isDuplicateBook,
  addBook,
  replaceBook,
  updateBook,
  deleteBook,
  getStats,
} from "./booksStore.js";
import { parsePositiveInt, validateBookInput, cleanBookFields } from "./validate.js";

const app = express();
const port = process.env.PORT || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const genres = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

function isRepeated(val) {
  return Array.isArray(val);
}

app.get("/api/books", async (req, res, next) => {
  try {
    const { genre, read, q, sort, order, limit, page } = req.query;

    if ([genre, read, q, sort, order, limit, page].some(isRepeated)) {
      return res.status(400).json({ error: "Repeated query parameter." });
    }

    let list = await getAllBooks();

    if (genre !== undefined) {
      if (!genres.includes(genre)) {
        return res.status(400).json({ error: "Invalid genre." });
      }
      list = list.filter((b) => b.genre === genre);
    }

    if (read !== undefined) {
      if (read !== "true" && read !== "false") {
        return res.status(400).json({ error: "read must be true or false." });
      }
      list = list.filter((b) => b.read === (read === "true"));
    }

    if (q !== undefined) {
      const text = String(q).trim().toLowerCase();
      if (text) {
        list = list.filter(
          (b) => b.title.toLowerCase().includes(text) || b.author.toLowerCase().includes(text)
        );
      }
    }

    const sortBy = sort === undefined ? "id" : sort;
    const dir = order === undefined ? "asc" : order;
    const allowedSort = ["id", "title", "author", "year", "rating"];

    if (!allowedSort.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort." });
    }
    if (dir !== "asc" && dir !== "desc") {
      return res.status(400).json({ error: "Invalid order." });
    }

    const copy = [...list].sort((a, b) => {
      if (sortBy === "rating") {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return dir === "asc" ? a.rating - b.rating : b.rating - a.rating;
      }
      if (sortBy === "id" || sortBy === "year") {
        return dir === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
      }
      const cmp = a[sortBy].localeCompare(b[sortBy]);
      return dir === "asc" ? cmp : -cmp;
    });

    const pageNum = page === undefined ? 1 : parsePositiveInt(page);
    const limitNum = limit === undefined ? 50 : parsePositiveInt(limit);

    if (!pageNum || !limitNum || limitNum > 50) {
      return res.status(400).json({ error: "Invalid page or limit." });
    }

    const start = (pageNum - 1) * limitNum;
    res.json(copy.slice(start, start + limitNum));
  } catch (err) {
    next(err);
  }
});

app.get("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id." });

    const book = await getBookById(id);
    if (!book) return res.status(404).json({ error: "Book not found." });

    res.json(book);
  } catch (err) {
    next(err);
  }
});

app.post("/api/books", async (req, res, next) => {
  try {
    const body = { ...req.body };
    delete body.id;

    const errors = validateBookInput(body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const cleaned = cleanBookFields(body);
    if (await isDuplicateBook(cleaned.title, cleaned.author)) {
      return res.status(409).json({ error: "Duplicate book." });
    }

    const created = await addBook(cleaned);
    res.status(201).location(`/api/books/${created.id}`).json(created);
  } catch (err) {
    next(err);
  }
});

app.put("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id." });

    const existing = await getBookById(id);
    if (!existing) return res.status(404).json({ error: "Book not found." });

    const body = { ...req.body };
    delete body.id;

    const errors = validateBookInput(body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const cleaned = cleanBookFields(body);
    if (await isDuplicateBook(cleaned.title, cleaned.author, id)) {
      return res.status(409).json({ error: "Duplicate book." });
    }

    const updated = await replaceBook(id, cleaned);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id." });

    const existing = await getBookById(id);
    if (!existing) return res.status(404).json({ error: "Book not found." });

    const body = { ...req.body };
    delete body.id;

    const errors = validateBookInput(body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const merged = cleanBookFields(body, existing);
    const mergedErrors = validateBookInput(merged, true);
    if (mergedErrors.length > 0) {
      return res.status(400).json({ error: mergedErrors.join(" ") });
    }

    if (await isDuplicateBook(merged.title, merged.author, id)) {
      return res.status(409).json({ error: "Duplicate book." });
    }

    const updated = await updateBook(id, merged);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id." });

    const ok = await deleteBook(id);
    if (!ok) return res.status(404).json({ error: "Book not found." });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.get("/api/stats", async (req, res, next) => {
  try {
    res.json(await getStats());
  } catch (err) {
    next(err);
  }
});

app.get("/api/crash", async (req, res, next) => {
  try {
    throw new Error("Test crash");
  } catch (err) {
    next(err);
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});