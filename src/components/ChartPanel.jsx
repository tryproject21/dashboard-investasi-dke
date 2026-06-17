import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';
import { SECTOR_COLORS } from '../utils/dataHelpers';

const ChartPanel = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    const aggregated = {};
    if (data.sektorMap) {
      Object.entries(data.sektorMap).forEach(([sektor, nilai]) => {
        if (!aggregated[sektor]) aggregated[sektor] = 0;
        aggregated[sektor] += nilai;
      });
    }

    // Format for Recharts (Value in Billion Rp for readability)
    const result = Object.keys(aggregated).map((key) => ({
      name: key,
      value: Number((aggregated[key] / 1e9).toFixed(2))
    }));
    
    // Sort descending
    return result.sort((a, b) => b.value - a.value);
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="glass-panel chart-panel">
      <h3 className="panel-title">Distribusi Investasi Sektor</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SECTOR_COLORS[entry.name] || SECTOR_COLORS['Default']} 
                />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value) => [`Rp ${value} Miliar`, 'Total Investasi']}
              contentStyle={{ 
                borderRadius: '8px', 
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <RechartsLegend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px', lineHeight: '1.5' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartPanel;
