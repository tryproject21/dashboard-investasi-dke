import Papa from 'papaparse';

export const PROVINCES_LIST = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
  'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya'
];

export const SECTOR_COLORS = {
  'Pembangkit Listrik': '#EF4444', // Red
  'Industri Makanan dan Minuman': '#F59E0B', // Amber
  'Industri Semen': '#6B7280', // Gray
  'Industri Tekstil dan Garmen': '#8B5CF6', // Violet
  'Industri Alas Kaki': '#EC4899', // Pink
  'Industri Besi dan Baja': '#475569', // Slate
  'Industri petrokimia': '#14B8A6', // Teal
  'Industri Minyak dan Gas': '#3B82F6', // Blue
  'Industri Perkebunan': '#84CC16', // Lime
  'Bangunan Gedung': '#F97316', // Orange
  'Industri Kimia': '#06B6D4', // Cyan
  'Industri Tekstil/Kimia': '#A855F7', // Purple
  'Industri Minyak Sawit': '#EAB308', // Yellow
  'Default': '#fef3c7' // Beige untuk provinsi kosong
};

export const COLOR_SCALE_PENGHEMATAN = [
  '#dcfce7', // Sangat rendah (green-100)
  '#bbf7d0',
  '#86efac',
  '#4ade80',
  '#22c55e', // Menengah
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d'  // Sangat tinggi (green-900)
];

export const COLOR_SCALE_INVESTASI = [
  '#e0f2fe', // Sangat rendah (sky-100)
  '#bae6fd',
  '#7dd3fc',
  '#38bdf8',
  '#0ea5e9', // Menengah
  '#0284c7',
  '#0369a1',
  '#075985',
  '#0c4a6e'  // Sangat tinggi (sky-900)
];

export function getColorForPenghematan(nilai, maxNilai) {
  if (!nilai || nilai <= 0 || !maxNilai || maxNilai <= 0) return SECTOR_COLORS['Default'];
  
  // Menggunakan skala logaritmik agar data yang timpang (sangat besar vs sangat kecil) bisa terlihat perbedaannya
  const logNilai = Math.log10(nilai + 1);
  const logMax = Math.log10(maxNilai + 1);
  
  const ratio = logNilai / logMax;
  const index = Math.min(Math.floor(ratio * COLOR_SCALE_PENGHEMATAN.length), COLOR_SCALE_PENGHEMATAN.length - 1);
  return COLOR_SCALE_PENGHEMATAN[Math.max(0, index)];
}

export function getColorForInvestasi(nilai, maxNilai) {
  if (!nilai || nilai <= 0 || !maxNilai || maxNilai <= 0) return SECTOR_COLORS['Default'];
  
  const logNilai = Math.log10(nilai + 1);
  const logMax = Math.log10(maxNilai + 1);
  
  const ratio = logNilai / logMax;
  const index = Math.min(Math.floor(ratio * COLOR_SCALE_INVESTASI.length), COLOR_SCALE_INVESTASI.length - 1);
  return COLOR_SCALE_INVESTASI[Math.max(0, index)];
}

// Function to extract province from address string
export function extractProvinceFromAddress(address) {
  if (!address) return null;
  const addressUpper = address.toUpperCase();
  
  // Hardcoded mappings for addresses that lack explicit province names
  if (addressUpper.includes('PASURUAN') || addressUpper.includes('MOJOKERTO') || addressUpper.includes('EAST JAVA')) return 'Jawa Timur';
  if (addressUpper.includes('KARAWANG') || addressUpper.includes('PURWAKARTA') || addressUpper.includes('WEST JAVA')) return 'Jawa Barat';
  if (addressUpper.includes('BALI') || addressUpper.includes('DENPASAR')) return 'Bali';
  if (addressUpper.includes('KALIMANTAN TENGAH') || addressUpper.includes('PALANGKARAYA') || addressUpper.includes('PULANG PISAU')) return 'Kalimantan Tengah';
  if (addressUpper.includes('LAMPUNG') || addressUpper.includes('TERBANGGI BESAR')) return 'Lampung';

  for (const prov of PROVINCES_LIST) {
    if (addressUpper.includes(prov.toUpperCase())) {
      return prov;
    }
  }
  // Fallbacks for typos or variations
  if (addressUpper.includes('JAKARTA')) return 'DKI Jakarta';
  return null;
}

