export enum RiskLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  HIGH_RISK = 'HIGH_RISK'
}

export interface VerificationSource {
  name: string;
  url: string;
}

export interface AnalysisResult {
  score: number;
  verdict: string; // "Safe", "Suspicious", "Likely Scam/Fake"
  riskLevel: RiskLevel;
  explanation: string;
  simplifiedExplanation: string;
  tips: string[];
  suspiciousPhrases: string[];
  verificationSources: VerificationSource[];
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  timestamp: number;
  previewText: string;
  originalText?: string;
  imageBase64?: string;
}