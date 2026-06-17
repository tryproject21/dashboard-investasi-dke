import fs from 'fs';
import { parseCsvData } from './src/utils/dataHelpers.js';

const csvText = fs.readFileSync('public/Book1.csv', 'utf8');
parseCsvData(csvText).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(err => {
  console.error("Error:", err);
});
