import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import RiskAssessment from './components/RiskAssessment';
import PortfolioView from './components/PortfolioView';
import SimulationView from './components/SimulationView';
import ReportView from './components/ReportView';
import AgentStatusBar from './components/AgentStatusBar';
import EducationChat from './components/EducationChat';
import { MarketPreference, AgentType } from './types';
import { useTheme, ThemeProvider } from './contexts/ThemeContext';
import { useAgentSystem } from './hooks/useAgentSystem';
import { Key, Save } from 'lucide-react';
import * as AgentService from './services/geminiService'; // Keep for manual re-runs

const AppContent: React.FC = () => {
  const { language, t, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use the new Autonomous Agent System Hook
  const { 
    sharedState, 
    messages, 
    isProcessing, 
    activeAgentId, 
    startMission,
    setSharedState // Exposed for manual updates
  } = useAgentSystem(language);

  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  
  // Context for Education Agent
  const [currentContext, setCurrentContext] = useState<string>('');

  useEffect(() => {
    const envKey = process.env.API_KEY;
    const localKey = localStorage.getItem('gemini_api_key');
    if (envKey || localKey) {
      setHasApiKey(true);
    }
  }, []);

  // --- Tab Automation ---
  // When the Shared State (Blackboard) updates, automatically switch tabs to show progress
  useEffect(() => {
    if (sharedState.report) setActiveTab('report');
    else if (sharedState.simulationData && sharedState.simulationData.length > 0) setActiveTab('simulation');
    else if (sharedState.portfolios && sharedState.portfolios.length > 0) setActiveTab('portfolio');
    else if (sharedState.riskResult) setActiveTab('risk'); // Stay on risk until portfolio is ready
  }, [sharedState]);

  // Education Context Update
  useEffect(() => {
    let ctx = `User is currently viewing the ${activeTab} tab. `;
    if (sharedState.riskResult) ctx += `Risk Profile: ${sharedState.riskResult.level}. `;
    if (sharedState.marketContext) ctx += `Market Context: ${sharedState.marketContext.substring(0, 50)}... `;
    if (sharedState.portfolios && sharedState.portfolios.length > 0) ctx += `Portfolio selected: ${sharedState.portfolios[0].name}. `;
    setCurrentContext(ctx);
  }, [activeTab, sharedState]);

  const handleSaveApiKey = () => {
    if (userApiKey.trim().startsWith('AIza')) {
      localStorage.setItem('gemini_api_key', userApiKey.trim());
      setHasApiKey(true);
      window.location.reload();
    } else {
      alert("Invalid API Key format. It should start with 'AIza'.");
    }
  };

  // --- Manual Override Handlers (Bypassing full autonomous loop for specific edits) ---
  const handleManualPortfolioGen = async (prefs: string) => {
    if (!sharedState.riskResult) return;
    try {
      // Manually calling the service but we need to update the shared state
      const mContext = sharedState.marketContext || "User requested manual regeneration.";
      // We manually invoke the Portfolio logic here for the UI button
      // In a pure agent system, we might emit a "USER_REQUEST_UPDATE" message instead
      const recommendations = await AgentService.runPortfolioDesignAgent(sharedState.riskResult, 'both', prefs, mContext, language);
      setSharedState(prev => ({ ...prev, portfolios: recommendations }));
    } catch(e) { console.error(e); }
  };

  const handleManualSimulation = async (years: number) => {
    if (!sharedState.portfolios) return;
    try {
      const data = await AgentService.runSimulationAgent(sharedState.portfolios[0], years);
      setSharedState(prev => ({ ...prev, simulationData: data }));
    } catch(e) { console.error(e); }
  };

  const handleManualReport = async () => {
    if (!sharedState.riskResult || !sharedState.portfolios || !sharedState.simulationData) return;
    try {
      const content = await AgentService.runReportAgent(
        sharedState.riskResult, 
        sharedState.portfolios, 
        sharedState.simulationData, 
        sharedState.marketContext || '', 
        language
      );
      setSharedState(prev => ({ ...prev, report: content }));
    } catch(e) { console.error(e); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
            <p className="text-slate-400 max-w-2xl">{t('dashboard.desc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {/* Risk Card */}
              <div 
                onClick={() => setActiveTab('risk')}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400">1. {t('nav.risk')}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${sharedState.riskResult ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                    {sharedState.riskResult ? t('status.complete') : t('status.pending')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{t('dashboard.card.risk.desc')}</p>
              </div>
              {/* Portfolio Card */}
              <div 
                 onClick={() => setActiveTab('portfolio')}
                 className={`bg-slate-800 p-6 rounded-xl border border-slate-700 transition-all group ${sharedState.riskResult ? 'hover:border-blue-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400">2. {t('nav.portfolio')}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${sharedState.portfolios?.length ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                    {sharedState.portfolios?.length ? t('status.complete') : t('status.pending')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{t('dashboard.card.portfolio.desc')}</p>
              </div>
              {/* Simulation Card */}
              <div 
                 onClick={() => setActiveTab('simulation')}
                 className={`bg-slate-800 p-6 rounded-xl border border-slate-700 transition-all group ${sharedState.portfolios?.length ? 'hover:border-blue-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400">3. {t('nav.simulation')}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${sharedState.simulationData?.length ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                    {sharedState.simulationData?.length ? t('status.complete') : t('status.pending')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{t('dashboard.card.simulation.desc')}</p>
              </div>
            </div>
          </div>
        );
      case 'risk':
        return (
          <RiskAssessment 
            onComplete={startMission} 
            result={sharedState.riskResult || null}
            isAnalyzing={activeAgentId === 'risk'}
          />
        );
      case 'portfolio':
        return (
          <PortfolioView 
            portfolios={sharedState.portfolios || []}
            onGenerate={handleManualPortfolioGen}
            isGenerating={activeAgentId === 'portfolio'}
            onExplain={() => {}}
          />
        );
      case 'simulation':
        return (
          <SimulationView 
            data={sharedState.simulationData || []}
            onRun={handleManualSimulation}
            isRunning={activeAgentId === 'simulation'}
            hasPortfolio={!!sharedState.portfolios?.length}
          />
        );
      case 'report':
        return (
          <ReportView 
            reportContent={sharedState.report || ''}
            onGenerate={handleManualReport}
            isGenerating={activeAgentId === 'report'}
            isReady={!!sharedState.riskResult && !!sharedState.portfolios?.length && !!sharedState.simulationData?.length}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {!hasApiKey ? (
         <div className="flex items-center justify-center h-full animate-fade-in">
           <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl max-w-md w-full shadow-2xl">
             <div className="flex justify-center mb-6">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                 <Key className="text-white" size={32} />
               </div>
             </div>
             <h2 className="text-2xl font-bold text-white text-center mb-2">{t('app.title')}</h2>
             <p className="text-slate-400 text-center mb-6 text-sm">
               To use the Autonomous Agent Swarm, please enter your Google Gemini API Key.
             </p>
             <div className="space-y-4">
               <input 
                 type="password" 
                 value={userApiKey}
                 onChange={(e) => setUserApiKey(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="AIza..."
               />
               <button 
                 onClick={handleSaveApiKey}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
               >
                 <Save size={18} />
                 Initialize Agents
               </button>
             </div>
           </div>
         </div>
      ) : (
        renderContent()
      )}
      
      {/* The New Autonomous Agent Communication Log */}
      <AgentStatusBar messages={messages} activeAgentId={activeAgentId} />
      
      <EducationChat context={currentContext} />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;