import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import type { FileInfo } from '../App';
import QualityDashboard from './QualityDashboard';
import { analyzeData, type DataAnalysis } from '../utils/dataAnalysis';
import { generateReport } from '../utils/reportGenerator';

interface AnalysisPageProps {
  files: FileInfo[];
  onReset: () => void;
}

export default function AnalysisPage({ files, onReset }: AnalysisPageProps) {
  const [analyses, setAnalyses] = useState<Map<string, DataAnalysis>>(new Map());
  const [currentFile, setCurrentFile] = useState<string>(files[0]?.name || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const analyzeFiles = async () => {
      setIsLoading(true);
      const newAnalyses = new Map<string, DataAnalysis>();
      
      for (const file of files) {
        try {
          const analysis = await analyzeData(file.file);
          newAnalyses.set(file.name, analysis);
        } catch (error) {
          console.error(`Error analyzing file ${file.name}:`, error);
        }
      }
      
      setAnalyses(newAnalyses);
      setIsLoading(false);
    };

    analyzeFiles();
  }, [files]);

  const handleDownloadReport = () => {
    const currentAnalysis = analyses.get(currentFile);
    if (currentAnalysis) {
      generateReport(currentAnalysis, currentFile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  const currentAnalysis = analyses.get(currentFile);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onReset}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Upload
        </button>

        <button
          onClick={handleDownloadReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </button>
      </div>

      {files.length > 1 && (
        <div className="mb-6">
          <label htmlFor="fileSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select File to Analyze
          </label>
          <select
            id="fileSelect"
            value={currentFile}
            onChange={(e) => setCurrentFile(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {files.map((file, index) => (
              <option key={index} value={file.name}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <QualityDashboard analysis={currentAnalysis} />
    </div>
  );
}