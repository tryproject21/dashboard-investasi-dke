import React from 'react';
import { Building, MapPin, DollarSign, PieChart, TrendingUp, Award } from 'lucide-react';
import { SECTOR_COLORS } from '../utils/dataHelpers';

const InfoPanel = ({ province, data, nationalSummary }) => {
  if (!province) {
    if (nationalSummary) {
      return (
        <div className="glass-panel info-panel empty-state" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: '0.5rem' }}>
          <h2 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center', flexShrink: 0 }}>
            Ringkasan Nasional
          </h2>
          
          <div className="info-panel-content" style={{ overflowY: 'auto', paddingRight: '0.5rem', flex: 1 }}>
            <div className="national-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--color-pembangkit-listrik, #e0f2fe)', color: '#0369a1' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Investasi Nasional</span>
                <span className="stat-value text-blue">{nationalSummary.totalInvestasiFormatted}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginTop: '2px' }}>{nationalSummary.totalInvestasiUsdFormatted}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--color-nickel, #dcfce7)', color: '#15803d' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Penghematan Energi</span>
                <span className="stat-value text-green">{nationalSummary.totalPenghematanFormatted}</span>
              </div>
            </div>
          </div>

          <div className="top-provinces-section">
            <h3 className="section-subtitle">
              <Award size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Top 3 Provinsi (Investasi)
            </h3>
            <div className="top-list">
              {nationalSummary.top3Provinces.map((prov, index) => (
                <div key={prov.name} className="top-item">
                  <div className="top-rank" style={{ backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#cd7f32' }}>
                    #{index + 1}
                  </div>
                  <div className="top-details">
                    <span className="top-name">{prov.name}</span>
                    <span className="top-val">{prov.nilaiFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
              <div className="instruction-text" style={{ marginTop: '2rem', marginBottom: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                <i>Pilih provinsi pada peta untuk melihat rincian perusahaan dan sektor.</i>
              </div>
            </div>
        </div>
      );
    }

    return (
      <div className="glass-panel info-panel empty-state">
        <MapPin size={48} className="empty-icon" />
        <h3 className="empty-title">Pilih Provinsi</h3>
        <p className="empty-desc">Klik salah satu provinsi pada peta untuk melihat detail investasi efisiensi energi.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel info-panel active-state" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: '0.5rem' }}>
      <h2 className="province-title" style={{ flexShrink: 0, marginBottom: '1rem' }}>
        <MapPin size={24} className="icon-title" />
        {province}
      </h2>
      
      <div className="info-panel-content" style={{ overflowY: 'auto', paddingRight: '0.5rem', flex: 1 }}>
        {data ? (
          <div className="details-container">
          <div className="detail-item">
            <Building className="detail-icon" />
            <div className="detail-content">
              <span className="label">Bidang Investasi</span>
              <span className="value">{data.bidang}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <DollarSign className="detail-icon" />
              <div className="stat-info">
                <span className="stat-label">Total Investasi</span>
                <span className="stat-value text-blue">{data.nilaiFormatted}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginTop: '2px' }}>{data.usdFormatted}</span>
              </div>
          </div>
          
          <div className="detail-item">
            <PieChart className="detail-icon" />
            <div className="detail-content">
              <span className="label">Penghematan Energi</span>
              <span className="value">{data.gjFormatted}</span>
            </div>
          </div>

          {data.projects && data.projects.length > 0 && (
            <div className="projects-section">
              <h4 className="projects-title">Rincian Proyek</h4>
              <div className="projects-list">
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="project-card">
                    <div className="project-header">
                      <span className="project-company">{proj.perusahaan}</span>
                      <span className="project-sector" style={{ backgroundColor: SECTOR_COLORS[proj.sektor] || SECTOR_COLORS['Default'] }}>
                        {proj.sektor}
                      </span>
                    </div>
                    {proj.alamat !== '-' && (
                      <div className="project-address">
                        <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {proj.alamat}
                      </div>
                    )}
                    
                    <div className="project-desc">
                      {proj.jenisKegiatan && <span className="kegiatan-badge">{proj.jenisKegiatan}</span>}
                      {proj.deskripsi}
                    </div>
                    
                    <div className="project-stats">
                      <div className="project-inv">
                        <span className="stat-label-small">Investasi</span>
                        <span>{proj.investasiFormatted}</span>
                      </div>
                      <div className="project-gj">
                        <span className="stat-label-small">Penghematan</span>
                        <span>{proj.gjFormatted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        ) : (
          <div className="no-data-message">
            <p>Belum ada data investasi untuk provinsi ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
