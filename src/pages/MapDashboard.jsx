import React, { useState } from 'react';
import Map from '../components/Map';
import Legend from '../components/Legend';
import InfoPanel from '../components/InfoPanel';
import ChartPanel from '../components/ChartPanel';
import MonthlyChart from '../components/MonthlyChart';
import SearchBar from '../components/SearchBar';
import { useData } from '../context/DataContext';

const MapDashboard = () => {
  const { investmentData, maxPenghematan, maxInvestasi, nationalSummary, isLoading } = useData();
  
  const [mapMetric, setMapMetric] = useState('penghematan'); // 'penghematan' | 'investasi'
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  if (isLoading) {
    return <div className="loading-state">Memuat Data Investasi...</div>;
  }

  const handleSelectProvince = (provinceName, data) => {
    setSelectedProvince(provinceName);
    setSelectedData(data);
  };

  return (
    <div className="map-wrapper">
      <Map 
        data={investmentData} 
        onSelectProvince={handleSelectProvince} 
        maxPenghematan={maxPenghematan}
        maxInvestasi={maxInvestasi}
        mapMetric={mapMetric}
      />
      
      <div className="overlays">
        <div className="left-panels">
          <Legend metric={mapMetric} setMetric={setMapMetric} maxPenghematan={maxPenghematan} maxInvestasi={maxInvestasi} />
          {nationalSummary && <ChartPanel data={selectedData || nationalSummary} province={selectedProvince || 'Nasional'} />}
          {nationalSummary && <MonthlyChart data={selectedData || nationalSummary} />}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end', height: '100%', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <SearchBar data={investmentData} onSelectProvince={handleSelectProvince} />
          </div>
          <div style={{ pointerEvents: 'auto', flex: 1, overflow: 'hidden' }}>
            <InfoPanel 
              province={selectedProvince} 
              data={selectedData} 
              nationalSummary={nationalSummary}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
