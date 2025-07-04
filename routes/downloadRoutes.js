const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

// Route để download tất cả hình ảnh dưới dạng JPG trong file ZIP
router.post('/images-as-jpg', downloadController.downloadImagesAsJpg);

// Route để download một hình ảnh đơn lẻ dưới dạng JPG
router.post('/single-image-as-jpg', downloadController.downloadSingleImageAsJpg);

module.exports = router; 