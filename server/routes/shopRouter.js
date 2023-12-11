/* eslint-disable no-await-in-loop */
const express = require('express');
const fs = require('fs/promises');
const sharp = require('sharp');
const { Op } = require('sequelize');
const {
  Product,
  Category,
  Size,
  Color,
  Image,
  Cart,
  ProductSize,
  Role,
  User,
  Order,
  OrderList,
  Status,
} = require('../db/models');
const upload = require('../middlewares/multerMid');

const shopRouter = express.Router();

shopRouter.post(
  '/products',
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  async (req, res) => {
    const { title, categoryId, colorId, price, description } = req.body;

    console.log('====================================');
    console.log(req.body);

    if (req?.session?.user) {
      const user = await User.findOne({
        where: { id: req.session.user.id },
        include: { model: Role },
      });
      if (user.Role.id === 1) {
        if (title && categoryId && colorId && price && description) {
          const newProduct = await Product.create({
            title,
            categoryId,
            colorId,
            price,
            description,
          });
          try {
            if (req?.files?.images) {
              for (const file of req.files.images) {
                const name = `${Date.now()}.webp`;
                const outputBuffer = await sharp(file.buffer).webp().toBuffer();
                await fs.writeFile(`./public/images/${name}`, outputBuffer);
                await Image.create({ productId: newProduct.id, url: name, forConstructor: false });
              }
            }
            if (req?.files?.cover[0]) {
              const name = `${Date.now()}.webp`;
              const outputBuffer = await sharp(req.files.cover[0].buffer).webp().toBuffer();
              await fs.writeFile(`./public/images/${name}`, outputBuffer);
              await Image.create({ productId: newProduct.id, url: name, forConstructor: true });
            }
          } catch (err) {
            return res.status(403).json({ message: 'Нет картинки' });
          }
          if (req.files.cover[0]) {
            const name = `${Date.now()}.webp`;
            const outputBuffer = await sharp(req.files.cover[0].buffer).webp().toBuffer();
            await fs.writeFile(`./public/images/${name}`, outputBuffer);
            await Image.create({ productId: newProduct.id, url: name, forConstructor: true });
          }
          console.log(999999999999999999);
          console.log(req.files);
          const sizes = await Size.findAll();
          for (let i = 0; i < sizes.length; i++) {
            ProductSize.create({ productId: newProduct.id, sizeId: sizes[i].id, count: 50 });
          }
          const response = await Product.findOne({
            where: { id: newProduct.id },
            include: [{ model: Image }, { model: Category }, { model: Color }],
          });
          res.json(response);
        }
      } else {
        res.status(400).json({ message: 'Only for admins' });
      }
    }
  },
);

shopRouter.put(
  '/products/:id',
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  async (req, res) => {
    const { title, categoryId, colorId, price, description, count } = req.body;
    const user = await User.findByPk({
      where: { id: req.session.user.id },
      include: { model: Role },
    });
    if (user.Role.id === 1) {
      if (title && categoryId && colorId && price && description && count) {
        const product = await Product.findByPk(req.params.id);
        product.title = title;
        product.categoryId = categoryId;
        product.colorId = colorId;
        product.price = price;
        product.description = description;
        product.save();
        for (const file of req?.files) {
          const name = `${Date.now()}.webp`;
          const outputBuffer = await sharp(file.buffer).webp().toBuffer();
          await fs.writeFile(`./public/images/${name}`, outputBuffer);
          await Image.create({ productId: newProduct.id, url: name, forConstructor: false });
        }
        const name = `${Date.now()}.webp`;
        const outputBuffer = await sharp(req?.cover?.buffer).webp().toBuffer();
        await fs.writeFile(`./public/images/${name}`, outputBuffer);
        await Image.create({ productId: product.id, url: name, forConstructor: true });
        const sizes = await Size.findAll();
        for (let i = 0; i < sizes.length; i++) {
          ProductSize.create({ productId: product.id, sizeId: sizes[i].id, count });
        }
        res.json(product);
      }
    } else {
      res.status(400).json({ message: 'Only for admins' });
    }
  },
);