// Helper to convert Rp string to number (Rp3.500.000.000 -> 3500000000)
function parseRp(valueStr) {
  if (!valueStr) return 0;
  return parseFloat(valueStr.replace(/Rp|\./g, '').trim()) || 0;
}

// Helper to format Rp
export function formatRp(num) {
  if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(2)} Triliun`;
  if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(2)} Miliar`;
  if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(2)} Juta`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

// Helper to format USD (Assuming 1 USD = Rp 16.500)
export function formatUsd(num) {
  if (num >= 1e9) return `$ ${(num / 1e9).toFixed(2)} Miliar`;
  if (num >= 1e6) return `$ ${(num / 1e6).toFixed(2)} Juta`;
  return `$ ${num.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
}

// Helper to parse GJ (741,226 -> 741.226)
function parseGj(valueStr) {
  if (!valueStr) return 0;
  // some are using dot for thousand separator, some use comma for decimal.
  // Standard CSV usually: "85605,7" -> 85605.7
  // If it's "1.273.850", it might be a thousand separator.
  // Let's remove dots, replace comma with dot
  const cleanStr = valueStr.replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleanStr) || 0;
}

export function formatGj(num) {
  return `${num.toLocaleString('id-ID')} GJ`;
}

export function parseCsvData(csvText, deletedItems = [], editedItems = {}) {
  return new Promise((resolve, reject) => {
    // The CSV has headers on line 3, so we might need to skip the first two lines
    // "CAPAIAN INVESTASI..."
    // ""
    // "No;Nama  Instansi..."
    const lines = csvText.split('\n');
    let dataLines = lines;
    if (lines[0].includes('CAPAIAN')) {
      dataLines = lines.slice(2);
    }
    const cleanCsvText = dataLines.join('\n');

    Papa.parse(cleanCsvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      complete: (results) => {
        const data = results.data;
        const mappedData = {}; // key: Province Name
        
        let lastPerusahaan = '';
        let lastAlamat = '';
        let lastSektor = '';
        let globalCsvCounter = 0;

        data.forEach(row => {
          const keys = Object.keys(row);
          const getVal = (keyContains) => {
            const exactKey = keys.find(k => k.toLowerCase().includes(keyContains.toLowerCase()));
            return exactKey ? row[exactKey] : '';
          };
          
          const currentId = `csv-${globalCsvCounter++}`;

          // Skip if deleted
          if (deletedItems.includes(currentId)) return;

          // Apply edits if exist
          const edits = editedItems[currentId] || {};
          
          let perusahaan = edits.perusahaan !== undefined ? edits.perusahaan : (getVal('Nama  Instansi') || getVal('Perusahaan'));
          
          if (typeof perusahaan === 'string' && perusahaan.toLowerCase().includes('total investasi')) return;
          
          let sektor = edits.sektor !== undefined ? edits.sektor : (getVal('Sektor') || getVal('Sektor / Jenis'));
          let jenisKegiatan = edits.jenisKegiatan !== undefined ? edits.jenisKegiatan : getVal('Jenis Kegiatan');
          let deskripsi = edits.deskripsi !== undefined ? edits.deskripsi : getVal('Deskripsi');
          let alamat = edits.alamat !== undefined ? edits.alamat : getVal('Alamat');
          let bulan = edits.bulan !== undefined ? edits.bulan : getVal('Keterangan');

          // Handling Excel Merged Cells
          if (alamat && alamat.trim() !== '') lastAlamat = alamat;
          else alamat = lastAlamat;

          if (perusahaan && perusahaan.trim() !== '') lastPerusahaan = perusahaan;
          else perusahaan = lastPerusahaan;

          if (sektor && sektor.trim() !== '') lastSektor = sektor;
          else sektor = lastSektor;

          if (!alamat) return; // skip totals or empty rows
          
          const prov = extractProvinceFromAddress(alamat);
          if (!prov) return; // could not detect province

          const invRpStr = getVal('Nilai Investasi (Rp)');
          const gjStr = getVal('Penghematan Energi');

          const invRp = edits.investasi !== undefined ? parseFloat(edits.investasi) || 0 : parseRp(invRpStr);
          const gj = edits.gj !== undefined ? parseFloat(edits.gj) || 0 : parseGj(gjStr);

          if (!mappedData[prov]) {
            mappedData[prov] = {
              investasiTotal: 0,
              penghematanTotal: 0,
              sektorMap: {},
              perusahaanList: [],
              projects: [] // NEW: store detailed projects
            };
          }

          const provData = mappedData[prov];
          provData.investasiTotal += invRp;
          provData.penghematanTotal += gj;
          
          if (perusahaan) provData.perusahaanList.push(perusahaan.trim());
          if (sektor) {
            const cleanSektor = sektor.trim();
            provData.sektorMap[cleanSektor] = (provData.sektorMap[cleanSektor] || 0) + invRp;
          }

          provData.projects.push({
            id: currentId,
            perusahaan: perusahaan || '',
            sektor: sektor || '',
            alamat: alamat || '',
            deskripsi: deskripsi || '',
            jenisKegiatan: jenisKegiatan || '',
            bulan: bulan || '',
            investasi: invRp,
            penghematan: gj,
            investasiFormatted: formatRp(invRp),
            gjFormatted: formatGj(gj)
          });
        });
        
        // Post process to find dominant sector for coloring and max metrics
        let maxPenghematan = 0;
        let maxInvestasi = 0;
        let totalNasionalInvestasi = 0;
        let totalNasionalPenghematan = 0;
        const nationalSektorMap = {};
        const nationalProjects = [];

        const provArray = [];

        Object.keys(mappedData).forEach(prov => {
          const pd = mappedData[prov];
          let dominantSektor = '';
          let maxInv = -1;
          for (const [sek, val] of Object.entries(pd.sektorMap)) {
            if (val > maxInv) {
              maxInv = val;
              dominantSektor = sek;
            }
          }
          pd.bidang = dominantSektor;
          pd.nilaiFormatted = formatRp(pd.investasiTotal);
          pd.usdFormatted = formatUsd(pd.investasiTotal / 16500);
          pd.gjFormatted = formatGj(pd.penghematanTotal);
          
          if (pd.penghematanTotal > maxPenghematan) maxPenghematan = pd.penghematanTotal;
          if (pd.investasiTotal > maxInvestasi) maxInvestasi = pd.investasiTotal;

          totalNasionalInvestasi += pd.investasiTotal;
          totalNasionalPenghematan += pd.penghematanTotal;
          
          for (const [sek, val] of Object.entries(pd.sektorMap)) {
            nationalSektorMap[sek] = (nationalSektorMap[sek] || 0) + val;
          }
          if (pd.projects) {
            nationalProjects.push(...pd.projects);
          }

          // Remove duplicates
          pd.perusahaanList = [...new Set(pd.perusahaanList)];
          
          provArray.push({
            name: prov,
            investasiTotal: pd.investasiTotal,
            penghematanTotal: pd.penghematanTotal,
            nilaiFormatted: pd.nilaiFormatted,
            gjFormatted: pd.gjFormatted
          });
        });

        // Get Top 3 Provinces by Investasi (or penghematan, let's use Investasi for ranking)
        const top3Provinces = provArray
          .sort((a, b) => b.penghematanTotal - a.penghematanTotal)
          .slice(0, 3);

        const nationalSummary = {
          investasiTotal: totalNasionalInvestasi,
          penghematanTotal: totalNasionalPenghematan,
          totalInvestasiFormatted: formatRp(totalNasionalInvestasi),
          totalInvestasiUsdFormatted: formatUsd(totalNasionalInvestasi / 16500),
          totalPenghematanFormatted: formatGj(totalNasionalPenghematan),
          top3Provinces,
          sektorMap: nationalSektorMap,
          projects: nationalProjects
        };

        resolve({ data: mappedData, maxPenghematan, maxInvestasi, nationalSummary });
      },
      error: (error) => reject(error)
    });
  });
}

// Extract monthly aggregated data from the parsed dataset
export function getMonthlyData(data) {
  const monthsOrder = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthlyAgg = {};

  if (data && data.projects) {
    data.projects.forEach(proj => {
      const bln = proj.bulan;
      if (bln) {
        if (!monthlyAgg[bln]) monthlyAgg[bln] = 0;
        monthlyAgg[bln] += proj.investasi;
      }
    });
  }

  // Convert to array and sort by month chronological order
  const result = Object.keys(monthlyAgg).map(key => ({
    name: key,
    value: Number((monthlyAgg[key] / 1e9).toFixed(2)) // in Billion Rp
  }));

  result.sort((a, b) => {
    let idxA = monthsOrder.indexOf(a.name);
    let idxB = monthsOrder.indexOf(b.name);
    if (idxA === -1) idxA = 99;
    if (idxB === -1) idxB = 99;
    return idxA - idxB;
  });

  return result;
}
