
import React, { useState, useEffect } from 'react';
import { User, Role, Classroom, RAGDocument, UserFormData } from '../types';
import { databaseService } from '../services/database';
import { RAGUploader } from './RAGUploader';
import UserModal from './UserModal';

interface SchoolAdminDashboardProps {
  user: User;
  currentTab: string;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ user, currentTab }) => {
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
         const [fetchedUsers, fetchedClasses, fetchedDocs] = await Promise.all([
             databaseService.getUsersBySchool(user.schoolId, 1, 100), // get all for now
             databaseService.getClassrooms(user.schoolId),
             databaseService.getDocuments(user.schoolId)
         ]);
         setUsers(fetchedUsers.users);
         setClasses(fetchedClasses);
         setDocuments(fetchedDocs);
      } catch (e) {
         console.error("Failed to fetch school data", e);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, [user.schoolId]);

  const handleCreateUser = async (data: UserFormData) => {
      const newUser = await databaseService.createUser(data);
      setUsers(prev => [newUser, ...prev]);
  };

  const handleDeleteUser = async (userId: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
          await databaseService.deleteUser(userId);
          setUsers(prev => prev.filter(u => u.id !== userId));
      }
  };

  const StatsCard = ({ title, value, icon, color }: any) => (
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-400 shrink-0`}>
              {icon}
          </div>
          <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-display font-bold text-white">{value}</p>
          </div>
      </div>
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col w-full">
       {/* Modal */}
       <UserModal 
          isOpen={isUserModalOpen} 
          onClose={() => setIsUserModalOpen(false)} 
          onSubmit={handleCreateUser}
          schoolId={user.schoolId}
       />

       {/* Navigation is handled by Sidebar layout now */}

       <div className="p-4 md:p-6 w-full overflow-hidden">
           {/* OVERVIEW */}
           {currentTab === 'admin_overview' && (
               <div className="space-y-6 animate-fade-in">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       <StatsCard 
                          title="Total Students" value={users.filter(u => u.role === Role.STUDENT).length} color="brand"
                          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                       />
                       <StatsCard 
                          title="Teachers" value={users.filter(u => u.role === Role.TEACHER).length} color="accent"
                          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                       />
                       <StatsCard 
                          title="Active Classes" value={classes.length} color="green"
                          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                       />
                       <StatsCard 
                          title="Files Uploaded" value={documents.length} color="purple"
                          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                       />
                   </div>
                   
                   <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                       <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                       <div className="space-y-4">
                           {documents.slice(0,3).map(doc => (
                               <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                   <div className="flex items-center space-x-3">
                                       <div className="w-8 h-8 bg-blue-900/30 rounded flex items-center justify-center text-blue-400">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                       </div>
                                       <div>
                                           <p className="text-sm font-medium text-white">New document processed</p>
                                           <p className="text-xs text-slate-500">{doc.name}</p>
                                       </div>
                                   </div>
                                   <span className="text-xs text-slate-500">{doc.uploadDate}</span>
                               </div>
                           ))}
                           {users.slice(0,2).map(u => (
                               <div key={u.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                   <div className="flex items-center space-x-3">
                                       <div className="w-8 h-8 bg-green-900/30 rounded flex items-center justify-center text-green-400">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                       </div>
                                       <div>
                                           <p className="text-sm font-medium text-white">New user added</p>
                                           <p className="text-xs text-slate-500">{u.name} ({u.role})</p>
                                       </div>
                                   </div>
                                   <span className="text-xs text-slate-500">Just now</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           )}

           {/* USERS */}
           {currentTab === 'users' && (
               <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h3 className="text-xl font-bold text-white">Directory</h3>
                      <button 
                        onClick={() => setIsUserModalOpen(true)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-lg shadow-brand-500/20 transition-colors font-medium flex items-center gap-2"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                         Add User
                      </button>
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
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
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-800/30">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-xs font-bold text-brand-300">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{u.name}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-800 ${u.role === Role.TEACHER ? 'text-blue-400' : u.role === Role.SCHOOL_ADMIN ? 'text-purple-400' : 'text-slate-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-400 text-xs font-bold uppercase">Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-slate-500 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </div>
               </div>
           )}

           {/* CLASSES */}
           {currentTab === 'classes' && (
               <div className="space-y-4 animate-fade-in">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">Class Management</h3>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 font-medium transition-colors">
                         + New Class
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {classes.map(c => (
                           <div key={c.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-brand-500/50 transition-colors group relative">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-xl">
                                       📚
                                   </div>
                                   <button className="text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg></button>
                               </div>
                               <h4 className="text-lg font-bold text-white mb-1">{c.name}</h4>
                               <p className="text-sm text-slate-400 mb-4">{c.teacherName}</p>
                               
                               <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                                   <div className="flex items-center space-x-1">
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                       <span>{c.studentCount} Students</span>
                                   </div>
                                   <span>{c.schedule}</span>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {/* CONTENT */}
           {currentTab === 'content' && (
               <div className="animate-fade-in">
                   <RAGUploader 
                      targetSchoolId={user.schoolId}
                      currentUserRole={Role.SCHOOL_ADMIN}
                   />
               </div>
           )}
       </div>
    </div>
  );
};
