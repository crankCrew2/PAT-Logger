import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScan: (result: string) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onCancel }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scannerRef.current?.clear().catch(error => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Scan Barcode</h2>
        <div id="reader" className="w-full"></div>
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
