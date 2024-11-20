import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import QualityDashboard from './components/QualityDashboard';
import AnalysisPage from './components/AnalysisPage';

export type FileInfo = {
  name: string;
  size: number;
  type: string;
  file: File;
};

function App() {
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFilesSelected = (files: FileInfo[]) => {
    setSelectedFiles(files);
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
  };

  const resetAnalysis = () => {
    setIsAnalyzing(false);
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {!isAnalyzing ? (
          <FileUpload 
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesSelected}
            onAnalyze={startAnalysis}
          />
        ) : (
          <AnalysisPage 
            files={selectedFiles}
            onReset={resetAnalysis}
          />
        )}
      </main>
    </div>
  );
}

export default App;