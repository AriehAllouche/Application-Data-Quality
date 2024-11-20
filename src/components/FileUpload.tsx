import React, { useCallback, useRef } from 'react';
import { Upload, FileType, AlertCircle, X } from 'lucide-react';
import type { FileInfo } from '../App';

interface FileUploadProps {
  selectedFiles: FileInfo[];
  onFilesSelected: (files: FileInfo[]) => void;
  onAnalyze: () => void;
}

export default function FileUpload({ selectedFiles, onFilesSelected, onAnalyze }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFiles = (files: File[]) => {
    const fileInfos: FileInfo[] = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    onFilesSelected(fileInfos);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [onFilesSelected]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
  };

  const removeFile = (index: number) => {
    onFilesSelected(selectedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-4 border-dashed border-blue-200 rounded-xl p-12 text-center hover:border-blue-400 transition-colors"
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h3 className="text-2xl font-semibold mb-4">Upload Your Data Files</h3>
        <p className="text-gray-600 mb-6">
          Drag and drop your files here or click to select
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            className="hidden"
            multiple
            accept=".csv,.xlsx,.xls,.zip"
          />
          <button 
            onClick={handleFileSelect}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Files
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4">Selected Files</h4>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <FileType className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={onAnalyze}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Analyze Files
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 text-sm text-gray-500 mt-8">
          <div className="flex items-center justify-center gap-2">
            <FileType className="w-4 h-4" />
            <span>Supported formats: CSV, Excel (XLSX, XLS), ZIP</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Maximum file size: 100MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}