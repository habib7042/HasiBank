const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGE_URL = 'https://dajzh8vovmxjoi7k.public.blob.vercel-storage.com/assets/1000051003.jpg';
const PUBLIC_DIR = path.join(__dirname, '../public');

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
};

async function generateIcons() {
  try {
    console.log('Downloading image...');
    const buffer = await downloadImage(IMAGE_URL);
    console.log('Image downloaded.');

    const sizes = [
      { name: 'icon-192x192.png', width: 192, height: 192 },
      { name: 'icon-512x512.png', width: 512, height: 512 },
      { name: 'apple-icon-180x180.png', width: 180, height: 180 },
    ];

    for (const size of sizes) {
      console.log(`Generating ${size.name}...`);
      await sharp(buffer)
        .resize(size.width, size.height)
        .toFormat('png')
        .toFile(path.join(PUBLIC_DIR, size.name));
    }

    // Generate favicon (32x32 png is commonly accepted as favicon these days or we can name it favicon.ico but keep png format, browsers are smart, but true ico requires special handling. Sharp can output png which acts as ico often, or just 32x32 png)
    console.log('Generating favicon.ico (as png)...');
    await sharp(buffer)
      .resize(32, 32)
      .toFormat('png')
      .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
