import React, { useState, useRef, useEffect } from 'react';

interface InputFormProps {
  onAnalyze: (text: string, image?: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 0 || image) {
      onAnalyze(text, image || undefined);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          // Optional: If you want to prevent the default text paste if an image is found
          // e.preventDefault(); 
          break;
        }
      }
    }
  };

  return (
    <div className="w-full" onPaste={handlePaste}>
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Check for Fakes & Scams</h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">
            Paste suspicious text, upload a screenshot, or <b>paste an image</b> from your clipboard.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Text Area */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here or Ctrl+V to paste an image..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all text-sm sm:text-base text-gray-700 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          {/* Image Upload Area */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-colors ${
              image ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
             {!image ? (
               <>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                 />
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors py-3 sm:py-4 w-full"
                 >
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">Upload, Drag & Drop, or Paste Image</span>
                 </button>
               </>
             ) : (
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-slate-300 bg-white">
                            <img src={image} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-slate-700">Image Attached</span>
                            <span className="text-[10px] sm:text-xs text-slate-500">Ready to analyze</span>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove image"
                    >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
             )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || (text.trim().length < 5 && !image)}
            className={`
              w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2
              ${isLoading || (text.trim().length < 5 && !image)
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Text & Image
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 text-[10px] sm:text-xs rounded-full">Phishing Screenshots</span>
            <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 text-[10px] sm:text-xs rounded-full">Fake News</span>
            <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 text-[10px] sm:text-xs rounded-full">Chain Messages</span>
            <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 text-[10px] sm:text-xs rounded-full">Offer Images</span>
        </div>
      </div>
    </div>
  );
};

export default InputForm;