import React from 'react';
import { SimulationPoint } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertOctagon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SimulationViewProps {
  data: SimulationPoint[];
  onRun: (years: number) => void;
  isRunning: boolean;
  hasPortfolio: boolean;
}

const SimulationView: React.FC<SimulationViewProps> = ({ data, onRun, isRunning, hasPortfolio }) => {
  const { t, colors } = useTheme();
  const [years, setYears] = React.useState(10);

  if (!hasPortfolio) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <AlertOctagon size={48} className="mb-4" />
        <p>Please generate a portfolio first to run simulations.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 pt-12">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('simulation.init.title')}</h2>
        <p className="text-slate-400">{t('simulation.init.desc')}</p>
        
        <div className="flex items-center justify-center gap-4 py-4">
          <label className="text-slate-300">{t('simulation.duration')}</label>
          <select 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
          >
            <option value="5">5 Years</option>
            <option value="10">10 Years</option>
            <option value="20">20 Years</option>
            <option value="30">30 Years</option>
          </select>
        </div>

        <button
          onClick={() => onRun(years)}
          disabled={isRunning}
          className={`w-full py-3 ${colors.primaryBg} ${colors.hoverBg} text-white rounded-lg font-bold transition-colors disabled:opacity-50`}
        >
          {isRunning ? t('simulation.running') : t('simulation.start')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white">{t('simulation.title')}</h2>
           <p className="text-slate-400 text-sm mt-1">
             Projected growth of $100 initial investment over {data.length} years.
           </p>
        </div>
        <button 
           onClick={() => onRun(years)}
           className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm transition"
           disabled={isRunning}
        >
          {isRunning ? t('simulation.running') : t('simulation.rerun')}
        </button>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.chartColors[1]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.chartColors[1]} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.chartColors[0]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.chartColors[0]} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.chartColors[3]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.chartColors[3]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Area type="monotone" dataKey="optimistic" stroke={colors.chartColors[1]} fillOpacity={1} fill="url(#colorOpt)" name={t('simulation.best')} />
            <Area type="monotone" dataKey="expected" stroke={colors.chartColors[0]} fillOpacity={1} fill="url(#colorExp)" name={t('simulation.expected')} />
            <Area type="monotone" dataKey="pessimistic" stroke={colors.chartColors[3]} fillOpacity={1} fill="url(#colorPess)" name={t('simulation.worst')} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-800/50 p-4 rounded-lg">
          <h4 className="font-bold text-emerald-400 mb-1">{t('simulation.best')}</h4>
          <p className="text-sm text-emerald-200/70">
            {t('simulation.final_value')} <span className="font-mono font-bold">${data[data.length-1].optimistic.toFixed(0)}</span>
          </p>
        </div>
        <div className={`bg-${colors.primaryBg.split('-')[1]}-900/20 border ${colors.primaryBorder} border-opacity-50 p-4 rounded-lg`}>
          <h4 className={`font-bold ${colors.primaryText} mb-1`}>{t('simulation.expected')}</h4>
          <p className={`text-sm ${colors.primaryText} opacity-70`}>
             {t('simulation.final_value')} <span className="font-mono font-bold">${data[data.length-1].expected.toFixed(0)}</span>
          </p>
        </div>
        <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-lg">
          <h4 className="font-bold text-red-400 mb-1">{t('simulation.worst')}</h4>
          <p className="text-sm text-red-200/70">
             {t('simulation.final_value')} <span className="font-mono font-bold">${data[data.length-1].pessimistic.toFixed(0)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationView;
