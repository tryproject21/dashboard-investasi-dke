import React from 'react';
import { COLOR_SCALE_PENGHEMATAN, COLOR_SCALE_INVESTASI, formatGj, formatRp } from '../utils/dataHelpers';

const Legend = ({ maxPenghematan, maxInvestasi, metric, setMetric }) => {
  const isPenghematan = metric === 'penghematan';
  const colorScale = isPenghematan ? COLOR_SCALE_PENGHEMATAN : COLOR_SCALE_INVESTASI;
  const maxValue = isPenghematan 
    ? (maxPenghematan ? formatGj(maxPenghematan) : 'Max GJ')
    : (maxInvestasi ? formatRp(maxInvestasi) : 'Max Rp');
  const title = isPenghematan ? 'Tingkat Penghematan Energi' : 'Total Investasi Rupiah';

  return (
    <div className="glass-panel legend-panel">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setMetric('penghematan')}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', backgroundColor: isPenghematan ? '#0284c7' : '#f1f5f9', color: isPenghematan ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '500', fontSize: '0.8rem', transition: 'all 0.2s' }}
        >Energi (GJ)</button>
        <button 
          onClick={() => setMetric('investasi')}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', backgroundColor: !isPenghematan ? '#16a34a' : '#f1f5f9', color: !isPenghematan ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '500', fontSize: '0.8rem', transition: 'all 0.2s' }}
        >Investasi (Rp)</button>
      </div>
      <h3 className="panel-title">{title}</h3>
      
      <div className="legend-gradient-container" style={{ marginTop: '1rem' }}>
        <div 
          className="gradient-bar" 
          style={{ 
            display: 'flex', 
            height: '12px', 
            borderRadius: '6px', 
            overflow: 'hidden',
            marginBottom: '0.5rem'
          }}
        >
          {colorScale.map((color, index) => (
            <div key={index} style={{ flex: 1, backgroundColor: color }}></div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
          <span>0</span>
          <span>{maxValue}</span>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fef3c7', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle' }}></span>
        <span style={{ verticalAlign: 'middle' }}>Belum ada investasi</span>
      </div>
    </div>
  );
};

export default Legend;
