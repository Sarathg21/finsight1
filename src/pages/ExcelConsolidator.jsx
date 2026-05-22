import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ExcelConsolidator = () => {
  const [status, setStatus] = useState('Upload Excel file to consolidate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB'
    });
    
    setError(null);
    setSuccess(false);
    setIsProcessing(true);
    setStatus('Reading file...');

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        setStatus('Processing sheets...');
        
        // 1. Read the workbook
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        let allData = [];

        // 2. Loop through every sheet to "rectify" the data loss issue
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Convert sheet to JSON objects
          const json = XLSX.utils.sheet_to_json(worksheet);
          // Merge into the master array
          allData = [...allData, ...json];
        });

        if (allData.length === 0) {
          throw new Error('No data found in the uploaded file.');
        }

        // 3. Convert the master array to a single CSV
        const newSheet = XLSX.utils.json_to_sheet(allData);
        const csvOutput = XLSX.utils.sheet_to_csv(newSheet);

        // 4. Trigger download
        downloadCSV(csvOutput);
        
        setStatus('Successfully consolidated all sheets!');
        setSuccess(true);
        setIsProcessing(false);
      } catch (err) {
        console.error('Consolidation error:', err);
        setError(err.message || 'An error occurred while processing the file.');
        setIsProcessing(false);
        setStatus('Error during consolidation');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadCSV = (csv) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "tascade_consolidated_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Excel Consolidation Tool</h1>
          <p className="page-header-subtitle">Combine multiple sheets into a single unified CSV report</p>
        </div>
      </div>

      <div className="card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--clr-border)' }}>
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
            color: '#fff'
          }}
        >
          <FileSpreadsheet size={40} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>
          {isProcessing ? 'Processing Your Data' : 'Ready to Consolidate?'}
        </h2>
        
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          Upload your multi-sheet Excel workbook (.xlsx or .xls). This tool will extract data from every sheet and merge them into a single, clean CSV file for analysis.
        </p>

        <div 
          style={{ 
            position: 'relative',
            display: 'inline-block',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            disabled={isProcessing}
            id="excel-upload"
            style={{ 
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              zIndex: 10
            }}
          />
          <div 
            style={{ 
              padding: '16px 32px',
              borderRadius: '12px',
              border: '2px dashed var(--clr-border)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              borderColor: isProcessing ? 'var(--clr-primary)' : 'var(--clr-border)'
            }}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={32} style={{ color: 'var(--clr-primary)' }} />
            ) : (
              <Upload size={32} style={{ color: 'var(--clr-text-muted)' }} />
            )}
            <span style={{ fontWeight: 500 }}>
              {isProcessing ? 'Consolidating...' : 'Click to Browse or Drag & Drop'}
            </span>
            {fileInfo && !isProcessing && (
              <span style={{ fontSize: '0.8rem', color: 'var(--clr-primary)' }}>
                {fileInfo.name} ({fileInfo.size})
              </span>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <div style={{ marginTop: '32px', minHeight: '60px' }}>
          {isProcessing && (
            <div style={{ color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 className="animate-spin" size={18} />
              <span>{status}</span>
            </div>
          )}

          {success && (
            <div 
              className="animate-in"
              style={{ 
                color: '#10b981', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                padding: '12px 24px', 
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <CheckCircle2 size={20} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>Consolidation Complete!</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Your unified CSV has been downloaded.</div>
              </div>
            </div>
          )}

          {error && (
            <div 
              className="animate-in"
              style={{ 
                color: '#ef4444', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                padding: '12px 24px', 
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <AlertCircle size={20} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>Consolidation Failed</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--clr-primary)' }}>How it works?</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
              The tool reads every worksheet in your Excel file. If multiple sheets have the same column headers, they will be appended together in the final output.
            </p>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--clr-primary)' }}>Privacy & Security</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
              Processing happens entirely in your browser. Your data is never uploaded to a server, ensuring 100% data privacy for sensitive financial reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelConsolidator;
