import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ColumnAnalysis {
  name: string;
  type: string;
  missingCount: number;
  missingPercentage: number;
  uniqueValues: number;
  duplicateCount: number;
  outliers: number;
  mean?: number;
  median?: number;
  mode?: string | number;
  topValues: Array<{ value: string | number; count: number }>;
}

export interface DataAnalysis {
  totalRows: number;
  totalColumns: number;
  columnsAnalysis: ColumnAnalysis[];
  duplicateRows: number;
  qualityScore: number;
  correlationMatrix?: Record<string, Record<string, number>>;
  previewData: any[][];
}

const detectDataType = (values: any[]): string => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'unknown';

  const numericCount = nonNullValues.filter(v => !isNaN(Number(v))).length;
  const dateCount = nonNullValues.filter(v => !isNaN(Date.parse(v))).length;

  if (numericCount / nonNullValues.length > 0.8) return 'numeric';
  if (dateCount / nonNullValues.length > 0.8) return 'datetime';
  return 'categorical';
};

const calculateOutliers = (values: number[]): number => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(v => v < lowerBound || v > upperBound).length;
};

const getTopValues = (values: any[]): Array<{ value: string | number; count: number }> => {
  const valueFrequency = values.reduce((acc, val) => {
    if (val !== null && val !== undefined && val !== '') {
      acc[val] = (acc[val] || 0) + 1;
    }
    return acc;
  }, {} as Record<string | number, number>);

  return Object.entries(valueFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([value, count]) => ({ value, count }));
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export const analyzeData = async (file: File): Promise<DataAnalysis> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let data: any[][] = [];
        let headers: string[] = [];
        let previewData: any[][] = [];

        if (file.name.endsWith('.csv')) {
          const result = Papa.parse(e.target?.result as string, { header: true });
          headers = result.meta.fields || [];
          data = result.data;
          previewData = [headers, ...data.slice(0, 3)];
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          headers = jsonData[0] as string[];
          data = jsonData.slice(1);
          previewData = jsonData.slice(0, 4);
        }

        const columnsAnalysis: ColumnAnalysis[] = headers.map((header, colIndex) => {
          const values = data.map(row => row[colIndex]);
          const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
          const type = detectDataType(values);
          const topValues = getTopValues(values);
          
          let analysis: ColumnAnalysis = {
            name: header,
            type,
            missingCount: values.length - nonNullValues.length,
            missingPercentage: ((values.length - nonNullValues.length) / values.length) * 100,
            uniqueValues: new Set(values).size,
            duplicateCount: values.length - new Set(values).size,
            outliers: type === 'numeric' ? calculateOutliers(values.map(Number)) : 0,
            topValues
          };

          if (type === 'numeric') {
            const numericValues = nonNullValues.map(Number);
            analysis.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            const sorted = [...numericValues].sort((a, b) => a - b);
            analysis.median = sorted[Math.floor(sorted.length / 2)];
          }

          const valueFrequency = values.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {} as Record<string | number, number>);
          
          analysis.mode = Object.entries(valueFrequency)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];

          return analysis;
        });

        // Calculate correlation matrix for numeric columns
        const numericColumns = columnsAnalysis
          .filter(col => col.type === 'numeric')
          .map(col => col.name);
        
        const correlationMatrix: Record<string, Record<string, number>> = {};
        
        numericColumns.forEach(col1 => {
          correlationMatrix[col1] = {};
          const values1 = data.map(row => Number(row[headers.indexOf(col1)]));
          
          numericColumns.forEach(col2 => {
            const values2 = data.map(row => Number(row[headers.indexOf(col2)]));
            correlationMatrix[col1][col2] = calculateCorrelation(values1, values2);
          });
        });

        // Calculate quality score
        const missingWeight = 0.3;
        const duplicateWeight = 0.3;
        const outlierWeight = 0.2;
        const typeWeight = 0.2;

        const missingScore = 100 - (columnsAnalysis.reduce((sum, col) => 
          sum + col.missingPercentage, 0) / columnsAnalysis.length);
        
        const duplicateScore = 100 - ((data.length - new Set(data.map(JSON.stringify)).size) 
          / data.length * 100);
        
        const outlierScore = 100 - (columnsAnalysis.reduce((sum, col) => 
          sum + (col.outliers / data.length * 100), 0) / columnsAnalysis.length);
        
        const typeScore = 100 - (columnsAnalysis.filter(col => 
          col.type === 'unknown').length / columnsAnalysis.length * 100);

        const qualityScore = Math.round(
          missingScore * missingWeight +
          duplicateScore * duplicateWeight +
          outlierScore * outlierWeight +
          typeScore * typeWeight
        );

        resolve({
          totalRows: data.length,
          totalColumns: headers.length,
          columnsAnalysis,
          duplicateRows: data.length - new Set(data.map(JSON.stringify)).size,
          qualityScore,
          correlationMatrix,
          previewData
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};