import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

const SECTORS = [
  'Pembangkit Listrik',
  'Industri Makanan dan Minuman',
  'Industri Semen',
  'Industri Tekstil dan Garmen',
  'Industri Alas Kaki',
  'Industri Besi dan Baja',
  'Industri petrokimia',
  'Industri Minyak dan Gas',
  'Industri Perkebunan',
  'Bangunan Gedung',
  'Industri Kimia',
  'Industri Tekstil/Kimia',
  'Industri Minyak Sawit'
];

const PROVINCES = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
  'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya'
];

const DataEntryForm = ({ isOpen, onClose, initialData = null }) => {
  const { addProject, editProject, allProjects } = useData();
  
  const uniqueCompanies = React.useMemo(() => {
    return [...new Set((allProjects || []).map(p => p.perusahaan).filter(Boolean))].sort();
  }, [allProjects]);
  
  const [isNewCompany, setIsNewCompany] = useState(false);

  const [formData, setFormData] = useState({
    perusahaan: '',
    alamat: '',
    sektor: SECTORS[0],
    jenisKegiatan: '',
    deskripsi: '',
    investasi: '',
    gj: ''
  });


  // Initialize selected company if none selected and there are existing ones
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          perusahaan: initialData.perusahaan || '',
          alamat: initialData.alamat || '',
          sektor: initialData.sektor || SECTORS[0],
          jenisKegiatan: initialData.jenisKegiatan || '',
          deskripsi: initialData.deskripsi || '',
          investasi: initialData.investasi || '',
          gj: initialData.penghematan || initialData.gj || '',
          bulan: initialData.bulan || ''
        });
        setIsNewCompany(false);
      } else {
        setFormData({
          perusahaan: uniqueCompanies.length > 0 ? uniqueCompanies[0] : '',
          alamat: '',
          sektor: SECTORS[0],
          jenisKegiatan: '',
          deskripsi: '',
          investasi: '',
          gj: '',
          bulan: ''
        });
        setIsNewCompany(false);
      }
    }
  }, [isOpen, initialData]); // Omit uniqueCompanies from deps to avoid overwriting edits

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse numeric fields
    const newProject = {
      ...formData,
      investasi: parseFloat(formData.investasi) || 0,
      gj: parseFloat(formData.gj) || 0
    };

    if (initialData && initialData.id) {
      editProject(initialData.id, newProject);
    } else {
      addProject(newProject);
    }
    
    // Reset form
    setFormData({
      perusahaan: uniqueCompanies.length > 0 ? uniqueCompanies[0] : '',
      alamat: '',
      sektor: SECTORS[0],
      jenisKegiatan: '',
      deskripsi: '',
      investasi: '',
      gj: ''
    });
    setIsNewCompany(false);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{initialData ? 'Edit Data Investasi' : 'Tambah Data Investasi'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <form id="data-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={labelStyle}>Nama Perusahaan / Instansi</label>
              <select 
                value={isNewCompany ? 'NEW' : formData.perusahaan} 
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setIsNewCompany(true);
                    setFormData(prev => ({ ...prev, perusahaan: '' }));
                  } else {
                    setIsNewCompany(false);
                    setFormData(prev => ({ ...prev, perusahaan: e.target.value }));
                  }
                }} 
                style={{...inputStyle, marginBottom: isNewCompany ? '0.5rem' : '0'}}
              >
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="NEW">+ Tambah Perusahaan Baru (Ketik Manual)</option>
              </select>
              
              {isNewCompany && (
                <input 
                  required 
                  type="text" 
                  name="perusahaan" 
                  value={formData.perusahaan} 
                  onChange={handleChange} 
                  style={{...inputStyle, marginTop: '0.5rem'}} 
                  placeholder="Ketik nama perusahaan baru..." 
                />
              )}
            </div>

            <div>
              <label style={labelStyle}>Alamat & Provinsi</label>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>*Pastikan menuliskan nama Provinsi dengan benar agar terdeteksi di Peta.</p>
              <input required type="text" name="alamat" value={formData.alamat} onChange={handleChange} style={inputStyle} placeholder="Contoh: Jl. Sudirman, Jawa Barat" />
            </div>

            <div>
              <label style={labelStyle}>Sektor</label>
              <select name="sektor" value={formData.sektor} onChange={handleChange} style={inputStyle}>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Jenis Kegiatan</label>
                <input required type="text" name="jenisKegiatan" value={formData.jenisKegiatan} onChange={handleChange} style={inputStyle} placeholder="Contoh: Modifikasi Alat" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Deskripsi Kegiatan</label>
                <input required type="text" name="deskripsi" value={formData.deskripsi} onChange={handleChange} style={inputStyle} placeholder="Contoh: Penggantian Chiller" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nilai Investasi (Rupiah)</label>
                <input required type="number" name="investasi" value={formData.investasi} onChange={handleChange} style={inputStyle} placeholder="Contoh: 5000000000" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Penghematan Energi (GJ)</label>
                <input required type="number" step="0.001" name="gj" value={formData.gj} onChange={handleChange} style={inputStyle} placeholder="Contoh: 1250.55" />
              </div>
            </div>

          </form>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
            Batal
          </button>
          <button type="submit" form="data-form" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '500', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
            Simpan Data
          </button>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .close-btn:hover { background-color: #f1f5f9; }
      `}} />
    </div>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  color: '#334155',
  fontWeight: '500',
  fontSize: '0.9rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

export default DataEntryForm;
