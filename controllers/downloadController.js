const sharp = require('sharp');
const JSZip = require('jszip');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

// Hàm kiểm tra URL hình ảnh có hợp lệ không
async function isValidImageUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: (status) => status < 400
    });
    
    const contentType = response.headers['content-type'];
    return contentType && contentType.startsWith('image/');
  } catch (error) {
    console.log(`URL không hợp lệ: ${url} - ${error.message}`);
    return false;
  }
}

// Hàm tải và kiểm tra hình ảnh
async function downloadAndValidateImage(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      validateStatus: (status) => status < 400
    });

    // Kiểm tra content-type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('URL không phải là hình ảnh');
    }

    // Kiểm tra kích thước file (tối đa 10MB)
    if (response.data.length > 10 * 1024 * 1024) {
      throw new Error('File quá lớn');
    }

    return response.data;
  } catch (error) {
    console.error(`Lỗi khi tải hình ảnh ${url}:`, error.message);
    throw error;
  }
}

exports.downloadImagesAsJpg = async (req, res) => {
  try {
    const { goods_code, imageUrls } = req.body;
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ error: 'Không có URL hình ảnh nào được cung cấp' });
    }

    const zip = new JSZip();
    let processedCount = 0;
    let errorCount = 0;

    // Xử lý từng hình ảnh
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const imageUrl = imageUrls[i];
        
        // Kiểm tra URL có hợp lệ không
        const isValid = await isValidImageUrl(imageUrl);
        if (!isValid) {
          console.log(`Bỏ qua URL không hợp lệ: ${imageUrl}`);
          errorCount++;
          continue;
        }

        // Tải và kiểm tra hình ảnh
        const imageBuffer = await downloadAndValidateImage(imageUrl);

        // Chuyển đổi sang JPG với chất lượng cao
        const jpgBuffer = await sharp(imageBuffer)
          .jpeg({ 
            quality: 90,
            progressive: true,
            mozjpeg: true
          })
          .toBuffer();

        // Tạo tên file
        const originalName = path.basename(imageUrl.split('?')[0]);
        const nameWithoutExt = path.parse(originalName).name;
        const jpgFileName = `${nameWithoutExt}_${goods_code}_${i + 1}.jpg`;

        // Thêm vào ZIP
        zip.file(jpgFileName, jpgBuffer);
        processedCount++;

      } catch (error) {
        console.error(`Lỗi khi xử lý hình ảnh ${i + 1}:`, error.message);
        errorCount++;
        // Tiếp tục với hình ảnh tiếp theo
      }
    }

    if (processedCount === 0) {
      return res.status(500).json({ 
        error: 'Không thể xử lý bất kỳ hình ảnh nào',
        details: `Đã thử ${imageUrls.length} URL, ${errorCount} lỗi`
      });
    }

    // Tạo file ZIP
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Gửi file ZIP về client
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${goods_code}_images_jpg.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    res.send(zipBuffer);

    // Log kết quả
    console.log(`Download JPG hoàn thành: ${processedCount}/${imageUrls.length} hình ảnh thành công, ${errorCount} lỗi`);

  } catch (error) {
    console.error('Lỗi khi tạo file ZIP:', error);
    res.status(500).json({ error: 'Lỗi server khi xử lý download' });
  }
};

exports.downloadSingleImageAsJpg = async (req, res) => {
  try {
    const { imageUrl, fileName } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'URL hình ảnh không được cung cấp' });
    }

    // Kiểm tra URL có hợp lệ không
    const isValid = await isValidImageUrl(imageUrl);
    if (!isValid) {
      return res.status(400).json({ error: 'URL không phải là hình ảnh hợp lệ' });
    }

    // Tải và kiểm tra hình ảnh
    const imageBuffer = await downloadAndValidateImage(imageUrl);

    // Chuyển đổi sang JPG
    const jpgBuffer = await sharp(imageBuffer)
      .jpeg({ 
        quality: 90,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    // Tạo tên file
    const originalName = path.basename(imageUrl.split('?')[0]);
    const nameWithoutExt = path.parse(originalName).name;
    const jpgFileName = fileName || `${nameWithoutExt}.jpg`;

    // Gửi file JPG về client
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${jpgFileName}"`);
    res.setHeader('Content-Length', jpgBuffer.length);
    
    res.send(jpgBuffer);

  } catch (error) {
    console.error('Lỗi khi tải hình ảnh:', error);
    res.status(500).json({ 
      error: 'Lỗi server khi xử lý download',
      details: error.message 
    });
  }
}; 