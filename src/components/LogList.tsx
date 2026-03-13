import React from 'react';
import { LogEntry } from '../types';
import { CheckCircle, XCircle, FileText, Calendar, Trash2 } from 'lucide-react';

interface LogListProps {
  logs: LogEntry[];
  onConfirmDelete: (id: string) => void;
}

export const LogList: React.FC<LogListProps> = ({ logs, onConfirmDelete }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No logs yet. Start by adding a new entry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
            {log.imageUrl ? (
              <img src={log.imageUrl} alt={log.description} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FileText className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-gray-900 truncate">{log.applianceId}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                log.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {log.status === 'Pass' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {log.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{log.description}</p>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <button
            onClick={() => onConfirmDelete(log.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Delete Log"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};
