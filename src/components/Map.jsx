import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SECTOR_COLORS, getColorForPenghematan, getColorForInvestasi } from '../utils/dataHelpers';

const MapClickHandler = ({ onSelectProvince }) => {
  useMapEvents({
    click: () => {
      onSelectProvince(null, null); // Clear selection on map click
    }
  });
  return null;
};

const Map = ({ data, maxPenghematan, maxInvestasi, mapMetric, onSelectProvince }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [worldGeoJson, setWorldGeoJson] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    fetch('/indonesia.geojson')
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error('Error fetching GeoJSON:', error));

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then((response) => response.json())
      .then((data) => setWorldGeoJson(data))
      .catch((error) => console.error('Error fetching World GeoJSON:', error));
  }, []);

  const styleFeature = (feature) => {
    const provName = feature.properties.Propinsi || feature.properties.state || feature.properties.name || feature.properties.name_1 || feature.properties.NAME_1;
    // Some common normalizations for the geojson
    let matchKey = provName;
    if (provName === 'DKI JAKARTA' || provName === 'Jakarta Raya' || provName === 'Jakarta Special Capital Region') matchKey = 'DKI Jakarta';
    if (provName === 'JAWA TIMUR' || provName === 'East Java') matchKey = 'Jawa Timur';
    if (provName === 'JAWA BARAT' || provName === 'West Java') matchKey = 'Jawa Barat';
    if (provName === 'KALIMANTAN SELATAN' || provName === 'South Kalimantan') matchKey = 'Kalimantan Selatan';
    if (provName === 'SUMATERA UTARA' || provName === 'North Sumatra') matchKey = 'Sumatera Utara';
    if (provName === 'RIAU') matchKey = 'Riau';
    if (provName === 'PAPUA SELATAN' || provName === 'South Papua') matchKey = 'Papua Selatan';

    const cleanName = (matchKey || '').trim();
    // Case insensitive match
    const dataKey = Object.keys(data).find(k => k.toLowerCase() === cleanName.toLowerCase());
    const provData = data[dataKey];

    let fillColor = SECTOR_COLORS['Default'];
    if (provData) {
      if (mapMetric === 'penghematan' && provData.penghematanTotal > 0) {
        fillColor = getColorForPenghematan(provData.penghematanTotal, maxPenghematan);
      } else if (mapMetric === 'investasi' && provData.investasiTotal > 0) {
        fillColor = getColorForInvestasi(provData.investasiTotal, maxInvestasi);
      }
    }

    return {
      fillColor: fillColor,
      weight: 0.5,
      opacity: 1,
      color: '#cbd5e1',
      fillOpacity: provData ? 0.85 : 1, // solid color for empty provinces
    };
  };

  const onEachFeature = (feature, layer) => {
    const provName = feature.properties.Propinsi || feature.properties.state || feature.properties.name || feature.properties.name_1 || feature.properties.NAME_1;
    
    let matchKey = provName;
    if (provName === 'DKI JAKARTA' || provName === 'Jakarta Raya' || provName === 'Jakarta Special Capital Region') matchKey = 'DKI Jakarta';
    if (provName === 'JAWA TIMUR' || provName === 'East Java') matchKey = 'Jawa Timur';
    if (provName === 'JAWA BARAT' || provName === 'West Java') matchKey = 'Jawa Barat';
    if (provName === 'KALIMANTAN SELATAN' || provName === 'South Kalimantan') matchKey = 'Kalimantan Selatan';
    if (provName === 'SUMATERA UTARA' || provName === 'North Sumatra') matchKey = 'Sumatera Utara';
    if (provName === 'RIAU') matchKey = 'Riau';
    if (provName === 'PAPUA SELATAN' || provName === 'South Papua') matchKey = 'Papua Selatan';

    const cleanName = (matchKey || '').trim();
    const dataKey = Object.keys(data).find(k => k.toLowerCase() === cleanName.toLowerCase());
    const provData = data[dataKey];

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#2563eb',
          fillOpacity: 1
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        // reset to original style
        layer.setStyle(styleFeature(feature));
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectProvince(cleanName, provData);
      }
    });
  };

  return (
    <div className="map-container">
      {geoJsonData ? (
        <MapContainer
          center={[-0.789275, 113.921327]}
          zoom={5}
          style={{ height: '100%', width: '100%', background: '#bae6fd' }}
          zoomControl={false}
          ref={mapRef}
        >
          <MapClickHandler onSelectProvince={onSelectProvince} />
          {worldGeoJson && (
            <GeoJSON
              data={worldGeoJson}
              filter={(feature) => feature.id !== 'IDN' && feature.properties.name !== 'Indonesia'}
              style={{
                fillColor: '#e2e8f0', // Light gray for other countries (slate-200)
                weight: 0.5,
                color: '#cbd5e1',
                fillOpacity: 1
              }}
              interactive={false}
            />
          )}
          <GeoJSON
            data={geoJsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      ) : (
        <div className="loading-map">Loading Map Data...</div>
      )}
    </div>
  );
};

export default Map;
