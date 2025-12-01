
import React, { useState, useEffect } from 'react';
import { Role, School, RevenueData, TokenUsageData, SystemHealth, User } from '../types';
import { databaseService } from '../services/database';
import { RAGUploader } from './RAGUploader';
import QuizManager from './QuizManager';
import { SchoolAdminDashboard } from './SchoolAdminDashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { MOCK_SCHOOL_ADMIN } from '../constants';

interface AdminDashboardProps {
  role: Role;
  currentTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ role, currentTab }) => {
  // Main Data State
  const [schools, setSchools] = useState<School[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [tokens, setTokens] = useState<TokenUsageData[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  // detailTab state can remain local as it is for the "Drill down" view of a specific school
  const [detailTab, setDetailTab] = useState<'overview' | 'rag' | 'users' | 'quizzes'>('overview');
  
  // Users Tab State
  const [schoolUsers, setSchoolUsers] = useState<User[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Form State
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  const COLORS = ['#0ea5e9', '#8b5cf6', '#ef4444', '#10b981'];

  // --- SCHOOL ADMIN SHORTCUT ---
  if (role === Role.SCHOOL_ADMIN) {
      return <SchoolAdminDashboard user={MOCK_SCHOOL_ADMIN} currentTab={currentTab} />;
  }

  // --- DATA LOADING ---
  useEffect(() => {
    if (!isSuperAdmin) return;

    let isMounted = true;
    const loadData = async () => {
      try {
        const [schoolsData, revData, tokenData, healthData] = await Promise.all([
          databaseService.getSchools(),
          databaseService.getRevenueMetrics(),
          databaseService.getTokenUsage(),
          databaseService.getSystemHealth()
        ]);
        
        if (isMounted) {
          setSchools(schoolsData || []);
          setRevenue(revData || []);
          setTokens(tokenData || []);
          setHealth(healthData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    
    return () => { isMounted = false; };
  }, [isSuperAdmin]);

  // --- FETCH USERS FOR DETAIL VIEW ---
  useEffect(() => {
    if (selectedSchoolId && detailTab === 'users') {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
           const { users, total } = await databaseService.getUsersBySchool(selectedSchoolId, userPage, 5);
           setSchoolUsers(users || []);
           setTotalUsers(total || 0);
        } catch (e) {
           console.error(e);
        } finally {
           setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [selectedSchoolId, detailTab, userPage]);

  const handleSchoolUpdate = (updatedSchool: School) => {
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
  };

  const saveSchoolChanges = async () => {
    if (!selectedSchool) return;
    setIsSaving(true);
    try {
      await databaseService.updateSchool(selectedSchool);
      setTimeout(() => {
          setIsSaving(false);
          setIsEditingConfig(false);
      }, 500); 
    } catch (e) {
      setIsSaving(false);
    }
  };
  
  const handleUserAction = (action: string, userName: string) => {
     alert(`${action} action for user: ${userName} simulated successfully.`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full text-slate-400">
           <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-lg font-medium">Initializing Mission Control...</p>
      </div>
    );
  }

  // --- SCHOOL DETAIL VIEW (GOD MODE) ---
  if (selectedSchool && isSuperAdmin) {
    return (
      <div className="p-4 md:p-6 w-full bg-slate-950 text-white min-h-full animate-fade-in">
        {/* Header / Back Nav */}
        <div className="mb-6">
            <button 
              onClick={() => {
                  setSelectedSchoolId(null);
                  setIsEditingConfig(false);
              }}
              className="flex items-center space-x-2 text-slate-400 hover:text-white mb-4 transition-colors w-fit bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Back to Dashboard</span>
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{selectedSchool.name}</h1>
                 <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-slate-400 font-mono">{selectedSchool.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${selectedSchool.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {selectedSchool.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-400">
                      {selectedSchool.subscriptionPlan}
                    </span>
                 </div>
               </div>
               
               {/* Save Button (only visible when editing) */}
               {isEditingConfig && (
                   <button 
                    onClick={saveSchoolChanges}
                    disabled={isSaving}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-500/20 animate-fade-in"
                  >
                    {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            Save
                        </>
                    )}
                  </button>
               )}
            </div>

            {/* AI CONFIGURATION PANEL - ALWAYS VISIBLE */}
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-500/10 rounded text-brand-400">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-base">AI Configuration</h3>
                    </div>
                    <button
                        onClick={() => setIsEditingConfig(!isEditingConfig)}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors ${isEditingConfig ? 'text-slate-400 hover:text-white' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20'}`}
                    >
                        {isEditingConfig ? 'Cancel' : 'Edit'}
                    </button>
                </div>
                
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Chunk Size */}
                    <div className={`transition-all ${isEditingConfig ? 'opacity-100' : 'opacity-70'}`}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chunk Size (Tokens)</label>
                        {isEditingConfig ? (
                            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-700 focus-within:border-brand-500 transition-colors">
                                <input 
                                    type="number" 
                                    value={selectedSchool.ragConfig.chunkSize}
                                    onChange={(e) => handleSchoolUpdate({
                                        ...selectedSchool,
                                        ragConfig: { ...selectedSchool.ragConfig, chunkSize: parseInt(e.target.value) || 0 }
                                    })}
                                    className="bg-transparent text-white w-full focus:outline-none font-mono"
                                    min="128" max="4096" step="128"
                                />
                                <span className="text-xs text-slate-500 font-mono">tok</span>
                            </div>
                        ) : (
                             <div className="text-xl font-mono text-white">{selectedSchool.ragConfig.chunkSize}</div>
                        )}
                    </div>

                    {/* Chunk Overlap */}
                    <div className={`transition-all ${isEditingConfig ? 'opacity-100' : 'opacity-70'}`}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chunk Overlap</label>
                        {isEditingConfig ? (
                            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-700 focus-within:border-brand-500 transition-colors">
                                <input 
                                    type="number" 
                                    value={selectedSchool.ragConfig.chunkOverlap}
                                    onChange={(e) => handleSchoolUpdate({
                                        ...selectedSchool,
                                        ragConfig: { ...selectedSchool.ragConfig, chunkOverlap: parseInt(e.target.value) || 0 }
                                    })}
                                    className="bg-transparent text-white w-full focus:outline-none font-mono"
                                    min="0" max="512"
                                />
                                <span className="text-xs text-slate-500 font-mono">tok</span>
                            </div>
                        ) : (
                            <div className="text-xl font-mono text-white">{selectedSchool.ragConfig.chunkOverlap}</div>
                        )}
                    </div>

                    {/* Retrieval K */}
                    <div className={`transition-all ${isEditingConfig ? 'opacity-100' : 'opacity-70'}`}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Retrieval Depth (K)</label>
                        {isEditingConfig ? (
                            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-700 focus-within:border-brand-500 transition-colors">
                                <input 
                                    type="number" 
                                    value={selectedSchool.ragConfig.retrievalK}
                                    onChange={(e) => handleSchoolUpdate({
                                        ...selectedSchool,
                                        ragConfig: { ...selectedSchool.ragConfig, retrievalK: parseInt(e.target.value) || 1 }
                                    })}
                                    className="bg-transparent text-white w-full focus:outline-none font-mono"
                                    min="1" max="10"
                                />
                                <span className="text-xs text-slate-500 font-mono">docs</span>
                            </div>
                        ) : (
                            <div className="text-xl font-mono text-white">{selectedSchool.ragConfig.retrievalK}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Detail Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-slate-900/50 p-1 rounded-lg mb-6 w-full md:w-fit border border-slate-800 scrollbar-hide">
           {['overview', 'rag', 'users', 'quizzes'].map((tab) => (
             <button
               key={tab}
               onClick={() => setDetailTab(tab as any)}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${detailTab === tab ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
               {tab === 'rag' ? 'Knowledge Base' : tab}
             </button>
           ))}
        </div>

        <div className="w-full">
            {/* DETAIL CONTENT */}
            {detailTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                     <h3 className="text-slate-400 text-sm font-medium mb-2">Total Students</h3>
                     <p className="text-3xl font-bold text-white">{selectedSchool.studentCount}</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                     <h3 className="text-slate-400 text-sm font-medium mb-2">Vector Usage</h3>
                     <p className="text-3xl font-bold text-white">1.2 GB <span className="text-sm text-slate-500 font-normal">/ 5 GB</span></p>
                     <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-brand-500 h-full w-[24%]"></div>
                     </div>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                     <h3 className="text-slate-400 text-sm font-medium mb-2">Est. Monthly Cost</h3>
                     <p className="text-3xl font-bold text-white">$499.00</p>
                  </div>
              </div>
            )}

            {detailTab === 'rag' && (
               <div className="animate-fade-in">
                  <div className="mb-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start space-x-3">
                     <p className="text-sm text-blue-200">
                       <strong>Super Admin Mode:</strong> Managing RAG for {selectedSchool.name}. 
                       Files uploaded here propagate to all users in this tenant.
                     </p>
                  </div>
                  <RAGUploader 
                    targetSchoolId={selectedSchool.id}
                    currentUserRole={Role.SUPER_ADMIN}
                    ragConfig={selectedSchool.ragConfig}
                    onConfigChange={(newConfig) => handleSchoolUpdate({...selectedSchool, ragConfig: newConfig})}
                  />
               </div>
            )}

            {detailTab === 'quizzes' && (
                <div className="animate-fade-in">
                    <QuizManager schoolId={selectedSchool.id} />
                </div>
            )}
            
            {detailTab === 'users' && (
               <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
                 <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                     <h3 className="font-bold">User Directory</h3>
                     <span className="text-xs text-slate-500">{totalUsers} users found</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {loadingUsers ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading directory...</td></tr>
                        ) : schoolUsers.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found for this school.</td></tr>
                        ) : (
                            schoolUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-white">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.email}</p>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">{u.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                    <span className="text-green-400 text-xs">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleUserAction('Edit', u.name)} className="text-slate-500 hover:text-brand-400 mr-2">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                 </div>
               </div>
            )}
        </div>
      </div>
    );
  }

  // --- SUPER ADMIN MAIN DASHBOARD ---
  return (
      <div className="flex flex-col w-full h-full bg-slate-950 text-white">
        {/* Navigation is now handled by Layout sidebar */}
        
        <div className="p-4 md:p-6 w-full overflow-y-auto flex-1">
          
          {/* OVERVIEW TAB */}
          {currentTab === 'overview' && (
             <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {/* KPI CARDS */}
                   <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-brand-500/30 transition-colors">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Tenants</h4>
                      <p className="text-3xl font-display font-bold text-white mt-2">{schools.length}</p>
                   </div>
                   <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-brand-500/30 transition-colors">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</h4>
                      <p className="text-3xl font-display font-bold text-white mt-2">4,250</p>
                   </div>
                   <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-brand-500/30 transition-colors">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Monthly Revenue</h4>
                      <p className="text-3xl font-display font-bold text-white mt-2">$14.5k</p>
                   </div>
                   <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-brand-500/30 transition-colors">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Latency</h4>
                      <p className="text-3xl font-display font-bold text-white mt-2">{health?.vectorDbLatency || 0}ms</p>
                   </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                   <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[400px]">
                      <h3 className="text-lg font-bold text-white mb-6">Revenue Growth</h3>
                      {revenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenue}>
                                <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                      ) : <div className="h-full flex items-center justify-center text-slate-500">No revenue data available</div>}
                   </div>
                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[400px]">
                      <h3 className="text-lg font-bold text-white mb-6">Plans</h3>
                      <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie
                               data={[
                                 { name: 'Enterprise', value: 35 },
                                 { name: 'Pro', value: 45 },
                                 { name: 'Free', value: 20 },
                               ]}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#0f172a'}} />
                            <Legend verticalAlign="bottom" />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          )}

          {/* TENANTS TAB */}
          {currentTab === 'tenants' && (
             <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="font-bold text-white">School Registry</h3>
                  <input type="text" placeholder="Search..." className="w-full md:w-auto bg-slate-950 border border-slate-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-brand-500" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4">School</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Users</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {schools.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-slate-500">No schools found.</td></tr> : 
                        schools.map((school) => (
                            <tr key={school.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4 font-medium text-white">{school.name}</td>
                            <td className="px-6 py-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs text-brand-400 uppercase">{school.subscriptionPlan}</span></td>
                            <td className="px-6 py-4 text-slate-300">{school.studentCount}</td>
                            <td className="px-6 py-4 text-green-400">{school.status}</td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                onClick={() => setSelectedSchoolId(school.id)}
                                className="text-sm font-medium text-brand-400 hover:text-brand-300 border border-transparent hover:border-brand-500/50 px-3 py-1 rounded transition-all"
                                >
                                Manage
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {/* FINANCIALS TAB */}
          {currentTab === 'financials' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-4">Revenue Breakdown</h3>
                  <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenue}>
                           <XAxis dataKey="month" stroke="#64748b" />
                           <YAxis stroke="#64748b" />
                           <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                           <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                           <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                </div>
             </div>
          )}

          {/* INFRASTRUCTURE TAB */}
          {currentTab === 'infrastructure' && (
             <div className="space-y-6 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">Top Token Consumers</h3>
                        <div className="space-y-4">
                           {tokens.map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded transition-colors">
                                 <span className="text-sm font-medium text-white">{item.schoolName}</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-purple-400">{item.tokens}M</span>
                                    <span className="text-xs text-slate-500">tokens</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                 </div>
             </div>
          )}
        </div>
      </div>
    );
};
