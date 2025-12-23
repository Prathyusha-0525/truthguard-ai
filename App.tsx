import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import HistoryList from './components/HistoryList';
import TrendingAlerts from './components/TrendingAlerts';
import { analyzeContent } from './services/gemini';
import { AnalysisResult, HistoryItem } from './types';

// Logo Component Recreating the Design from the Image
const TruthGuardLogo = ({ className = "h-10", showTagline = true }: { className?: string, showTagline?: boolean }) => (
  <div className={`flex items-center gap-3 cursor-pointer group ${className}`} onClick={() => window.location.reload()}>
    <div className="relative h-full aspect-square flex-shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm transition-transform group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield with vertical split */}
        <path d="M50 5 L15 20 V50 C15 75 50 95 50 95 C50 95 85 75 85 50 V20 L50 5Z" fill="#172554" />
        <path d="M50 5 V95 C50 95 85 75 85 50 V20 L50 5Z" fill="#CBD5E1" />
        
        {/* Magnifying Glass Handle */}
        <path d="M32 62 L15 80" stroke="#172554" strokeWidth="10" strokeLinecap="round" />
        <path d="M32 62 L20 75" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

        {/* Magnifying Glass Lens/Rim */}
        <circle cx="52" cy="46" r="24" fill="white" stroke="#172554" strokeWidth="2" />
        <circle cx="52" cy="46" r="21" stroke="#E2E8F0" strokeWidth="3" />
        
        {/* Checkmark inside Lens */}
        <path d="M42 46 L49 53 L62 39" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div className="flex flex-col justify-center select-none">
      <div className="flex items-center">
        <span className="text-[#172554] font-extrabold text-xl sm:text-2xl tracking-tighter leading-none">TruthGuard</span>
        <span className="text-[#22C55E] font-extrabold text-xl sm:text-2xl tracking-tighter leading-none ml-1">AI</span>
      </div>
      {showTagline && (
        <span className="text-[10px] text-[#1e293b] font-bold tracking-tight mt-0.5 opacity-90">
          Detecting Truth. Protecting Trust.
        </span>
      )}
    </div>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  
  // Initialize history from localStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('truthguard_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  // Persist history changes to localStorage
  useEffect(() => {
    localStorage.setItem('truthguard_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (text: string, image?: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentText(text); // Store text for highlighting
    
    try {
      const data = await analyzeContent(text, image);
      setResult(data);

      // Create preview text. If image is present but text is empty, create a placeholder.
      let preview = text.substring(0, 150) + (text.length > 150 ? '...' : '');
      if (image && (!text || text.trim().length === 0)) {
        preview = "[Image Analysis Request]";
      } else if (image) {
        preview = "[Image] " + preview;
      }

      // Add to history
      const newItem: HistoryItem = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        previewText: preview,
        originalText: text,
        imageBase64: image
      };

      setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setCurrentText('');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item);
    setCurrentText(item.originalText || item.previewText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 bg-opacity-95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <TruthGuardLogo className="h-8" showTagline={false} />
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:inline-flex items-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini 2.5</span>
            </div>
            {result && (
              <button 
                onClick={handleReset}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Section (only show if no result) */}
        {!result && !isLoading && (
            <div className="flex flex-col items-center py-6 md:py-10 animate-fade-in">
                {/* Live Monitor Bar positioned relative to intro */}
                <div className="w-full mb-8 max-w-3xl">
                  <TrendingAlerts />
                </div>

                <div className="mb-4 sm:mb-6">
                   <TruthGuardLogo className="h-10 sm:h-12" />
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter leading-tight text-center px-2">
                    Spot the <span className="text-indigo-600">Fake</span>. Protect the <span className="text-emerald-500">Truth</span>.
                </h1>
                
                <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium leading-relaxed text-center mb-6 sm:mb-8 px-4">
                    Upload screenshots or paste text. Our AI analyzes deep patterns to verify authenticity and protect your trust.
                </p>
            </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start shadow-sm">
             <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm sm:text-base">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 p-1">
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="transition-all duration-300 ease-in-out">
            {result ? (
                <div className="pt-4 sm:pt-8 max-w-3xl mx-auto">
                  <ResultDisplay result={result} onReset={handleReset} originalText={currentText} />
                </div>
            ) : (
                <>
                    <div className="max-w-3xl mx-auto">
                        <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <HistoryList 
                            history={history} 
                            onSelect={handleSelectHistory} 
                            onClear={handleClearHistory}
                            onDelete={handleDeleteItem}
                        />
                    </div>
                </>
            )}
        </div>

        {/* Footer/Disclaimer */}
        <div className="mt-20 text-center border-t border-slate-100 pt-10">
            <div className="flex justify-center mb-6 opacity-30 grayscale hover:grayscale-0 transition-all">
                <TruthGuardLogo className="h-6" showTagline={false} />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 max-w-xl mx-auto leading-loose font-medium px-4">
                Disclaimer: TruthGuard AI uses advanced language models to analyze patterns but may make mistakes. 
                Always verify important information with official sources and local authorities. 
                Do not share sensitive personal information like passwords or bank details.
            </p>
            <div className="mt-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                © 2024 TruthGuard AI Security Lab
            </div>
        </div>

      </main>
    </div>
  );
}

export default App;