import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AgentMessage, 
  SharedAgentState, 
  AgentType, 
  Language, 
  RiskAnalysisResult, 
  PortfolioRecommendation, 
  SimulationPoint,
  MarketPreference
} from '../types';
import { 
  RiskAgent, 
  MarketAgent, 
  PortfolioAgent, 
  SimulationAgent, 
  ReportAgent 
} from '../services/AutonomousAgents';

// Initialize Agents once
const agents = [
  new RiskAgent(),
  new MarketAgent(),
  new PortfolioAgent(),
  new SimulationAgent(),
  new ReportAgent()
];

export const useAgentSystem = (language: Language) => {
  // The "Blackboard" (Shared Memory)
  const [sharedState, setSharedState] = useState<SharedAgentState>({});
  
  // The Communication Log
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  
  // Processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  // Use ref to track state inside the async callback loop to avoid stale closures
  const stateRef = useRef<SharedAgentState>({});
  
  // Sync stateRef with state
  useEffect(() => {
    stateRef.current = sharedState;
  }, [sharedState]);

  const processMessageQueue = useCallback(async (newMessage: AgentMessage) => {
    // 1. Update Log
    setMessages(prev => [...prev, newMessage]);

    // 2. Update Shared Blackboard based on payload
    // We update both the Ref (for immediate logic) and State (for UI)
    if (newMessage.data) {
      const nextState = { ...stateRef.current };
      if (newMessage.data.riskResult) nextState.riskResult = newMessage.data.riskResult;
      if (newMessage.data.marketContext) nextState.marketContext = newMessage.data.marketContext;
      if (newMessage.data.portfolios) nextState.portfolios = newMessage.data.portfolios;
      if (newMessage.data.simulationData) nextState.simulationData = newMessage.data.simulationData;
      if (newMessage.data.report) nextState.report = newMessage.data.report;
      if (newMessage.data.userInputs) nextState.userInputs = newMessage.data.userInputs;
      
      stateRef.current = nextState;
      setSharedState(nextState);
    }

    // 3. Check for Task Completion
    if (newMessage.type === 'TASK_COMPLETED') {
      setIsProcessing(false);
      setActiveAgentId(null);
      return;
    }

    // 4. AUTONOMOUS LOOP: Ask ALL agents if they want to react
    // PARALLELIZATION FIX: We map all checks to promises and wait for all reactions
    const reactions: Promise<void>[] = agents.map(async (agent) => {
      try {
        // Use stateRef.current to get the absolutely latest state including the data just received
        const currentState = stateRef.current;
        
        const response = await agent.process(newMessage, currentState, language);
        
        if (response) {
          // Agent decided to act!
          setActiveAgentId(agent.id); // Update UI to show who is working (last one wins in UI, which is fine)
          // Recursive call to process the NEW message produced by this agent
          await processMessageQueue(response); 
        }
      } catch (error) {
        console.error(`Agent ${agent.name} failed:`, error);
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          from: agent.name,
          to: 'SYSTEM',
          type: 'ERROR',
          content: `Crashed: ${error}`,
          timestamp: Date.now()
        }]);
      }
    });

    // Wait for all agents to finish their check/reaction to this specific message
    await Promise.all(reactions);

  }, [language]); // Removed sharedState dependency to rely on stateRef

  const startMission = (answers: Record<string, string>, market: MarketPreference) => {
    // Reset System
    const initialState = { userInputs: { answers, market } };
    setSharedState(initialState);
    stateRef.current = initialState;
    setMessages([]);
    setIsProcessing(true);
    
    // Emit First Spark
    const startMsg: AgentMessage = {
      id: crypto.randomUUID(),
      from: 'SYSTEM',
      to: 'ALL',
      type: 'TASK_START',
      content: "Mission Start: Analyze user risk and generate investment strategy.",
      data: { userInputs: { answers, market } },
      timestamp: Date.now()
    };

    processMessageQueue(startMsg);
  };

  return {
    sharedState,
    messages,
    isProcessing,
    activeAgentId,
    startMission,
    setSharedState
  };
};