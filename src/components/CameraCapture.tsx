import React, { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
  prompt?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, prompt }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-lg overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.5}
          videoConstraints={{ facingMode: "environment" }}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
          <button
            onClick={onCancel}
            className="text-white px-4 py-2 rounded bg-white/20 backdrop-blur-sm"
          >
            Cancel
          </button>
          <button
            onClick={capture}
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-white border-2 border-black/10"></div>
          </button>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
        {prompt && (
          <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-2 rounded text-center text-sm backdrop-blur-sm">
            {prompt}
          </div>
        )}
      </div>
    </div>
  );
};
