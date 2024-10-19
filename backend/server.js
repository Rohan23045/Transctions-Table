const express = require('express');
const mongoose = require('mongoose');
const transactionRoutes = require('./routes/transactions');

const app = express();

mongoose.connect('mongodb://localhost:27017/productTransactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use('/api', transactionRoutes);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
