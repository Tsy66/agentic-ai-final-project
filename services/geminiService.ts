import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RiskAnalysisResult, PortfolioRecommendation, SimulationPoint, Language, MarketPreference } from "../types";

const createClient = () => {
  // Priority: 1. Environment Variable (Local Dev) 2. LocalStorage (Public Deployment)
  const apiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key');
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

const getLangInstruction = (lang: Language) => {
  return lang === 'zh-TW' 
    ? " IMPORTANT: Output the final response in Traditional Chinese (繁體中文)." 
    : " Output the final response in English.";
};

// --- Risk Analysis Agent ---
export const runRiskAnalysisAgent = async (
  answers: Record<string, string>,
  language: Language
): Promise<RiskAnalysisResult> => {
  const ai = createClient();
  
  const prompt = `
    Analyze the following user investment questionnaire answers and determine their risk profile.
    
    Answers: ${JSON.stringify(answers)}
    
    Task:
    1. Determine a Risk Score (0-100).
    2. Assign a Risk Level (Conservative, Moderate, Growth, Aggressive). 
       Note: The 'level' field MUST be one of these English Enum strings.
    3. Check for contradictions.
    4. Provide a brief explanation.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      level: { type: Type.STRING, enum: ['Conservative', 'Moderate', 'Growth', 'Aggressive'] },
      explanation: { type: Type.STRING },
      contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
      warning: { type: Type.STRING },
    },
    required: ['score', 'level', 'explanation'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      systemInstruction: "You are an expert Financial Risk Analyst." + getLangInstruction(language)
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as RiskAnalysisResult;
};

// --- Market Data Agent (Real-time Search) ---
export const runMarketDataAgent = async (
  marketPref: MarketPreference,
  language: Language
): Promise<string> => {
  const ai = createClient();

  let searchFocus = "";
  if (marketPref === 'tw') searchFocus = "Taiwan Stock Exchange (TAIEX), USD/TWD exchange rate";
  else if (marketPref === 'us') searchFocus = "S&P 500, NASDAQ 100, US 10Y Treasury Yield";
  else searchFocus = "S&P 500, TAIEX, US 10Y Treasury Yield, USD/TWD";

  const prompt = `
    You are a Market Data Agent. Your goal is to fetch REAL-TIME financial data to support investment decisions.
    
    Please search for the following current data from reliable sources like Yahoo Finance or Bloomberg:
    1. Current Index levels for: ${searchFocus}.
    2. Current CBOE VIX (Volatility Index).
    3. Top 3 major financial news headlines today affecting these markets.
    
    Summarize the market sentiment (Bullish/Bearish/Neutral) and key data points.
    Keep the summary concise but data-rich.
  `;

  // Using Google Search Tool to get REAL data
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are a professional Market Data Analyst. You MUST use Google Search to find the latest market data. Do not hallucinate numbers." + getLangInstruction(language)
    }
  });

  // Extract text and potentially grounding metadata
  return response.text || "Unable to retrieve market data.";
};

// --- Portfolio Design Agent ---
export const runPortfolioDesignAgent = async (
  riskResult: RiskAnalysisResult,
  marketPref: MarketPreference,
  preferences: string,
  marketContext: string, // Real data passed from Market Agent
  language: Language
): Promise<PortfolioRecommendation[]> => {
  const ai = createClient();

  let marketConstraint = "";
  if (marketPref === 'tw') {
    marketConstraint = " STRICT CONSTRAINT: Use ONLY Taiwan Stock Exchange (TWSE) or TPEx tickers (e.g., 2330.TW, 0050.TW). Do NOT recommend US stocks.";
  } else if (marketPref === 'us') {
    marketConstraint = " STRICT CONSTRAINT: Use ONLY US Stock Market tickers (e.g., AAPL, VTI, BND). Do NOT recommend Taiwan stocks.";
  } else {
    marketConstraint = " CONSTRAINT: Create a globally diversified portfolio using a mix of US tickers (for global exposure) and Taiwan tickers (e.g., 2330.TW) for local exposure.";
  }

  const prompt = `
    Act as a Senior Portfolio Manager.
    
    **Real-Time Market Context provided by Market Data Agent**:
    "${marketContext}"
    
    **User Profile**:
    - Risk Level: ${riskResult.level} (${riskResult.score}/100)
    - Market Preference: ${marketPref.toUpperCase()}
    - User Preferences: ${preferences}
    - Constraint: ${marketConstraint}

    Task:
    Design 2 distinct investment portfolios based on the Risk Profile and REAL Market Data.
    1. **Recommended Portfolio**: Perfectly matches the risk profile.
    2. **Alternative Portfolio**: A slightly different strategic approach (e.g., higher yield vs higher growth).

    IMPORTANT FORMATTING INSTRUCTIONS:
    1. The 'category' field MUST be one of ['Stocks', 'Bonds', 'Cash', 'Commodities', 'Real Estate', 'Crypto'].
    2. The 'reasoning' field MUST explain why this asset was chosen given the current market context provided above.
    3. **CRITICAL**: 'expectedReturn' and 'volatility' MUST be numbers representing PERCENTAGES (e.g., use 8.5 for 8.5%, NOT 0.085).
  `;

  const portfolioSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      expectedReturn: { type: Type.NUMBER, description: "Annual return percentage (e.g. 7.5 for 7.5%)" },
      volatility: { type: Type.NUMBER, description: "Annual volatility percentage (e.g. 12.5 for 12.5%)" },
      assets: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            ticker: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Stocks', 'Bonds', 'Cash', 'Commodities', 'Real Estate', 'Crypto'] },
            percentage: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ['name', 'ticker', 'category', 'percentage', 'reasoning']
        }
      }
    },
    required: ['name', 'description', 'assets', 'expectedReturn', 'volatility']
  };

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: portfolioSchema
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      systemInstruction: "You are a Portfolio Manager. Construct portfolios using real tickers based on the provided market data." + getLangInstruction(language)
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text) as PortfolioRecommendation[];
};

// --- Simulation Agent ---
export const runSimulationAgent = async (
  portfolio: PortfolioRecommendation,
  years: number
): Promise<SimulationPoint[]> => {
  const ai = createClient();

  const prompt = `
    Run a Monte Carlo style simulation for this portfolio over ${years} years.
    Portfolio: ${JSON.stringify(portfolio)}
    
    Generate 3 scenarios: Optimistic, Expected, Pessimistic.
    Include 'shockEvent' (e.g. 2008 Financial Crisis or Covid Crash magnitude) in one random year.
    Start value 100.

    IMPORTANT: If the portfolio expected return provided is in decimal (e.g. 0.07), treat it as 7%. If it is in percentage (e.g. 7), treat it as 7%. The output values should be the Asset Value (e.g. 107.5).
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        year: { type: Type.NUMBER },
        optimistic: { type: Type.NUMBER },
        expected: { type: Type.NUMBER },
        pessimistic: { type: Type.NUMBER },
        shockEvent: { type: Type.NUMBER, nullable: true },
      },
      required: ['year', 'optimistic', 'expected', 'pessimistic']
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      systemInstruction: "You are a Quantitative Analyst."
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text) as SimulationPoint[];
};

