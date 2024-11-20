import React from 'react';
import { FileCheck, BarChart2, FileOutput } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Data Quality Analysis</h1>
        <p className="text-xl mb-8 text-blue-100">Transform your raw data into actionable insights</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              icon: <FileCheck className="w-8 h-8 mb-4" />,
              title: "Data Analysis",
              description: "Comprehensive quality assessment of your datasets"
            },
            {
              icon: <BarChart2 className="w-8 h-8 mb-4" />,
              title: "Visual Insights",
              description: "Interactive visualizations of data quality metrics"
            },
            {
              icon: <FileOutput className="w-8 h-8 mb-4" />,
              title: "Export Reports",
              description: "Download detailed analysis reports in PDF format"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-blue-100">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}