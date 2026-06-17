import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthlyData } from '../utils/dataHelpers';

const MonthlyChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];
    return getMonthlyData(data);
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="glass-panel chart-panel monthly-chart">
      <h3 className="panel-title">Tren Investasi Bulanan (Miliar Rp)</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <RechartsTooltip 
              formatter={(value) => [`Rp ${value} Miliar`, 'Investasi']}
              contentStyle={{ 
                borderRadius: '8px', 
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;