// --- Report Agent ---
export const runReportAgent = async (
  risk: RiskAnalysisResult,
  portfolios: PortfolioRecommendation[],
  simulation: SimulationPoint[],
  marketContext: string,
  language: Language
): Promise<string> => {
  const ai = createClient();

  const prompt = `
    Generate a comprehensive investment report in Markdown format.
    
    **Executive Inputs**:
    1. Risk Profile: ${JSON.stringify(risk)}
    2. Real-Time Market Analysis: "${marketContext}"
    3. Recommended Portfolios: ${JSON.stringify(portfolios)}
    4. Simulation Summary (Final Year): ${JSON.stringify(simulation[simulation.length - 1])}
    
    **Report Structure**:
    1. **Executive Summary**: High-level overview.
    2. **Market Pulse**: Summary of the real-time data retrieved (Indices, VIX, etc.).
    3. **Risk Analysis**: Why this user fits this profile.
    4. **Portfolio Strategy**: Detailed breakdown of the recommended assets and why they were chosen given the market pulse.
    5. **Future Outlook**: Explanation of the Monte Carlo simulation results.
    6. **Actionable Next Steps**.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "You are a Senior Investment Advisor writing a formal report." + getLangInstruction(language)
    }
  });

  return response.text || "Report generation failed.";
};

// --- Education Agent ---
export const runEducationAgent = async (
  query: string,
  context: string,
  language: Language
): Promise<string> => {
  const ai = createClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User Query: "${query}"\nContext: ${context}`,
    config: {
      systemInstruction: "You are a helpful Investment Tutor. Explain financial concepts simply (ELI5)." + getLangInstruction(language)
    }
  });

  return response.text || "I couldn't explain that right now.";
};