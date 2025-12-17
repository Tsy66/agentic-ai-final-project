import React, { useState } from 'react';
import { PortfolioRecommendation } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShieldCheck, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface PortfolioViewProps {
  portfolios: PortfolioRecommendation[];
  onGenerate: (prefs: string) => void;
  isGenerating: boolean;
  onExplain: (term: string) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolios, onGenerate, isGenerating, onExplain }) => {
  const { t, colors } = useTheme();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [preferences, setPreferences] = useState('');

  const currentPortfolio = portfolios[selectedIdx];

  // Heuristic: If value is < 1 (e.g. 0.075), assume it's a decimal and convert to %.
  // If it's >= 1 (e.g. 7.5), assume it's already %.
  const formatPercent = (val: number) => {
    const number = (val < 1 && val > -1) ? val * 100 : val;
    return number.toFixed(2);
  };

  if (portfolios.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 pt-12">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('portfolio.init.title')}</h2>
        <p className="text-slate-400">
          {t('portfolio.init.desc')}
        </p>
        
        <div className="bg-slate-800 p-4 rounded-lg text-left border border-slate-700">
           <label className="block text-sm font-medium text-slate-300 mb-2">{t('portfolio.pref.label')}</label>
           <textarea 
             className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
             placeholder={t('portfolio.pref.placeholder')}
             rows={3}
             value={preferences}
             onChange={(e) => setPreferences(e.target.value)}
           />
        </div>

        <button
          onClick={() => onGenerate(preferences)}
          disabled={isGenerating}
          className={`w-full py-3 ${colors.primaryBg} ${colors.hoverBg} text-white rounded-lg font-bold transition-colors disabled:opacity-50`}
        >
          {isGenerating ? t('portfolio.generating') : t('portfolio.generate')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white">{t('portfolio.strategy')}</h2>
           <p className="text-slate-400 text-sm mt-1">{t('portfolio.context')} <span className="text-green-400">Bullish sentiment detected.</span></p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          {portfolios.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedIdx === idx ? `${colors.primaryBg} text-white shadow` : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-lg font-medium text-slate-300 mb-4 self-start">{t('portfolio.allocation')}</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentPortfolio.assets as any[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {currentPortfolio.assets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value}%`, t('portfolio.allocation')]}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full mt-6 border-t border-slate-700 pt-6">
            <div className="bg-slate-900/50 p-3 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition" onClick={() => onExplain('Expected Return')}>
              <p className="text-xs text-slate-400 flex justify-center items-center gap-1">{t('portfolio.return')} <Info size={12}/></p>
              <p className="text-xl font-bold text-green-400">{formatPercent(currentPortfolio.expectedReturn)}%</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition" onClick={() => onExplain('Volatility')}>
              <p className="text-xs text-slate-400 flex justify-center items-center gap-1">{t('portfolio.volatility')} <Info size={12}/></p>
              <p className="text-xl font-bold text-orange-400">{formatPercent(currentPortfolio.volatility)}%</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
          <h3 className="text-lg font-medium text-slate-300 mb-4">{currentPortfolio.description}</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {currentPortfolio.assets.map((asset, idx) => (
              <div key={idx} className={`bg-slate-900 p-4 rounded-lg border-l-4 border-slate-700 hover:${colors.primaryBorder} transition-colors group`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={`font-bold text-white group-hover:${colors.primaryText} transition-colors`}>{asset.name}</h4>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded mr-2">{asset.ticker}</span>
                    <span className="text-xs text-slate-500">{asset.category}</span>
                  </div>
                  <span className="text-lg font-bold text-white">{asset.percentage}%</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{asset.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;