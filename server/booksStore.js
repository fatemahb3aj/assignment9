let books = [
  { id: 1, title: "1984", author: "George Orwell", year: 1949, genre: "fiction", read: true, rating: 5 },
  { id: 2, title: "Dune", author: "Frank Herbert", year: 1965, genre: "fantasy", read: true, rating: 4 },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", year: 2011, genre: "history", read: true, rating: 5 },
  { id: 4, title: "A Brief History of Time", author: "Stephen Hawking", year: 1988, genre: "science", read: false, rating: null },
  { id: 5, title: "Project Hail Mary", author: "Andy Weir", year: 2021, genre: "fantasy", read: false, rating: null },
  { id: 6, title: "Atomic Habits", author: "James Clear", year: 2018, genre: "non-fiction", read: true, rating: 4 },
];

let nextId = 7;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function copyBook(book) {
  return { ...book };
}

function copyAll(list) {
  return list.map((b) => ({ ...b }));
}

export async function getAllBooks() {
  await wait();
  return copyAll(books);
}

export async function getBookById(id) {
  await wait();
  const found = books.find((b) => b.id === id);
  return found ? copyBook(found) : null;
}

export async function isDuplicateBook(title, author, ignoreId = null) {
  await wait();
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  return books.some(
    (b) =>
      b.id !== ignoreId &&
      b.title.trim().toLowerCase() === t &&
      b.author.trim().toLowerCase() === a
  );
}

export async function addBook(fields) {
  await wait();
  const newBook = {
    id: nextId,
    title: fields.title,
    author: fields.author,
    year: fields.year,
    genre: fields.genre,
    read: fields.read,
    rating: fields.rating,
  };
  nextId += 1;
  books = [...books, newBook];
  return copyBook(newBook);
}

export async function replaceBook(id, fields) {
  await wait();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated = {
    id,
    title: fields.title,
    author: fields.author,
    year: fields.year,
    genre: fields.genre,
    read: fields.read,
    rating: fields.rating,
  };

  books = books.map((b, i) => (i === index ? updated : b));
  return copyBook(updated);
}

export async function updateBook(id, fields) {
  await wait();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated = {
    ...books[index],
    ...fields,
    id,
  };

  books = books.map((b, i) => (i === index ? updated : b));
  return copyBook(updated);
}

export async function deleteBook(id) {
  await wait();
  const exists = books.some((b) => b.id === id);
  if (!exists) return false;

  books = books.filter((b) => b.id !== id);
  return true;
}

export async function getStats() {
  await wait();
  const total = books.length;
  const read = books.filter((b) => b.read === true).length;
  const unread = total - read;

  const ratedBooks = books.filter((b) => typeof b.rating === "number");
  let averageRating = null;
  if (ratedBooks.length > 0) {
    const sum = ratedBooks.reduce((acc, b) => acc + b.rating, 0);
    averageRating = Number((sum / ratedBooks.length).toFixed(2));
  }

  const byGenre = {};
  for (const b of books) {
    byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
  }

  return {
    total,
    read,
    unread,
    averageRating,
    byGenre,
  };
}