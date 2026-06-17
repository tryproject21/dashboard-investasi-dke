import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Download, Plus, Search, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { formatRp, formatGj } from '../utils/dataHelpers';
import DataEntryForm from '../components/DataEntryForm';
import Papa from 'papaparse';

const DataTablePage = () => {
  const { allProjects, rawCsvString, isLoading, deleteProject } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [editingProject, setEditingProject] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const itemsPerPage = 10;

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      deleteProject(id);
    }
  };

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Removed from here

  // Group projects by Company
  const groupedData = React.useMemo(() => {
    const groups = {};
    allProjects.forEach(p => {
      const comp = p.perusahaan || 'Tanpa Nama';
      if (!groups[comp]) {
        groups[comp] = {
          id: comp,
          perusahaan: comp,
          provinsi: new Set(),
          totalKegiatan: 0,
          totalInvestasi: 0,
          totalGj: 0,
          projects: []
        };
      }
      if (p.provinsi) groups[comp].provinsi.add(p.provinsi);
      groups[comp].totalKegiatan += 1;
      groups[comp].totalInvestasi += p.investasi || 0;
      groups[comp].totalGj += p.penghematan || 0;
      groups[comp].projects.push(p);
    });

    return Object.values(groups).map(g => ({
      ...g,
      provinsi: Array.from(g.provinsi).join(', '),
      investasiFormatted: formatRp(g.totalInvestasi),
      gjFormatted: formatGj(g.totalGj)
    }));
  }, [allProjects]);

  const filteredGroups = groupedData.filter(g => 
    (g.perusahaan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.provinsi || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adjust current page if it exceeds total pages
  React.useEffect(() => {
    const maxPage = Math.ceil(filteredGroups.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [filteredGroups.length, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, startIndex + itemsPerPage);



  const handleExport = () => {
    // We will export the raw CSV merged with the local storage data
    const localDataStr = localStorage.getItem('custom_investasi_data');
    let localData = [];
    if (localDataStr) {
      try {
        localData = JSON.parse(localDataStr);
      } catch (e) {}
    }

    if (localData.length === 0) {
      // If no new data, just download the original
      downloadBlob(rawCsvString, 'Investasi_Energi_Export.csv', 'text/csv;charset=utf-8;');
      return;
    }

    // Convert localData into CSV format that matches the original Book1.csv columns
    // Headers: No;Nama  Instansi/Perusahaan;Alamat;Sektor / Jenis;Jenis Kegiatan;Deskripsi (Jenis Kegiatan Efisiensi Energi);Nilai Investasi (Rp);Nilai Investasi (USD) (1 USD= Rp.16.500);Penghematan Energi (GJ);Sumber Data;Keterangan;Latt;Long;KBLI 2020;Bidang Usaha KBLI 2020;Status (PMA/PMDN)
    
    const localCsvRows = localData.map((d, index) => {
      // Build a row matching the 16 columns of the original
      const row = [
        `NEW-${index + 1}`,
        d.perusahaan || '',
        d.alamat || '',
        d.sektor || '',
        d.jenisKegiatan || '',
        d.deskripsi || '',
        d.investasi ? `Rp${d.investasi}` : '',
        '', // USD
        (d.gj || 0).toString().replace('.', ','), // GJ using comma for decimals in indonesian excel
        'Website Input',
        '', '', '', '', '', ''
      ];
      return row.join(';');
    });

    const combinedCsv = rawCsvString + '\n' + localCsvRows.join('\n');
    downloadBlob(combinedCsv, 'Investasi_Energi_Terbaru.csv', 'text/csv;charset=utf-8;');
  };

  const downloadBlob = (content, filename, contentType) => {
    const blob = new Blob(["\ufeff", content], { type: contentType }); // Add BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="data-table-page" style={{ padding: '2rem', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.5rem' }}>
            Rekapitulasi Data Investasi 
            {isLoading && <span style={{ fontSize: '1rem', color: '#94a3b8', marginLeft: '1rem' }}>(Memperbarui...)</span>}
          </h2>
          <p style={{ color: '#64748b' }}>Total {groupedData.length} Perusahaan</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <Download size={18} />
            Export CSV
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: 'white', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
          >
            <Plus size={18} />
            Tambah Data
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Cari perusahaan, provinsi, sektor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table Container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem', width: '40px' }}></th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>No</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>Perusahaan</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>Provinsi</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>Total Kegiatan</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>Total Investasi</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>Total Penghematan (GJ)</th>
              </tr>
            </thead>
            <tbody>
              {currentGroups.map((g, idx) => {
                const isExpanded = expandedRow === g.id;
                return (
                  <React.Fragment key={g.id}>
                    <tr 
                      onClick={() => setExpandedRow(isExpanded ? null : g.id)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', backgroundColor: isExpanded ? '#f8fafc' : 'white', transition: 'background 0.2s' }} 
                      className="table-row-hover"
                    >
                      <td style={{ padding: '1rem', color: '#64748b' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{startIndex + idx + 1}</td>
                      <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '600' }}>{g.perusahaan}</td>
                      <td style={{ padding: '1rem', color: '#334155' }}>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '500' }}>
                          {g.provinsi || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '500', textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>{g.totalKegiatan}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#16a34a', fontWeight: '600', fontSize: '0.9rem' }}>{g.investasiFormatted}</td>
                      <td style={{ padding: '1rem', color: '#0284c7', fontWeight: '600', fontSize: '0.9rem' }}>{g.gjFormatted}</td>
                    </tr>
                    
                    {/* Expandable Content (Projects List) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" style={{ padding: 0, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ padding: '1.5rem', marginLeft: '3rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '0.95rem' }}>Rincian Kegiatan / Proyek ({g.totalKegiatan}):</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                              <thead style={{ backgroundColor: '#f1f5f9' }}>
                                <tr>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Sektor</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Jenis Kegiatan</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Investasi</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Penghematan (GJ)</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {g.projects.map((proj, pIdx) => (
                                  <tr key={pIdx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#475569' }}>{proj.sektor || '-'}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                                      <div style={{ fontWeight: '500', color: '#0f172a' }}>{proj.jenisKegiatan || '-'}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{proj.deskripsi || ''}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#16a34a', fontWeight: '500' }}>{proj.investasiFormatted}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#0284c7', fontWeight: '500' }}>{proj.gjFormatted}</td>
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button onClick={() => handleEdit(proj)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '0.25rem' }} title="Edit Kegiatan">
                                          <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(proj.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }} title="Hapus Kegiatan">
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Tidak ada perusahaan yang cocok dengan pencarian "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredGroups.length)} dari {filteredGroups.length} perusahaan
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Sebelumnya
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages ? '#f1f5f9' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .table-row-hover:hover {
          background-color: #f8fafc;
        }
      `}} />

      <DataEntryForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <DataEntryForm isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingProject(null); }} initialData={editingProject} />
    </div>
  );
};

export default DataTablePage;
