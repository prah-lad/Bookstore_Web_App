// Array of book objects
const books = [
  { isbn: "9780062209954", title: "The Peculiar", price: 9.99, image: "9780062209954.jpg" },
  { isbn: "9780062209978", title: "The Whatnot", price: 10.99, image: "9780062209978.jpg" },
  { isbn: "9780062851290", title: "Cinders & Sparrows", price: 11.99, image: "9780062851290.jpg" }
];

// Return ALL books
function getAllBooks() {
  return books;
}

// Find one book by ISBN
function findBookByISBN(isbn) {
  return books.find((b) => b.isbn === isbn);
}

// Validate number of copies
function isValidQuantity(qty) {
  const num = Number(qty);
  return !(qty === '' || qty === undefined || Number.isNaN(num) || num < 1);
}

// Compute total with 1.75% tax
function computeTotal(price, qty) {
  return price * qty * 1.0175;
}

module.exports = { getAllBooks, findBookByISBN, isValidQuantity, computeTotal };

