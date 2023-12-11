const express = require('express');

const postRouter = express.Router();
const { Product } = require('../db/models');

postRouter.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

postRouter.post('/', async (req, res) => {
  const { title, price, dateTime } = req.body;

  try {
    const newProduct = await Product.create({ title, price, data: dateTime });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = postRouter;
