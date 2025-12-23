import React, { useState } from 'react';
import { HistoryItem, RiskLevel } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [simpleMode, setSimpleMode] = useState<Record<string, boolean>>({});

  if (history.length === 0) return null;

  const filteredHistory = history.filter(item => 
    item.previewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.verdict.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const toggleSimpleMode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSimpleMode(prev => ({...prev, [id]: !prev[id]}));
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case RiskLevel.SUSPICIOUS: return 'bg-amber-100 text-amber-800 border-amber-200';
      case RiskLevel.HIGH_RISK: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full mt-12 animate-fade-in px-1">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Analyses
        </h3>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="text-[10px] sm:text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 flex items-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer"
        >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow shadow-sm text-slate-700"
          placeholder="Search history..."
        />
      </div>
      
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-xs sm:text-sm">No analyses found matching "{searchQuery}"</p>
            </div>
        ) : (
            filteredHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            const isSimple = simpleMode[item.id] || false;
            
            return (
                <div 
                key={item.id}
                onClick={() => toggleExpand(item.id)}
                className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer group relative overflow-hidden ${
                    isExpanded ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-slate-200 hover:shadow-md hover:border-indigo-300'
                }`}
                >
                <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2 pr-10">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(item.riskLevel)}`}>
                        {item.verdict}
                    </span>
                    <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    </div>
                    
                    {/* Individual Delete Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50 group/del z-10"
                        title="Delete"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/del:scale-110 transition-transform pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>

                    <div className="flex items-start gap-3 mb-3">
                        {item.imageBase64 && (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                <img 
                                    src={item.imageBase64} 
                                    alt="Analysis attachment" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <p className={`text-slate-600 text-xs sm:text-sm font-medium font-sans flex-1 ${isExpanded ? '' : 'line-clamp-2 pr-10'}`}>
                            "{item.previewText}"
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50">
                        <div className="text-[10px] text-slate-500 flex items-center">
                            Score: <span className={`ml-1 font-bold ${
                                item.score >= 70 ? 'text-red-600' : item.score >= 30 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>{item.score}/100</span>
                        </div>
                        <div className="text-indigo-600 text-[10px] font-semibold flex items-center transition-colors">
                            {isExpanded ? 'Less' : 'Details'}
                            <svg className={`w-3 h-3 ml-1 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                <div className={`transition-all duration-300 ease-in-out bg-slate-50 border-t border-slate-100 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-3 sm:p-4 space-y-4">
                        
                        <div className="flex items-center justify-end">
                            <button 
                                type="button"
                                onClick={(e) => toggleSimpleMode(item.id, e)}
                                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {isSimple ? "Detailed" : "Simple (ELI5)"}
                            </button>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Explanation</h4>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                {isSimple && item.simplifiedExplanation ? item.simplifiedExplanation : item.explanation}
                            </p>
                        </div>
                        
                        {item.suspiciousPhrases && item.suspiciousPhrases.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Keywords</h4>
                                <div className="flex flex-wrap gap-1">
                                    {item.suspiciousPhrases.map((phrase, idx) => (
                                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded">
                                            {phrase}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(item);
                                }}
                                className="text-[10px] bg-white border border-slate-200 text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors font-medium flex items-center"
                            >
                                <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Full Report
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            );
            })
        )}
      </div>
    </div>
  );
};

export default HistoryList;