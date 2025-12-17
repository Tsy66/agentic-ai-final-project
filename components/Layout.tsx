import React, { useState } from 'react';
import { LayoutDashboard, FileText, PieChart, TrendingUp, BookOpen, Menu, X, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Language, AccentColor } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { language, setLanguage, accentColor, setAccentColor, t, colors } = useTheme();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={20} /> },
    { id: 'risk', label: t('nav.risk'), icon: <FileText size={20} /> },
    { id: 'portfolio', label: t('nav.portfolio'), icon: <PieChart size={20} /> },
    { id: 'simulation', label: t('nav.simulation'), icon: <TrendingUp size={20} /> },
    { id: 'report', label: t('nav.report'), icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Settings className={colors.primaryText} />
              {t('settings.title')}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">{t('settings.language')}</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all ${language === 'en' ? `${colors.primaryBg} text-white border-transparent` : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLanguage('zh-TW')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all ${language === 'zh-TW' ? `${colors.primaryBg} text-white border-transparent` : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    繁體中文
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">{t('settings.color')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['blue', 'green', 'purple', 'orange'] as AccentColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccentColor(c)}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        accentColor === c ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c === 'blue' ? '#2563eb' : c === 'green' ? '#059669' : c === 'purple' ? '#7c3aed' : '#ea580c' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${colors.primaryBg} rounded-lg flex items-center justify-center`}>
              <span className="font-bold text-white">CI</span>
            </div>
            <span className="font-bold text-lg tracking-tight">{t('app.title')}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${activeTab === item.id 
                  ? `${colors.primaryBg} text-white shadow-lg` 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 space-y-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <Settings size={20} />
            <span className="font-medium">{t('settings.title')}</span>
          </button>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">{t('status.agent_status')}</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono text-green-400">{t('status.online')}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b border-slate-800 bg-slate-950">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-lg">{t('app.title')}</span>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
