import React from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ReportViewProps {
  reportContent: string;
  onGenerate: () => void;
  isGenerating: boolean;
  isReady: boolean;
}

const ReportView: React.FC<ReportViewProps> = ({ reportContent, onGenerate, isGenerating, isReady }) => {
  const { t, colors } = useTheme();

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
         <FileText size={48} className="mb-4" />
         <p className="mb-4">{t('report.init.desc')}</p>
         <div className="flex gap-2 text-xs">
           <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">{t('nav.risk')}</span>
           <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">{t('nav.portfolio')}</span>
           <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">{t('nav.simulation')}</span>
         </div>
      </div>
    );
  }

  if (!reportContent && !isGenerating) {
    return (
       <div className="max-w-xl mx-auto text-center pt-12">
        <h2 className="text-2xl font-bold text-white mb-4">{t('report.init.title')}</h2>
        <p className="text-slate-400 mb-8">{t('report.init.desc')}</p>
        <button
          onClick={onGenerate}
          className={`px-8 py-3 ${colors.primaryBg} ${colors.hoverBg} text-white rounded-lg font-bold`}
        >
          {t('report.generate')}
        </button>
       </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className={colors.primaryText} />
          {t('report.title')}
        </h2>
        <div className="flex gap-2">
           <button 
             onClick={onGenerate}
             disabled={isGenerating}
             className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
             title="Regenerate"
           >
             <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
           </button>
           <button 
             className={`flex items-center gap-2 px-4 py-2 ${colors.primaryBg} ${colors.hoverBg} text-white rounded text-sm font-medium transition`}
             onClick={() => window.print()}
           >
             <Download size={16} /> {t('report.export')}
           </button>
        </div>
      </div>

      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl min-h-[600px]">
        {isGenerating ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-64 bg-slate-100 rounded w-full mt-8"></div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            {/* Simple Markdown Rendering */}
            {reportContent.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4 border-b pb-2">{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className={`text-2xl font-bold mt-6 mb-3 ${colors.primaryText.replace('400', '800')}`}>{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-2 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, (_, p1) => p1)}</p>; 
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;
