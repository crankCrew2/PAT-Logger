import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Scanner } from './Scanner';
import { CameraCapture } from './CameraCapture';
import { analyzeImage } from '../services/gemini';
import { v4 as uuidv4 } from 'uuid';
import { addMonths } from 'date-fns';
import { Camera, Scan, Type, Save, X, Loader2, CalendarClock } from 'lucide-react';

interface NewEntryFormProps {
  onSave: (entry: LogEntry) => void;
  onCancel: () => void;
}

type Step = 'select-method' | 'scanning' | 'ocr-camera' | 'manual-entry' | 'photo-camera' | 'analyzing' | 'review';

export const NewEntryForm: React.FC<NewEntryFormProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState<Step>('select-method');
  const [applianceId, setApplianceId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'Pass' | 'Fail'>('Pass');
  const [testFrequency, setTestFrequency] = useState<3 | 6 | 12>(12);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScan = (result: string) => {
    setApplianceId(result);
    // Small delay to ensure scanner camera is released
    setTimeout(() => setStep('photo-camera'), 300);
  };

  const handleOcrCapture = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setStep('analyzing');
    try {
      const text = await analyzeImage(imageSrc, "Extract the serial number or asset tag from this image. Return ONLY the number/text.");
      setApplianceId(text.trim());
      setStep('photo-camera');
    } catch (error) {
      alert("Failed to read number. Please try again or enter manually.");
      setStep('select-method');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDescriptionCapture = async (imageSrc: string) => {
    setImageUrl(imageSrc);
    setIsAnalyzing(true);
    setStep('analyzing');
    try {
      const text = await analyzeImage(imageSrc, "Describe this appliance briefly (e.g., 'Red Bosch Power Drill', 'Office Kettle'). Keep it under 10 words.");
      setDescription(text.trim());
      setStep('review');
    } catch (error) {
      console.error(error);
      setDescription("Could not analyze image.");
      setStep('review');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    const now = new Date();
    const nextTestDate = addMonths(now, testFrequency).toISOString();

    const newEntry: LogEntry = {
      id: uuidv4(),
      timestamp: now.toISOString(),
      applianceId,
      description,
      status,
      testFrequency,
      nextTestDate,
      notes,
      imageUrl
    };
    onSave(newEntry);
  };

  if (step === 'scanning') {
    return <Scanner onScan={handleScan} onCancel={() => setStep('select-method')} />;
  }

  if (step === 'ocr-camera') {
    return <CameraCapture onCapture={handleOcrCapture} onCancel={() => setStep('select-method')} prompt="Take a photo of the serial number/tag" />;
  }

  if (step === 'photo-camera') {
    return <CameraCapture onCapture={handleDescriptionCapture} onCancel={() => setStep('select-method')} prompt="Take a photo of the appliance" />;
  }

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-medium">Analyzing with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-40 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">New Test Entry</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6">
          {step === 'select-method' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">How would you like to identify the appliance?</p>
              
              <button
                onClick={() => setStep('scanning')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl flex flex-col items-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Scan className="w-10 h-10 text-blue-600" />
                <span className="font-semibold text-lg">Scan Barcode</span>
              </button>

              <button
                onClick={() => setStep('ocr-camera')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl flex flex-col items-center gap-3 hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Camera className="w-10 h-10 text-purple-600" />
                <span className="font-semibold text-lg">Read Number (OCR)</span>
              </button>

              <button
                onClick={() => setStep('manual-entry')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl flex flex-col items-center gap-3 hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Type className="w-10 h-10 text-green-600" />
                <span className="font-semibold text-lg">Manual Entry</span>
              </button>
            </div>
          )}

          {step === 'manual-entry' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appliance ID / Serial Number</label>
                <input
                  type="text"
                  value={applianceId}
                  onChange={(e) => setApplianceId(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter ID..."
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  if (applianceId.trim()) setStep('photo-camera');
                }}
                disabled={!applianceId.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              {imageUrl && (
                <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img src={imageUrl} alt="Appliance" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appliance ID</label>
                  <input
                    type="text"
                    value={applianceId}
                    onChange={(e) => setApplianceId(e.target.value)}
                    className="w-full p-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-lg h-24 resize-none"
                    placeholder="Enter description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Re-test Frequency</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 6, 12].map((months) => (
                      <button
                        key={months}
                        onClick={() => setTestFrequency(months as 3 | 6 | 12)}
                        className={`py-2 rounded-lg font-medium border-2 transition-colors ${
                          testFrequency === months
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {months} Months
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    Next test due: {addMonths(new Date(), testFrequency).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStatus('Pass')}
                      className={`flex-1 py-3 rounded-lg font-medium border-2 transition-colors ${
                        status === 'Pass'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      PASS
                    </button>
                    <button
                      onClick={() => setStatus('Fail')}
                      className={`flex-1 py-3 rounded-lg font-medium border-2 transition-colors ${
                        status === 'Fail'
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      FAIL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border rounded-lg h-20 resize-none"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
