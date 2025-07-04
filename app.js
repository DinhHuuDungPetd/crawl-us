const express = require('express');
const app = express();
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const expressLayouts = require('express-ejs-layouts');

// Middleware để xử lý JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(expressLayouts);
app.set('layout', 'layout'); // default layout file: views/layout.ejs

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', productRoutes);
app.use('/download', downloadRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
