const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://springboot:Dung1702@@160.250.137.207:5432/usadrop',
});
client.connect();

exports.getProducts = async (keyword = '', page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const keywordQuery = `%${keyword}%`;
  const totalQuery = `SELECT COUNT(*) FROM products WHERE name_en ILIKE $1`;

  const listQuery = `
    SELECT goods_code, name_en, description_en, main_image, channel_price, us_price, uk_price, created_at FROM products
    WHERE name_en ILIKE $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const totalRes = await client.query(totalQuery, [keywordQuery]);
  const total = parseInt(totalRes.rows[0].count);

  const result = await client.query(listQuery, [keywordQuery, limit, offset]);

  return {
    products: result.rows,
    total,
  };
};

exports.getProductDetail = async (goods_code) => {
  // Lấy thông tin chính
  const productRes = await client.query('SELECT * FROM products WHERE goods_code = $1', [goods_code]);
  if (!productRes.rows[0]) return null;
  const product = productRes.rows[0];

  // Lấy danh sách ảnh
  const imagesRes = await client.query('SELECT url FROM product_images WHERE goods_code = $1', [goods_code]);
  product.images = imagesRes.rows.map(row => row.url);

  // Lấy danh sách biến thể
  const variantsRes = await client.query('SELECT spec_name, spec_value FROM product_variants WHERE goods_code = $1', [goods_code]);
  product.variants = variantsRes.rows;

  return product;
};
