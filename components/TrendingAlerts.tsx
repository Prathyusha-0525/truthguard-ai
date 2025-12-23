import React, { useEffect, useState } from 'react';

// Mock data to simulate real-time trends
const TRENDS = [
  { id: 1, type: 'SCAM', title: 'Fake "IRS Tax Refund" emails circulating', platform: 'Email' },
  { id: 2, type: 'FAKE NEWS', title: 'Viral AI image of celebrity arrest debunked', platform: 'Twitter/X' },
  { id: 3, type: 'PHISHING', title: 'LinkedIn "Profile Viewed" malicious links', platform: 'LinkedIn' },
  { id: 4, type: 'SCAM', title: 'Crypto Giveaway Bot Network detected', platform: 'Telegram' },
  { id: 5, type: 'ALERT', title: 'Package delivery SMS scams peaking this week', platform: 'SMS' },
];

const TrendingAlerts: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TRENDS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-[#111827] rounded-xl px-4 py-3 flex items-center shadow-lg border border-slate-800">
        <div className="flex items-center gap-3 pr-4 border-r border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Live Monitor</span>
            </div>
        </div>
        
        <div className="flex-1 ml-4 relative h-5 overflow-hidden">
             {TRENDS.map((trend, index) => (
                <div 
                    key={trend.id}
                    className={`absolute w-full h-full transition-all duration-700 flex items-center gap-3 ${
                        index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                >
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none text-slate-900 ${
                        trend.type === 'SCAM' ? 'bg-orange-500' : 
                        trend.type === 'FAKE NEWS' ? 'bg-amber-400' : 'bg-indigo-400'
                    }`}>
                        {trend.type}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200 truncate font-semibold tracking-tight">
                        {trend.title}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden md:inline-block ml-auto font-bold uppercase tracking-tight">
                        Detected on {trend.platform}
                    </span>
                </div>
             ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingAlerts;