const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const axios = require('axios');

// Seed database
router.get('/initialize', async (req, res) => {
  try {
    const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.insertMany(data);
    res.status(200).send({ message: 'Database initialized with seed data.' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API to list transactions with search and pagination
router.get('/transactions', async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const regex = new RegExp(search, 'i');
  const match = {
    dateOfSale: { $gte: new Date(`2022-${month}-01`), $lt: new Date(`2022-${month + 1}-01`) },
    $or: [
      { title: regex },
      { description: regex },
      { price: regex }
    ]
  };

  try {
    const transactions = await Transaction.find(match)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const total = await Transaction.countDocuments(match);
    res.status(200).json({ transactions, total, currentPage: page });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API for statistics
router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const match = { dateOfSale: { $gte: new Date(`2022-${month}-01`), $lt: new Date(`2022-${month + 1}-01`) } };

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const soldItems = await Transaction.countDocuments({ ...match, sold: true });
    const notSoldItems = await Transaction.countDocuments({ ...match, sold: false });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems: soldItems,
      totalNotSoldItems: notSoldItems
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API for bar chart data (price ranges)
router.get('/bar-chart', async (req, res) => {
  const { month } = req.query;
  const match = { dateOfSale: { $gte: new Date(`2022-${month}-01`), $lt: new Date(`2022-${month + 1}-01`) } };

  try {
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity }
    ];

    const result = await Promise.all(priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({ ...match, price: { $gte: range.min, $lt: range.max } });
      return { range: range.range, count };
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API for pie chart (categories and number of items)
router.get('/pie-chart', async (req, res) => {
  const { month } = req.query;
  const match = { dateOfSale: { $gte: new Date(`2022-${month}-01`), $lt: new Date(`2022-${month + 1}-01`) } };

  try {
    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json(result.map(r => ({ category: r._id, count: r.count })));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Combined API
router.get('/combined', async (req, res) => {
  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get('http://localhost:5000/transactions', { params: req.query }),
      axios.get('http://localhost:5000/statistics', { params: req.query }),
      axios.get('http://localhost:5000/bar-chart', { params: req.query }),
      axios.get('http://localhost:5000/pie-chart', { params: req.query })
    ]);

    res.status(200).json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
