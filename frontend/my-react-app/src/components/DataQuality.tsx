import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom'; 


const DataQuality: React.FC = () => {
    const [columns, setColumns] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [startCell, setStartCell] = useState<string>('A1');
    const [endCell, setEndCell] = useState<string>('A1');
    const [columnChecks, setColumnChecks] = useState<{ [key: string]: boolean }>({});
    const [dataQualityChecks, setDataQualityChecks] = useState<{ [key: string]: boolean }>({
        accuracy: false,
        completeness: false,
        reliability: false,
        relevance: false,
        timeliness: false,
    });
    const [fileData, setFileData] = useState<ArrayBuffer | string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<{ [key: string]: { [key: string]: boolean } } | null>(null);
    const navigate = useNavigate();
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;
        setFile(uploadedFile);
        const reader = new FileReader();
        reader.onload = (evt) => setFileData(evt.target?.result || null);
        reader.readAsBinaryString(uploadedFile);
    };

    const handleGetColumns = () => {
        if (!fileData) {
            setError('Please upload an Excel file first.');
            return;
        }
        try {
            const workbook = XLSX.read(fileData, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const start = XLSX.utils.decode_cell(startCell);
            const end = XLSX.utils.decode_cell(endCell);

            const headers: string[] = [];
            for (let col = start.c; col <= end.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: start.r, c: col });
                const cell = worksheet[cellAddress];
                headers.push(cell ? String(cell.v) : '');
            }

            if (headers.length && headers.some(h => h)) {
                setColumns(headers);
                setColumnChecks(headers.reduce((acc, col) => ({ ...acc, [col]: false }), {}));
            } else {
                setColumns([]);
                setError('No columns found.');
            }
        } catch {
            setError('Failed to parse Excel file.');
        }
    };

    const handleRunChecks = () => {
        if (!file) {
            setError('Please upload an Excel file first.');
            return;
        }
        const selectedColumns = Object.keys(columnChecks).filter(col => columnChecks[col]);
        const selectedChecks = Object.keys(dataQualityChecks).filter(check => dataQualityChecks[check]);
        if (!selectedColumns.length || !selectedChecks.length) {
            setError('Select at least one column and one check.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        const checksMap: { [key: string]: string[] } = {};
        selectedColumns.forEach(col => checksMap[col] = selectedChecks);
        formData.append('checks', JSON.stringify(checksMap));

        fetch('http://localhost:5000/api/run_quality_checks', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => { setResults(data); setError(null); })
            .catch(() => setError('Failed to run checks.'));
    };

    return (
        <div className="dq-container">
            <style>{`
                .dq-container {
                    max-width: 700px;
                    margin: 40px auto;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    padding: 32px 24px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                h2 {
                    text-align: center;
                    color: #2d3748;
                    margin-bottom: 24px;
                }
                label {
                    font-weight: 500;
                    color: #4a5568;
                }
                input[type="file"] {
                    display: block;
                    margin: 0 auto 20px auto;
                    padding: 8px;
                }
                .dq-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                    align-items: center;
                }
                input[type="text"] {
                    border: 1px solid #cbd5e0;
                    border-radius: 6px;
                    padding: 6px 10px;
                    font-size: 1rem;
                    margin-left: 8px;
                    width: 100px;
                }
                button {
                    background: linear-gradient(90deg,#667eea,#5a67d8);
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 24px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin: 16px 0;
                    box-shadow: 0 2px 8px rgba(102,126,234,0.15);
                    transition: background 0.2s;
                }
                button:hover {
                    background: linear-gradient(90deg,#5a67d8,#667eea);
                }
                .dq-error {
                    color: #e53e3e;
                    background: #fff5f5;
                    border: 1px solid #fed7d7;
                    border-radius: 6px;
                    padding: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 10px;
                }
                .dq-columns, .dq-checks {
                    margin-bottom: 24px;
                }
                .dq-columns label, .dq-checks label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                table {
                    width: 100%;
                    border: 1px solid black;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: center;
                }
            `}</style>

            <h2>Excel Data Quality Tool</h2>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
            <div className="dq-row">
                <label>Start Cell (e.g. A1):</label>
                <input type="text" value={startCell} onChange={(e) => setStartCell(e.target.value)} />
            </div>
            <div className="dq-row">
                <label>End Cell (e.g. D1):</label>
                <input type="text" value={endCell} onChange={(e) => setEndCell(e.target.value)} />
            </div>
            <button onClick={() => navigate('/NRCI')}>Go to New Page</button>
            <button onClick={handleGetColumns}>Get Columns</button>

            {error && <div className="dq-error">{error}</div>}

            {columns.length > 0 && (
                <>
                    <div className="dq-columns">
                        <h3>Columns</h3>
                        <ul>
                            {columns.map((col, idx) => (
                                <li key={idx}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={columnChecks[col]}
                                            onChange={() => setColumnChecks(prev => ({ ...prev, [col]: !prev[col] }))}
                                        />
                                        {col}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="dq-checks">
                        <h3>Data Quality Checks</h3>
                        <ul>
                            {Object.keys(dataQualityChecks).map((check) => (
                                <li key={check}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={dataQualityChecks[check]}
                                            onChange={() => setDataQualityChecks(prev => ({ ...prev, [check]: !prev[check] }))}
                                        />
                                        {check.charAt(0).toUpperCase() + check.slice(1)}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={handleRunChecks}>Run Data Quality Checks</button>
                </>
            )}

            {results && (
                <div>
                    <h3>Results</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Column</th>
                                {Object.keys(dataQualityChecks).map(check => (
                                    <th key={check}>{check}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(results).map(([col, checks]) => (
                                <tr key={col}>
                                    <td>{col}</td>
                                    {Object.keys(dataQualityChecks).map(check => (
                                        <td key={check}>
                                            {checks[check] === true ? '✅' :
                                             checks[check] === false ? '❌' : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DataQuality;
