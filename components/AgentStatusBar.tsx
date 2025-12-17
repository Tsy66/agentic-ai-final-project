import React, { useEffect, useRef, useState } from 'react';
import { AgentMessage, AgentType } from '../types';
import { Activity, Terminal, ArrowRight, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AgentStatusBarProps {
  messages: AgentMessage[];
  activeAgentId: string | null;
}

const AgentStatusBar: React.FC<AgentStatusBarProps> = ({ messages, activeAgentId }) => {
  const { colors } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-scroll to bottom when new messages arrive, but only if expanded
  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  // Auto-expand if a new error occurs or processing starts (optional UX enhancement, kept simple for now)
  // You could add logic here to setIsExpanded(true) on certain events if desired.

  const getAgentColor = (type: AgentType | string) => {
    switch (type) {
      case 'SYSTEM': return 'text-slate-400';
      case 'RISK_AGENT': return 'text-red-400';
      case 'MARKET_AGENT': return 'text-yellow-400';
      case 'PORTFOLIO_AGENT': return 'text-blue-400';
      case 'SIMULATION_AGENT': return 'text-purple-400';
      case 'REPORT_AGENT': return 'text-green-400';
      default: return 'text-white';
    }
  };

  if (messages.length === 0) return null;

  return (
    <div className={`fixed bottom-0 right-0 z-50 w-full md:w-[600px] p-4 transition-all duration-300 ease-in-out pointer-events-none`}>
      <div className={`
        bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl overflow-hidden pointer-events-auto flex flex-col transition-all duration-300
        ${isExpanded ? 'rounded-xl h-[300px]' : 'rounded-t-xl h-[48px] mt-[252px]'}
      `}>
        
        {/* Header - Always Visible (Click to toggle if minimized) */}
        <div 
          className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 cursor-pointer hover:bg-slate-750"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-slate-400" />
            <span className="text-xs font-mono text-slate-300 font-bold uppercase">Agent Communication Channel</span>
            {/* Show latest brief status when minimized */}
            {!isExpanded && activeAgentId && (
               <span className="text-[10px] text-blue-400 animate-pulse ml-2 hidden sm:inline">
                 Processing...
               </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {activeAgentId ? (
                 <span className="flex items-center gap-1.5 text-xs text-blue-400 animate-pulse">
                   <Activity size={12} />
                   <span className={!isExpanded ? 'hidden' : ''}>Processing...</span>
                 </span>
              ) : (
                 <span className="flex items-center gap-1.5 text-xs text-green-500">
                   <CheckCircle2 size={12} />
                   <span className={!isExpanded ? 'hidden' : ''}>Idle</span>
                 </span>
              )}
            </div>

            {/* Toggle Icon */}
            <button 
              className="text-slate-400 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Log Area - Hidden when minimized */}
        <div 
          ref={scrollRef} 
          className={`
            flex-1 p-3 overflow-y-auto space-y-2 font-mono text-xs custom-scrollbar bg-black/40
            ${!isExpanded ? 'hidden' : ''}
          `}
        >
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 opacity-90 hover:opacity-100 transition-opacity">
               <span className="text-slate-600 shrink-0">[{new Date(msg.timestamp).toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
               <div className="flex flex-col">
                 <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${getAgentColor(msg.from)}`}>{msg.from}</span>
                    <ArrowRight size={10} className="text-slate-500" />
                    <span className={`font-bold ${msg.to === 'ALL' ? 'text-white' : getAgentColor(msg.to)}`}>{msg.to}</span>
                 </div>
                 <p className="text-slate-300 pl-2 border-l border-slate-700 mt-0.5">{msg.content}</p>
                 {msg.type === 'ERROR' && <span className="text-red-500 pl-2 text-[10px]"><AlertCircle size={10} className="inline mr-1"/>{JSON.stringify(msg.data)}</span>}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentStatusBar;