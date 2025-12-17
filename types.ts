export type Language = 'en' | 'zh-TW';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange';
export type MarketPreference = 'tw' | 'us' | 'both';

export enum RiskLevel {
  Conservative = 'Conservative',
  Moderate = 'Moderate',
  Growth = 'Growth',
  Aggressive = 'Aggressive'
}

export interface Question {
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

export interface RiskAnalysisResult {
  score: number;
  level: RiskLevel;
  explanation: string;
  contradictions?: string[];
  warning?: string;
}

export interface PortfolioAsset {
  name: string;
  ticker: string;
  category: string;
  percentage: number;
  reasoning: string;
}

export interface PortfolioRecommendation {
  name: string;
  description: string;
  assets: PortfolioAsset[];
  expectedReturn: number; // Annual percentage
  volatility: number; // Annual percentage
}

export interface SimulationPoint {
  year: number;
  optimistic: number;
  expected: number;
  pessimistic: number;
  shockEvent?: number; // Value during a simulated shock
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

// --- NEW: Autonomous Agent Types ---

export type AgentType = 'SYSTEM' | 'RISK_AGENT' | 'MARKET_AGENT' | 'PORTFOLIO_AGENT' | 'SIMULATION_AGENT' | 'REPORT_AGENT';

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType | 'ALL';
  type: 'TASK_START' | 'DATA_SHARED' | 'TASK_COMPLETED' | 'ERROR';
  content: string; // Natural language description
  data?: any; // Structured payload
  timestamp: number;
}

// The "Blackboard" or Shared Memory state
export interface SharedAgentState {
  userInputs?: { answers: Record<string, string>, market: MarketPreference };
  riskResult?: RiskAnalysisResult;
  marketContext?: string;
  portfolios?: PortfolioRecommendation[];
  simulationData?: SimulationPoint[];
  report?: string;
}