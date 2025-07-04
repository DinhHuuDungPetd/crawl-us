const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.index);
router.get('/detail/:goods_code', productController.getProductDetail);

module.exports = router;
