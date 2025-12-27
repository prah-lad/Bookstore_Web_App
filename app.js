// app.js
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { getAllBooks, findBookByISBN, isValidQuantity, computeTotal } = require('./models/books');


const app = express();
const PORT = 3000;

const viewsPath = path.join(__dirname, 'views');

app.use('/images', express.static(path.join(__dirname, 'Pages', 'images')));

// Set up Handlebars as the view engine
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(viewsPath, 'layouts')
}));

app.set('view engine', 'hbs');
app.set('views', viewsPath);

// Parse form-encoded bodies
app.use(express.urlencoded({ extended: true }));


// Home page: just show the template frame
app.get('/', (req, res) => {
  const books = getAllBooks();
  res.render('books', { books });
});
// View all books page
app.get('/books', (req, res) => {
  const books = getAllBooks();
  res.render('books', { books });
});

// Order form page (uses Handlebars template)
app.get('/order', (req, res) => {
  const books = getAllBooks();   // get dynamic list

  res.render('order', {
    books,
    isbn: 'none',      // default selection
    copies: '',
    bookError: '',
    copiesError: ''
  });
});

// Step 1: Extract raw parameters
function extractParams(req, res, next) {
  req.isbnRaw = req.body.isbn;
  req.copiesRaw = req.body.copies;
  next();
}

// Step 2: Validate the inputs and either:
function validateParams(req, res, next) {
  const isbn = req.isbnRaw;
  const copiesStr = req.copiesRaw;

  let bookError = '';
  let copiesError = '';

  //Validate book selection
  if (isbn === 'none') {
    bookError = 'Please select a book';
  }

  //Validate copies: integer >= 1
  const num = Number(copiesStr);
  const isInteger = Number.isInteger(num);

  if (copiesStr === '' || !isInteger || num < 1) {
    copiesError = 'Number of copies must be a whole number at least 1';
  }

  // If any error, re-render the order form IN PLACE
  if (bookError || copiesError) {
    const books = getAllBooks();

    return res.render('order', {
      books,

      
      isbn,
      copies: copiesStr,

     
      bookError,
      copiesError
    });
  }

  // No errors: store clean values and continue
  req.isbn = isbn;
  req.copies = num;
  next();
}

// Step 3: Retrieve book
function retrieveBook(req, res, next) {
  const book = findBookByISBN(req.isbn);
  if (!book) {
    return res.status(404).end('<h3>Book not found.</h3>');
  }
  req.book = book;
  next();
}

// Step 4: Compute total
function computeBill(req, res, next) {
  req.total = computeTotal(req.book.price, req.copies);
  next();
}

// Step 5: Display a receipt page using Handlebars
function displayReceipt(req, res) {
  res.render('receipt', {
    title: req.book.title,
    price: req.book.price.toFixed(2),
    image: req.book.image,
    copies: req.copies,
    total: req.total.toFixed(2)
  });
}

// Chain in order
app.post('/order', extractParams, validateParams, retrieveBook, computeBill, displayReceipt);


app.use((req, res) => res.status(404).end('File Not Found'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).end('Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

