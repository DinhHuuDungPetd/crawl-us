const productModel = require('../models/productModel');

exports.index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.q || '';

  const { products, total } = await productModel.getProducts(keyword, page, 20);

  res.render('index', {
    products,
    keyword,
    total,
    page,
    pages: Math.ceil(total / 20),
  });
};

exports.getProductDetail = async (req, res) => {
  const goods_code = req.params.goods_code;
  const product = await productModel.getProductDetail(goods_code);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
};
