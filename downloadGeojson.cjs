const https = require('https');
const fs = require('fs');
const path = require('path');

// URL for Indonesia GeoJSON
const url = 'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.geojson';

const dest = path.join(__dirname, 'public', 'indonesia.geojson');

https.get(url, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('GeoJSON downloaded successfully!');
    });
  } else {
    console.error(`Failed to download from URL. Status: ${res.statusCode}`);
    process.exit(1);
  }
}).on('error', (err) => {
  fs.unlink(dest, () => {});
  console.error(err.message);
});
