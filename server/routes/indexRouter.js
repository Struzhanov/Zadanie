const indexRouter = require('express').Router();
const { Category, Item } = require('../db/models');

indexRouter.get('/', async (req, res) => {
  const data = await Category.findAll({
    include: Item,
  });

  res.json(data);
});

module.exports = indexRouter;
