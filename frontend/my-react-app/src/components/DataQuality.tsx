import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const DataQuality: React.FC = () => {
    const [columns, setColumns] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            try {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (jsonData.length > 0) {
                    setColumns(jsonData[0] as string[]);
                } else {
                    setColumns([]);
                    setError('No columns found.');
                }
            } catch (err) {
                setError('Failed to parse Excel file.');
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <h2>Upload Excel File</h2>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {columns.length > 0 && (
                <div>
                    <h3>Columns:</h3>
                    <ul>
                        {columns.map((col, idx) => (
                            <li key={idx}>{col}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DataQuality;