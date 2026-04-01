'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface FileDropZoneProps {
  onFilesDrop: (files: File[]) => void;
  files: File[];
  supportedExchanges: string[];
}

export function FileDropZone({ onFilesDrop, files, supportedExchanges }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith('.html') || f.name.endsWith('.htm'),
      );
      if (droppedFiles.length > 0) {
        onFilesDrop(droppedFiles);
      }
    },
    [onFilesDrop],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onFilesDrop(selectedFiles);
      }
    },
    [onFilesDrop],
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onFilesDrop(newFiles);
    },
    [files, onFilesDrop],
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Trascina i file HTML qui
        </p>
        <p className="text-sm text-gray-500 mt-1">
          oppure{' '}
          <label className="text-amber-600 hover:text-amber-700 cursor-pointer">
            sfoglia i file
            <input
              type="file"
              multiple
              accept=".html,.htm"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Exchange supportati: {supportedExchanges.join(', ')}
        </p>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(idx)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
