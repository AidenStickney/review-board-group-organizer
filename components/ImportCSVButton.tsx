import React, { ChangeEvent } from 'react';
import Papa from 'papaparse';

interface Props {
  onDataImported: (data: any[]) => void;
}

const ImportCSVButton: React.FC<Props> = ({ onDataImported }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          console.log('Parsed Result:', result);
          onDataImported(result.data);
        },
        header: true
      });
    }
  };

  return (
    <button className="bg-slate-700 py-1 px-2 ml-2 border-slate-500 border rounded-md">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden cursor-pointer"
        id="csvFileInput"
      />
      <label htmlFor="csvFileInput" className='cursor-pointer'>
        Import CSV
      </label>
    </button>
  );
};

export default ImportCSVButton;