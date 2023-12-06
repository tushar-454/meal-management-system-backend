const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./Middleware/logger');
const globalError = require('./Error/globalError');
require('dotenv').config();
const port = process.env.PORT || 4000;
const error = require('./Error/error');
const routes = require('./Routes');

// middleware
app.use(express.json());
app.use(cors());
app.use(logger);
app.use(routes);
app.use(globalError);

app.get('/', (req, res) => {
  res.send({ message: 'Api is working.' });
});
app.get('/health', (req, res) => {
  res.send({ message: 'Server is running fine' });
});

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    app.listen(port, () => {
      console.log(`Server is running on  http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.log(e);
  });
