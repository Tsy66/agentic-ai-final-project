import React, { useState, useEffect } from 'react';
import { getRiskQuestions } from '../constants';
import { RiskAnalysisResult, MarketPreference } from '../types';
import { AlertTriangle, CheckCircle, ArrowRight, Globe, TrendingUp, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface RiskAssessmentProps {
  onComplete: (answers: Record<string, string>, market: MarketPreference) => void;
  result: RiskAnalysisResult | null;
  isAnalyzing: boolean;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onComplete, result, isAnalyzing }) => {
  const { language, t, colors } = useTheme();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [market, setMarket] = useState<MarketPreference>('both');
  const questions = getRiskQuestions(language);

  const handleSelect = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const isComplete = questions.every(q => answers[q.id]);

  const handleSubmit = () => {
    if (isComplete) {
      onComplete(answers, market);
    }
  };

  if (result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              {t('risk.complete')}
            </h2>
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${
              result.level === 'Aggressive' ? 'bg-red-500/20 text-red-400' :
              result.level === 'Growth' ? 'bg-orange-500/20 text-orange-400' :
              result.level === 'Moderate' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {result.level} (Score: {result.score})
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-slate-300">{result.explanation}</p>
          </div>

          {result.contradictions && result.contradictions.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-2">
                <AlertTriangle size={18} />
                {t('risk.contradictions')}
              </h3>
              <ul className="list-disc list-inside text-yellow-200/80 space-y-1">
                {result.contradictions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {result.warning && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <h3 className="text-red-400 font-bold mb-1">{t('risk.warning')}</h3>
              <p className="text-red-200/80 text-sm">{result.warning}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">{t('risk.title')}</h2>
        <p className="text-slate-400">{t('risk.desc')}</p>
      </div>

      {/* Market Preference Selector */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Globe size={20} className={colors.primaryText} />
          {t('risk.market_select')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setMarket('tw')}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              market === 'tw' 
              ? `${colors.primaryBorder} ${colors.lightBg} text-white` 
              : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <TrendingUp size={24} />
            <span className="font-bold">{t('risk.market.tw')}</span>
          </button>
          <button
            onClick={() => setMarket('us')}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              market === 'us' 
              ? `${colors.primaryBorder} ${colors.lightBg} text-white` 
              : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <DollarSign size={24} />
            <span className="font-bold">{t('risk.market.us')}</span>
          </button>
          <button
            onClick={() => setMarket('both')}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              market === 'both' 
              ? `${colors.primaryBorder} ${colors.lightBg} text-white` 
              : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Globe size={24} />
            <span className="font-bold">{t('risk.market.both')}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 transition-all hover:border-slate-600">
            <h3 className="text-lg font-medium text-white mb-4">
              <span className="text-slate-500 mr-2">{idx + 1}.</span>
              {q.text}
            </h3>
            <div className="space-y-3">
              {q.options.map((opt) => (
                <label 
                  key={opt.value}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer border transition-all
                    ${answers[q.id] === opt.value 
                      ? `${colors.lightBg} ${colors.primaryBorder} text-white` 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-700'}
                  `}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleSelect(q.id, opt.value)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center
                     ${answers[q.id] === opt.value ? colors.primaryBorder : 'border-slate-600'}
                  `}>
                    {answers[q.id] === opt.value && <div className={`w-2 h-2 rounded-full ${colors.primaryBg}`} />}
                  </div>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={!isComplete || isAnalyzing}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all
            ${isComplete && !isAnalyzing
              ? `bg-gradient-to-r ${market === 'tw' ? 'from-green-600 to-emerald-600' : market === 'us' ? 'from-blue-600 to-indigo-600' : 'from-violet-600 to-purple-600'} text-white hover:scale-105 shadow-lg` 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
          `}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {t('risk.analyzing')}
            </span>
          ) : (
            <>
              {t('risk.auto_start')}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RiskAssessment;