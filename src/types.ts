export interface LogEntry {
  id: string;
  timestamp: string;
  applianceId: string; // From Barcode or Manual
  description: string; // From AI or Manual
  status: 'Pass' | 'Fail';
  testFrequency: 3 | 6 | 12;
  nextTestDate: string;
  notes?: string;
  imageUrl?: string;
}

export interface AppSettings {
  testerLicense: string;
  contactNumber: string;
  companyName: string;
}

export type InputMethod = 'barcode' | 'ocr' | 'manual';
