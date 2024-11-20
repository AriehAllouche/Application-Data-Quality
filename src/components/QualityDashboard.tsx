import React from 'react';
import { PieChart as PieChartIcon, BarChart as BarChartIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import type { DataAnalysis } from '../utils/dataAnalysis';
import Chart from './Chart';

interface QualityDashboardProps {
  analysis: DataAnalysis | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function QualityDashboard({ analysis }: QualityDashboardProps) {
  if (!analysis) return null;

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 text-green-700';
    if (score >= 50) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  const missingValuesData = analysis.columnsAnalysis.map(col => ({
    name: col.name,
    missing: col.missingPercentage
  }));

  const dataTypesData = analysis.columnsAnalysis.reduce((acc, col) => {
    const existing = acc.find(item => item.name === col.type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: col.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Data Quality Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Quality Score",
              value: `${analysis.qualityScore}%`,
              icon: <PieChartIcon className="w-6 h-6" />,
              color: getQualityColor(analysis.qualityScore)
            },
            {
              title: "Missing Values",
              value: `${(analysis.columnsAnalysis.reduce((sum, col) => 
                sum + col.missingCount, 0) / (analysis.totalRows * analysis.totalColumns) * 100).toFixed(1)}%`,
              icon: <AlertTriangle className="w-6 h-6" />,
              color: "bg-yellow-50 text-yellow-700"
            },
            {
              title: "Duplicates",
              value: analysis.duplicateRows,
              icon: <CheckCircle className="w-6 h-6" />,
              color: "bg-blue-50 text-blue-700"
            },
            {
              title: "Columns",
              value: analysis.totalColumns,
              icon: <BarChartIcon className="w-6 h-6" />,
              color: "bg-purple-50 text-purple-700"
            }
          ].map((metric, index) => (
            <div
              key={index}
              className={`${metric.color} rounded-xl p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{metric.title}</h3>
                {metric.icon}
              </div>
              <p className="text-3xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Data Preview (First 3 Rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {analysis.previewData[0].map((header, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysis.previewData.slice(1, 4).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cell?.toString() || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Chart title="Missing Values Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missingValuesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Missing %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="missing" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </Chart>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <Chart title="Data Type Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Chart>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Column Details</h3>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Column
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Missing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Missing Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Values
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysis.columnsAnalysis.map((col, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {col.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {col.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {col.missingPercentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {col.missingCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {col.uniqueValues}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {col.topValues.map((v, i) => (
                        <div key={i}>
                          {v.value}: {v.count}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}