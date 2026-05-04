const express = require('express');
const dataStore = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = dataStore.getCategories();
  res.json({ categories });
});

module.exports = router;