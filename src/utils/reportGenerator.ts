import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DataAnalysis } from './dataAnalysis';

export const generateReport = (analysis: DataAnalysis, fileName: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(20);
  doc.text('Data Quality Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  // File Information
  doc.setFontSize(12);
  doc.text(`File: ${fileName}`, 20, 35);
  doc.text(`Total Rows: ${analysis.totalRows}`, 20, 45);
  doc.text(`Total Columns: ${analysis.totalColumns}`, 20, 55);
  doc.text(`Quality Score: ${analysis.qualityScore}%`, 20, 65);
  doc.text(`Duplicate Rows: ${analysis.duplicateRows}`, 20, 75);

  // Column Analysis Table
  doc.setFontSize(14);
  doc.text('Column Analysis', 20, 90);

  const tableData = analysis.columnsAnalysis.map(col => [
    col.name,
    col.type,
    `${col.missingCount} (${col.missingPercentage.toFixed(1)}%)`,
    col.uniqueValues.toString(),
    col.topValues.map(v => `${v.value}: ${v.count}`).join(', ')
  ]);

  autoTable(doc, {
    head: [['Column', 'Type', 'Missing Values', 'Unique Values', 'Top Values']],
    body: tableData,
    startY: 95,
    margin: { top: 20 },
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 60 }
    }
  });

  // Preview Data
  const currentY = (doc as any).lastAutoTable.finalY + 20;
  if (currentY > 250) {
    doc.addPage();
  }

  doc.setFontSize(14);
  doc.text('Data Preview (First 3 Rows)', 20, currentY);

  const previewData = analysis.previewData.slice(1, 4).map(row => 
    analysis.previewData[0].map((_, i) => row[i]?.toString() || '')
  );

  autoTable(doc, {
    head: [analysis.previewData[0]],
    body: previewData,
    startY: currentY + 5,
    margin: { top: 20 },
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 'auto' } }
  });

  doc.save(`${fileName}-analysis-report.pdf`);
};