import React, { createContext, useState, useEffect, useContext } from 'react';
import { parseCsvData, extractProvinceFromAddress, formatRp, formatGj } from '../utils/dataHelpers';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [investmentData, setInvestmentData] = useState({});
  const [maxPenghematan, setMaxPenghematan] = useState(0);
  const [maxInvestasi, setMaxInvestasi] = useState(0);
  const [nationalSummary, setNationalSummary] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Expose raw data string so we can export later
  const [rawCsvString, setRawCsvString] = useState('');

  const loadData = async () => {
    try {
      const response = await fetch('/Book1.csv');
      const csvString = await response.text();
      setRawCsvString(csvString);

      // Load edits and deletes
      const deletedStr = localStorage.getItem('custom_deleted_items');
      const deletedItems = deletedStr ? JSON.parse(deletedStr) : [];
      
      const editedStr = localStorage.getItem('custom_edited_items');
      const editedItems = editedStr ? JSON.parse(editedStr) : {};

      const parsedResult = await parseCsvData(csvString, deletedItems, editedItems);
      let { data, maxPenghematan, maxInvestasi, nationalSummary } = parsedResult;
      
      // Inject Local Storage Data
      const localDataStr = localStorage.getItem('custom_investasi_data');
      let localData = [];
      if (localDataStr) {
        try {
          localData = JSON.parse(localDataStr);
        } catch (e) {}
      }

      // Merge local data into parsed maps
      localData.forEach(proj => {
        const prov = extractProvinceFromAddress(proj.alamat) || 'Lainnya';
        if (!data[prov]) {
          data[prov] = { investasiTotal: 0, penghematanTotal: 0, sektorMap: {}, perusahaanList: [], projects: [] };
        }
        
        data[prov].investasiTotal += (proj.investasi || 0);
        data[prov].penghematanTotal += (proj.gj || 0);
        if (proj.perusahaan) data[prov].perusahaanList.push(proj.perusahaan);
        if (proj.sektor) {
          data[prov].sektorMap[proj.sektor] = (data[prov].sektorMap[proj.sektor] || 0) + (proj.investasi || 0);
        }
        
        data[prov].projects.push({
          id: proj.id || `local-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          perusahaan: proj.perusahaan,
          sektor: proj.sektor,
          alamat: proj.alamat,
          deskripsi: proj.deskripsi,
          jenisKegiatan: proj.jenisKegiatan,
          bulan: proj.bulan || '',
          investasi: proj.investasi,
          penghematan: proj.gj,
          investasiFormatted: formatRp(proj.investasi || 0),
          gjFormatted: formatGj(proj.gj || 0)
        });

        // Update Maxs
        if (data[prov].penghematanTotal > maxPenghematan) maxPenghematan = data[prov].penghematanTotal;
        if (data[prov].investasiTotal > maxInvestasi) maxInvestasi = data[prov].investasiTotal;
      });

      // Recalculate National Summary if local data exists
      if (localData.length > 0) {
        let totalInv = 0;
        let totalGj = 0;
        const provArray = [];

        Object.entries(data).forEach(([provName, pd]) => {
          totalInv += pd.investasiTotal;
          totalGj += pd.penghematanTotal;
          provArray.push({ name: provName, inv: pd.investasiTotal });
          pd.nilaiFormatted = formatRp(pd.investasiTotal);
          pd.gjFormatted = formatGj(pd.penghematanTotal);
        });

        const top3 = provArray
          .sort((a, b) => b.inv - a.inv)
          .slice(0, 3)
          .map(p => ({
            name: p.name,
            nilaiFormatted: formatRp(p.inv)
          }));

        // Also need to compute totalNasionalSektorMap and nationalProjects from scratch if we want full integration, but since they are added, we just modify the existing nationalSummary
        const newSektorMap = { ...nationalSummary.sektorMap };
        localData.forEach(p => {
            if(p.sektor) newSektorMap[p.sektor] = (newSektorMap[p.sektor] || 0) + (p.investasi || 0);
            if(!nationalSummary.projects.find(x => x.id === p.id)) {
                nationalSummary.projects.push({
                    id: p.id,
                    investasi: p.investasi || 0,
                    bulan: p.bulan || ''
                });
            }
        });

        nationalSummary = {
          investasiTotal: totalInv,
          penghematanTotal: totalGj,
          totalInvestasiFormatted: formatRp(totalInv),
          totalPenghematanFormatted: formatGj(totalGj),
          top3Provinces: top3,
          sektorMap: newSektorMap,
          projects: nationalSummary.projects
        };
      }

      setInvestmentData(data);
      setMaxPenghematan(maxPenghematan);
      setMaxInvestasi(maxInvestasi);
      setNationalSummary(nationalSummary);

      // Extract all projects flat list
      const projectsList = [];
      Object.keys(data).forEach(prov => {
        data[prov].projects.forEach(p => {
          projectsList.push({ ...p, provinsi: prov });
        });
      });
      setAllProjects(projectsList);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProject = (newProject) => {
    newProject.id = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const localDataStr = localStorage.getItem('custom_investasi_data');
    let localData = [];
    if (localDataStr) {
      try {
        localData = JSON.parse(localDataStr);
      } catch (e) {}
    }
    localData.push(newProject);
    localStorage.setItem('custom_investasi_data', JSON.stringify(localData));
    
    // Reload data to reflect changes
    setIsLoading(true);
    loadData();
  };

  const deleteProject = (id) => {
    if (id.startsWith('local-')) {
       const localDataStr = localStorage.getItem('custom_investasi_data');
       if (localDataStr) {
         let localData = JSON.parse(localDataStr);
         localData = localData.filter(p => p.id !== id);
         localStorage.setItem('custom_investasi_data', JSON.stringify(localData));
       }
    } else {
       const deletedStr = localStorage.getItem('custom_deleted_items');
       let deletedItems = deletedStr ? JSON.parse(deletedStr) : [];
       deletedItems.push(id);
       localStorage.setItem('custom_deleted_items', JSON.stringify(deletedItems));
    }
    setIsLoading(true);
    loadData();
  };

  const editProject = (id, newData) => {
    if (id.startsWith('local-')) {
       const localDataStr = localStorage.getItem('custom_investasi_data');
       if (localDataStr) {
         let localData = JSON.parse(localDataStr);
         const idx = localData.findIndex(p => p.id === id);
         if (idx !== -1) {
           localData[idx] = { ...localData[idx], ...newData };
           localStorage.setItem('custom_investasi_data', JSON.stringify(localData));
         }
       }
    } else {
       const editedStr = localStorage.getItem('custom_edited_items');
       let editedItems = editedStr ? JSON.parse(editedStr) : {};
       editedItems[id] = { ...editedItems[id], ...newData };
       localStorage.setItem('custom_edited_items', JSON.stringify(editedItems));
    }
    setIsLoading(true);
    loadData();
  };

  return (
    <DataContext.Provider value={{ investmentData, maxPenghematan, maxInvestasi, nationalSummary, allProjects, isLoading, addProject, deleteProject, editProject, rawCsvString }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
