
import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';

interface LayoutProps {
  user: User | null;
  children: React.ReactNode;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  chatComponent: React.ReactNode;
}

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { id: string; label: string }[];
}

const Layout: React.FC<LayoutProps> = ({ user, children, onLogout, activeTab, onTabChange, chatComponent }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['admin_group', 'super_admin_group']);

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  if (!user) return <>{children}</>;

  const toggleSubmenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getNavItems = (role: Role): NavItemDef[] => {
    switch (role) {
      case Role.STUDENT:
        return [
          { 
            id: 'quizzes', 
            label: 'Study Center', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> 
          },
          { 
            id: 'leaderboard', 
            label: 'Leaderboard', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> 
          }
        ];
      case Role.TEACHER:
        return [
          { 
            id: 'dashboard', 
            label: 'Overview', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> 
          },
          { 
            id: 'rag', 
            label: 'Knowledge Base', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> 
          }
        ];
      case Role.SCHOOL_ADMIN:
        return [
          {
            id: 'admin_group',
            label: 'Administration',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
            subItems: [
              { id: 'admin_overview', label: 'Overview' },
              { id: 'users', label: 'User Directory' },
              { id: 'classes', label: 'Classes' },
              { id: 'content', label: 'Knowledge Base' },
            ]
          }
        ];
      case Role.SUPER_ADMIN:
        return [
          {
            id: 'super_admin_group',
            label: 'Mission Control',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
            subItems: [
              { id: 'overview', label: 'Platform Overview' },
              { id: 'tenants', label: 'Tenants' },
              { id: 'financials', label: 'Financials' },
              { id: 'infrastructure', label: 'Infrastructure' },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(user.role);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden selection:bg-brand-500 selection:text-white font-sans relative">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-slate-950"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-900/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent-900/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[80px] animate-float"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* MOBILE HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-50 md:hidden transition-all duration-300">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>
             <span className="font-display font-bold text-brand-400 text-lg">EDUNEXUS</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-slate-400 hover:text-brand-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
             </button>
          </div>
      </header>

      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR (Responsive) */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/50 flex flex-col 
          transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:inset-auto md:bg-slate-900/60
      `}>
        {/* Sidebar Header */}
        <div className="h-16 md:h-auto p-6 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-accent-600 rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.3)]"></div>
            <span className="text-xl font-display font-bold tracking-wide">EDU<span className="text-brand-400">NEXUS</span></span>
          </div>
          {/* Close button only on mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-white">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="mt-2 px-6">
           <div className="px-3 py-1 bg-slate-800/50 rounded text-xs text-center text-slate-400 border border-slate-700/50 uppercase tracking-wider">
             {user.role.replace('_', ' ')}
           </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.id} className="mb-2">
              {item.subItems ? (
                // Parent Item with Accordion
                <div>
                   <button
                      onClick={() => toggleSubmenu(item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all group"
                   >
                      <div className="flex items-center space-x-3">
                         <span className="text-slate-400 group-hover:text-brand-400 transition-colors">{item.icon}</span>
                         <span className="font-medium">{item.label}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                   </button>
                   
                   {/* Submenu Items */}
                   <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMenus.includes(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-11 pr-2 py-1 space-y-1">
                         {item.subItems.map(sub => (
                            <button
                               key={sub.id}
                               onClick={() => onTabChange(sub.id)}
                               className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors border-l-2 ${
                                  activeTab === sub.id 
                                    ? 'border-brand-500 text-brand-400 bg-brand-500/10' 
                                    : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                               }`}
                            >
                               {sub.label}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
              ) : (
                // Standard Single Item
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                    activeTab === item.id 
                      ? 'bg-brand-600/80 text-white shadow-lg shadow-brand-500/20 backdrop-blur-sm' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center font-bold shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="text-sm overflow-hidden">
                  <p className="font-medium truncate w-32">{user.name}</p>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
             </div>
             <button onClick={onLogout} className="text-slate-500 hover:text-red-400 p-2 rounded hover:bg-slate-800 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 pt-16 md:pt-0">
        <div className="flex-1 flex overflow-hidden relative">
            {/* Center Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950/40 backdrop-blur-sm relative scroll-smooth p-0 md:p-0">
              <div className="relative z-10 min-h-full w-full">
                {children}
              </div>
            </main>

            {/* Right Chat Sidebar */}
            <aside 
              className={`
                fixed inset-y-0 right-0 z-40 md:static md:inset-auto bg-slate-900/95 md:bg-slate-900/70 backdrop-blur-xl border-l border-slate-800/50 flex flex-col 
                transition-all duration-300 ease-in-out shadow-2xl
                ${isChatOpen ? 'w-full md:w-[400px] translate-x-0' : 'w-0 translate-x-full md:translate-x-0 md:w-0'}
              `}
            >
               <div className="w-full md:w-[400px] h-full flex flex-col overflow-hidden">
                  {/* Chat Header */}
                  <div className="h-14 border-b border-slate-800/50 flex items-center justify-between px-4 bg-slate-900/50 shrink-0">
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.role === 'STUDENT' ? 'bg-brand-500' : 'bg-red-500'} animate-pulse`}></div>
                          <span className="font-display font-bold text-sm text-slate-300">
                             {user.role === 'STUDENT' ? 'Nexus Tutor' : 'Copilot'}
                          </span>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col relative">
                     {chatComponent}
                  </div>
               </div>
            </aside>
        </div>
      </div>
      
      {/* Desktop Chat Toggle Button */}
      {!isChatOpen && (
        <button 
           onClick={() => setIsChatOpen(true)}
           className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600/90 backdrop-blur hover:bg-brand-500 rounded-full shadow-lg shadow-brand-500/30 hidden md:flex items-center justify-center z-40 transition-transform hover:scale-110 group"
           title="Open Chat"
        >
           <svg className="w-6 h-6 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </button>
      )}
    </div>
  );
};

export default Layout;
