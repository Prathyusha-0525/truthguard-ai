import React, { useState } from 'react';
import { AnalysisResult, RiskLevel } from '../types';
import ScoreGauge from './ScoreGauge';

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  originalText?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset, originalText }) => {
  const [showSimple, setShowSimple] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const getHeaderColor = () => {
    switch (result.riskLevel) {
      case RiskLevel.SAFE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case RiskLevel.SUSPICIOUS: return 'bg-amber-100 text-amber-800 border-amber-200';
      case RiskLevel.HIGH_RISK: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = () => {
     switch (result.riskLevel) {
      case RiskLevel.SAFE: return (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case RiskLevel.SUSPICIOUS: return (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      case RiskLevel.HIGH_RISK: return (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const handleShare = async () => {
    const shareText = `TruthGuard AI Analysis Verdict: ${result.verdict}\n\nI used TruthGuard AI to verify this content. You can check suspicious messages here: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TruthGuard AI Analysis Result',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopyStatus('Copied to clipboard!');
        setTimeout(() => setCopyStatus(null), 3000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const renderHighlightedText = (text: string, phrases: string[]) => {
    if (!phrases || phrases.length === 0) return text;
    const escapedPhrases = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!escapedPhrases) return text;
    const parts = text.split(new RegExp(`(${escapedPhrases})`, 'gi'));
    return parts.map((part, index) => {
      const isMatch = phrases.some(p => p.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <mark key={index} className="bg-red-200 text-red-900 px-1 rounded font-semibold mx-0.5">
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
      {/* Header Verdict */}
      <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${getHeaderColor()}`}>
        <div className="flex items-center">
          {getIcon()}
          <h2 className="text-xl sm:text-2xl font-bold">{result.verdict}</h2>
        </div>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold"
          title="Share Analysis"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {copyStatus && (
          <div className="mb-4 p-2 bg-indigo-50 text-indigo-700 text-xs text-center rounded-lg border border-indigo-100 animate-fade-in">
            {copyStatus}
          </div>
        )}

        {/* Score & Controls */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center mb-8">
            <div className="flex justify-center flex-shrink-0 w-40 sm:w-48">
                <ScoreGauge score={result.score} riskLevel={result.riskLevel} />
            </div>
            
            <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                   <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                     {showSimple ? "Simple Explanation" : "Detailed Analysis"}
                   </h3>
                   <div 
                      className="flex items-center cursor-pointer group" 
                      onClick={() => setShowSimple(!showSimple)}
                   >
                     <span className={`text-[10px] sm:text-xs mr-2 sm:mr-3 font-medium transition-colors ${!showSimple ? 'text-indigo-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'}`}>Detailed</span>
                     <button 
                       role="switch"
                       aria-checked={showSimple}
                       onClick={(e) => { e.stopPropagation(); setShowSimple(!showSimple); }}
                       className={`relative inline-flex h-6 w-10 sm:h-7 sm:w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${showSimple ? 'bg-emerald-500' : 'bg-slate-200'}`}
                     >
                       <span className="sr-only">Toggle mode</span>
                       <span className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${showSimple ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`} />
                     </button>
                     <span className={`text-[10px] sm:text-xs ml-2 sm:mr-3 font-medium transition-colors ${showSimple ? 'text-emerald-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'}`}>Simple (ELI5)</span>
                   </div>
                </div>
                
                <div className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 ease-in-out min-h-[100px] sm:min-h-[120px] flex items-center ${showSimple ? 'bg-emerald-50 border-emerald-100 text-emerald-900 shadow-sm' : 'bg-white border-slate-100 text-slate-600'}`}>
                    <p className="leading-relaxed text-sm">
                        {showSimple ? result.simplifiedExplanation : result.explanation}
                    </p>
                </div>
            </div>
        </div>

        {/* Suspicious Phrases / Highlighted Text */}
        {result.suspiciousPhrases.length > 0 && (
          <div className="mb-8">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Suspicious Content
             </h3>
             
             {originalText && originalText.trim().length > 0 ? (
                 <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-gray-700 leading-relaxed max-h-40 sm:max-h-48 overflow-y-auto">
                    {renderHighlightedText(originalText, result.suspiciousPhrases)}
                 </div>
             ) : (
                 <div className="flex flex-wrap gap-2">
                    {result.suspiciousPhrases.map((phrase, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] sm:text-xs font-semibold">
                            "{phrase}"
                        </span>
                    ))}
                 </div>
             )}
          </div>
        )}

        {/* Verification Sources */}
        {result.verificationSources.length > 0 && (
            <div className="mb-8">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trusted Sources
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                     {result.verificationSources.map((source, idx) => (
                         <a 
                           key={idx} 
                           href={source.url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="flex items-center justify-between p-2.5 sm:p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
                         >
                             <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 truncate mr-2">{source.name}</span>
                             <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                             </svg>
                         </a>
                     ))}
                 </div>
            </div>
        )}

        {/* Tips */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 mb-8">
            <h3 className="text-sm sm:text-md font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Safety Tips
            </h3>
            <ul className="space-y-2 sm:space-y-3">
                {result.tips.map((tip, index) => (
                    <li key={index} className="flex items-start text-xs sm:text-sm text-gray-700">
                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 bg-indigo-500 rounded-full mr-3"></span>
                        {tip}
                    </li>
                ))}
            </ul>
        </div>

        <button
            onClick={onReset}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analyze Another
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;