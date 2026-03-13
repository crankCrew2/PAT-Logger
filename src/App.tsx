/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LogEntry, AppSettings } from './types';
import { loadLogs, saveLogs, exportToCSV, exportToPDF, loadSettings, saveSettings } from './services/storage';
import { LogList } from './components/LogList';
import { NewEntryForm } from './components/NewEntryForm';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Plus, Download, ClipboardList, Settings, FileText, AlertCircle, Trash2 } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setAppSettings] = useState<AppSettings>({
    companyName: '',
    testerLicense: '',
    contactNumber: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  useEffect(() => {
    setLogs(loadLogs());
    const loadedSettings = loadSettings();
    setAppSettings(loadedSettings);
    
    // Open settings on first run if empty
    if (!loadedSettings.companyName) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveEntry = (entry: LogEntry) => {
    const newLogs = [entry, ...logs];
    setLogs(newLogs);
    saveLogs(newLogs);
    setIsAdding(false);
  };

  const confirmDeleteEntry = () => {
    if (deleteId) {
      const newLogs = logs.filter(log => log.id !== deleteId);
      setLogs(newLogs);
      saveLogs(newLogs);
      setDeleteId(null);
    }
  };

  const confirmClearAll = () => {
    setLogs([]);
    saveLogs([]);
    setIsClearAllOpen(false);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExportPDF = () => {
    if (logs.length === 0) {
      alert("No logs to export.");
      return;
    }
    if (!settings.companyName) {
      alert("Please configure company details in settings before exporting.");
      setIsSettingsOpen(true);
      return;
    }
    try {
      exportToPDF(logs, settings);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleExportFailedPDF = () => {
    const failedLogs = logs.filter(l => l.status === 'Fail');
    if (failedLogs.length === 0) {
      alert("No failed tests to export.");
      return;
    }
    if (!settings.companyName) {
      alert("Please configure company details in settings before exporting.");
      setIsSettingsOpen(true);
      return;
    }
    try {
      exportToPDF(failedLogs, settings, "Failed Items Report");
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PAT Logger</h1>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsClearAllOpen(true)}
            disabled={logs.length === 0}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear All Logs"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => exportToCSV(logs)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportFailedPDF}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium shadow-sm"
            title="Export Failed Items"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Failed</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            title="Export All PDF"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        <div className="mb-4 flex justify-between items-end">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Logs</h2>
          <span className="text-xs text-gray-400">{logs.length} entries</span>
        </div>
        
        <LogList logs={logs} onConfirmDelete={setDeleteId} />
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modals */}
      {isAdding && (
        <NewEntryForm
          onSave={handleSaveEntry}
          onCancel={() => setIsAdding(false)}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeleteEntry}
        title="Delete Entry"
        message="Are you sure you want to delete this log entry? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={confirmClearAll}
        title="Clear All Logs"
        message="Are you sure you want to delete ALL log entries? This action cannot be undone."
        confirmText="Clear All"
        isDestructive={true}
      />
    </div>
  );
}

