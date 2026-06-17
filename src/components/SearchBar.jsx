import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ data, onSelectProvince }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase();

    // Find in provinces
    for (const [prov, provData] of Object.entries(data)) {
      if (prov.toLowerCase().includes(term)) {
        onSelectProvince(prov, provData);
        setSearchTerm('');
        setIsOpen(false);
        return;
      }
      
      // Find in companies
      for (const proj of provData.projects) {
        if (proj.perusahaan.toLowerCase().includes(term)) {
          onSelectProvince(prov, provData);
          setSearchTerm('');
          setIsOpen(false);
          return;
        }
      }
    }

    // Not found
    alert('Provinsi atau perusahaan tidak ditemukan.');
  };

  return (
    <div className={`search-container ${isOpen ? 'open' : ''}`}>
      <form onSubmit={handleSearch} className="search-form">
        <button type="button" className="search-icon-btn" onClick={() => setIsOpen(!isOpen)}>
          <Search size={20} />
        </button>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Cari provinsi atau perusahaan..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isOpen && (
          <button type="submit" className="search-submit-btn">Cari</button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
