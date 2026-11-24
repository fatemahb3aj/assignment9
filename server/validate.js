const genres = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];
const thisYear = new Date().getFullYear();

export function parsePositiveInt(val) {
  const num = Number(val);
  if (!Number.isInteger(num) || num <= 0) {
    return null;
  }
  return num;
}

export function validateBookInput(data, requireAll = true) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Body must be an object."];
  }

  if (requireAll || "title" in data) {
    if (typeof data.title !== "string") {
      errors.push("Title must be a string.");
    } else {
      const len = data.title.trim().length;
      if (len < 1 || len > 100) {
        errors.push("Title must be 1 to 100 characters.");
      }
    }
  }

  if (requireAll || "author" in data) {
    if (typeof data.author !== "string") {
      errors.push("Author must be a string.");
    } else {
      const len = data.author.trim().length;
      if (len < 1 || len > 100) {
        errors.push("Author must be 1 to 100 characters.");
      }
    }
  }

  if (requireAll || "year" in data) {
    if (!Number.isInteger(data.year) || data.year < 1000 || data.year > thisYear) {
      errors.push(`Year must be between 1000 and ${thisYear}.`);
    }
  }

  if (requireAll || "genre" in data) {
    if (typeof data.genre !== "string" || !genres.includes(data.genre)) {
      errors.push("Invalid genre.");
    }
  }

  if ("read" in data && typeof data.read !== "boolean") {
    errors.push("Read must be true or false.");
  }

  if ("rating" in data && data.rating !== null) {
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      errors.push("Rating must be 1 to 5 or null.");
    }
  }

  const isRead = "read" in data ? data.read : false;
  const rating = "rating" in data ? data.rating : null;

  if (rating !== null && isRead !== true) {
    errors.push("Rating is only allowed when read is true.");
  }

  return errors;
}

export function cleanBookFields(data, oldBook = null) {
  const read = "read" in data ? data.read : oldBook ? oldBook.read : false;
  let rating = "rating" in data ? data.rating : oldBook ? oldBook.rating : null;

  if (!read) {
    rating = null;
  }

  return {
    title: "title" in data ? data.title.trim() : oldBook.title,
    author: "author" in data ? data.author.trim() : oldBook.author,
    year: "year" in data ? data.year : oldBook.year,
    genre: "genre" in data ? data.genre : oldBook.genre,
    read,
    rating,
  };
}