import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import MapDashboard from './pages/MapDashboard';
import DataTablePage from './pages/DataTablePage';
import { Map, Table } from 'lucide-react';
import './App.css';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
      <div>
        <h1>Dashboard Investasi Indonesia</h1>
        <p>Visualisasi Distribusi & Rekapitulasi Investasi Energi</p>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '12px' }}>
        <Link 
          to="/" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', 
            borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.9rem',
            backgroundColor: location.pathname === '/' ? 'white' : 'transparent',
            color: location.pathname === '/' ? '#2563eb' : '#64748b',
            boxShadow: location.pathname === '/' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <Map size={18} />
          Peta Interaktif
        </Link>
        <Link 
          to="/data" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', 
            borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.9rem',
            backgroundColor: location.pathname === '/data' ? 'white' : 'transparent',
            color: location.pathname === '/data' ? '#2563eb' : '#64748b',
            boxShadow: location.pathname === '/data' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <Table size={18} />
          Tabel Rekapitulasi
        </Link>
      </div>
    </header>
  );
};

const AppContent = () => {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content" style={{ padding: 0 }}>
        <Routes>
          <Route path="/" element={<MapDashboard />} />
          <Route path="/data" element={<DataTablePage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
}

export default App;