shopRouter.delete('/products/:id', async (req, res) => {
  const user = await User.findOne({
    where: { id: req?.session?.user?.id },
    include: { model: Role },
  });
  if (user.Role.id === 1) {
    const product = await Product.findByPk(req.params.id);
    const images = await Image.findAll({ where: { productId: product.id } });
    // const folder = await fs.readdir('./public/images/');
    for (const image of images) {
      try {
        await fs.unlink(`./public/images/${image.url}`);
      } catch (err) {
        console.log(err);
      }
      await image.destroy();
    }
    await ProductSize.destroy({ where: { productId: product.id } });
    product.destroy();
    return res.json(req.params.id);
  }
  res.status(400).json({ message: 'Only for admins' });
});
shopRouter.get('/orders', async (req, res) => {
  const user = await User.findByPk(req?.session?.user?.id);
  if (!user) {
    return res.status(400).json({ message: 'Cant find user' });
  }
  if (user.roleId === 2) {
    return res.json(
      await Order.findAll({
        where: { userId: user.Id },
        include: [
          {
            model: OrderList,
            include: {
              model: ProductSize,
              include: [
                { model: Size },
                {
                  model: Product,
                  include: [{ model: Color }, { model: Image }, { model: Category }],
                },
              ],
            },
          },
          { model: Status },
        ],
      }),
    );
  }
  return res.json(
    await Order.findAll({
      include: [
        {
          model: OrderList,
          include: {
            model: ProductSize,
            include: [
              { model: Size },
              {
                model: Product,
                include: [{ model: Color }, { model: Image }, { model: Category }],
              },
            ],
          },
        },
        { model: User },
        { model: Status },
      ],
    }),
  );
});
shopRouter.put('/orders/:id', async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  if (!user || user.roleId !== 1) {
    return res.status(400).json({ message: 'Only for admins' });
  }
  const { status } = req.body;
  const order = await Order.findByPk(req.params.id);
  order.statusId = status;
  order.save();
  setTimeout(() => {
    Order.findOne({
      where: { id: order.id },
      include: [
        {
          model: OrderList,
          include: {
            model: ProductSize,
            include: [
              { model: Size },
              {
                model: Product,
                include: [{ model: Color }, { model: Category }, { model: Image }],
              },
            ],
          },
        },
        { model: Status },
        { model: User },
      ],
    }).then((data) => res.json(data));
  }, 10);
});
shopRouter.post('/orders', async (req, res) => {
  const { phone, address } = req.body;
  console.log(req.body);
  const cart = await Cart.findAll({ where: { userId: req.session.user.id } });
  const buy = [];
  const cant = [];
  const order = await Order.create({
    userId: req.session.user.id,
    phone,
    address,
    statusId: 1,
  });
  for (let i = 0; i < cart.length; i++) {
    const product = await ProductSize.findByPk(cart[i].productSizeId);
    if (product.count >= 1) {
      product.count -= 1;
      product.save();
      buy.push(product);
    } else {
      cant.push(product);
    }
  }
  for (let i = 0; i < buy.length; i++) {
    await OrderList.create({ orderId: order.id, productSizeId: buy[i].id });
    console.clear();
    console.log(req.session.user.id);
    console.log(buy[i].id);
    const del = await Cart.findOne({
      where: [{ productSizeId: buy[i].id }, { userId: req.session.user.id }],
    });
    await Cart.destroy({ where: { id: del.id } });
    console.log(del);
  }
  const response = await Order.findOne({
    where: { id: order.id },
    include: [
      {
        model: User,
      },
      {
        model: OrderList,
        include: {
          model: ProductSize,
          include: [
            { model: Product, include: [{ model: Image }, { model: Color }, { model: Category }] },
            { model: Size },
          ],
        },
      },
    ],
  });
  res.json({ response, cant });
});
shopRouter.post('/cart/:productId', async (req, res) => {
  await Cart.create({
    userId: req.session.user.id,
    productSizeId: req.params.productId,
  });
  return res.json(
    await Cart.findOne({
      where: { productSizeId: req.params.productId, userId: req.session.user.id },
      include: {
        model: ProductSize,
        include: [
          {
            model: Product,
            include: [{ model: Image }, { model: Category }, { model: Color }],
          },
          { model: Size },
        ],
      },
    }),
  );
  // res.sendStatus(400).message('Error in api/cart');
});

shopRouter.delete('/cart/:cartId', async (req, res) => {
  const inCart = await Cart.findOne({
    where: { userId: req.session.user.id, id: req.params.cartId },
  });
  if (inCart) {
    await inCart.destroy();
    return res.sendStatus(200);
  }
  res.status(400).message('Error in api/cart');
});

shopRouter.delete('/image/:id', async (req, res) => {
  const image = await Image.findByPk(req.params.id);
  const user = await User.findOne({
    where: { id: req.session.user.id },
    include: { model: Role },
  });
  if (user.Role.id === 1) {
    await fs.unlink(`./public/images/${image.url}`);
    await image.destroy();
  } else {
    res.status(400).json({ message: 'Only for admins' });
  }
});

shopRouter.get('/products', async (req, res) => {
  res.json(
    await Product.findAll({ include: [{ model: Image }, { model: Category }, { model: Color }] }),
  );
});
shopRouter.get('/products/:id', async (req, res) => {
  res.json(
    await Product.findOne({
      where: { id: req.params.id },
      include: [
        { model: Image },
        { model: Category },
        { model: Color },
        {
          model: ProductSize,
          where: { count: { [Op.gt]: 0 } },
          require: true,
          include: { model: Size },
        },
      ],
    }),
  );
});
shopRouter.get('/cart', async (req, res) => {
  if (req?.session?.user) {
    return res.json(
      await Cart.findAll({
        where: { userId: req.session.user.id },
        include: {
          model: ProductSize,
          include: [
            {
              model: Product,
              include: [{ model: Image }, { model: Category }, { model: Color }],
            },
            { model: Size },
          ],
        },
      }),
    );
  }
  return res.sendStatus(200);
});
shopRouter.get('/categories', async (req, res) => res.json(await Category.findAll()));
shopRouter.get('/sizes', async (req, res) => res.json(await Size.findAll()));
shopRouter.get('/colors', async (req, res) => res.json(await Color.findAll()));
shopRouter.get('/statuses', async (req, res) => res.json(await Status.findAll()));

module.exports = shopRouter;
