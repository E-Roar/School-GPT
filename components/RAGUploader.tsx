
import React, { useState, useEffect, useMemo } from 'react';
import { RAGDocument, Role, RAGConfiguration } from '../types';
import { databaseService } from '../services/database';

interface RAGUploaderProps {
  documents?: RAGDocument[]; // Optional now as it fetches internally if needed
  onUpload?: (doc: RAGDocument) => void;
  targetSchoolId: string; 
  currentUserRole: Role;
  ragConfig?: RAGConfiguration; 
  onConfigChange?: (config: RAGConfiguration) => void;
}

type SortField = 'date' | 'name' | 'citationCount' | 'engagementScore';

export const RAGUploader: React.FC<RAGUploaderProps> = ({ 
  documents: initialDocuments, 
  onUpload, 
  targetSchoolId, 
  currentUserRole,
  ragConfig,
  onConfigChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localDocs, setLocalDocs] = useState<RAGDocument[]>(initialDocuments || []);
  const [loading, setLoading] = useState(false);
  
  // Filter & Sort State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');

  // Fetch if not provided
  useEffect(() => {
    if (!initialDocuments) {
        const loadDocs = async () => {
            setLoading(true);
            const docs = await databaseService.getDocuments(targetSchoolId);
            setLocalDocs(docs);
            setLoading(false);
        };
        loadDocs();
    } else {
        setLocalDocs(initialDocuments.filter(d => d.schoolId === targetSchoolId));
    }
  }, [initialDocuments, targetSchoolId]);

  const handleFile = async (file: File) => {
    const newDoc: RAGDocument = {
      id: Math.random().toString(36).substr(2, 9),
      schoolId: targetSchoolId,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      status: 'processing',
      uploadDate: new Date().toLocaleDateString(),
      uploadedBy: currentUserRole,
      uploadedByName: 'Admin Upload', // In real app, get from user context
      citationCount: 0,
      quizzesGenerated: 0,
      engagementScore: 0
    };

    await databaseService.addDocument(newDoc);
    setLocalDocs(prev => [newDoc, ...prev]);

    setTimeout(async () => {
        const updatedDoc = { ...newDoc, status: 'ready' as const };
        setLocalDocs(prev => prev.map(d => d.id === newDoc.id ? updatedDoc : d));
    }, 3000);
    
    if (onUpload) onUpload(newDoc);
  };

  const handleDelete = async (id: string) => {
      await databaseService.deleteDocument(id);
      setLocalDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleSort = (field: SortField) => {
      if (sortField === field) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortField(field);
          setSortDirection('desc');
      }
  };

  // Derived State for Table
  const processedDocs = useMemo(() => {
      let docs = [...localDocs];
      
      // Filter
      if (filterTeacher !== 'all') {
          docs = docs.filter(d => d.uploadedByName === filterTeacher);
      }

      // Sort
      docs.sort((a, b) => {
          let valA: any = a[sortField];
          let valB: any = b[sortField];
          
          // Handle Date specially
          if (sortField === 'date') {
             valA = new Date(a.uploadDate).getTime();
             valB = new Date(b.uploadDate).getTime();
          }

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
      });

      return docs;
  }, [localDocs, filterTeacher, sortField, sortDirection]);

  // Unique teachers for filter dropdown
  const teachers = Array.from(new Set(localDocs.map(d => d.uploadedByName).filter(Boolean)));

  const isSuperAdmin = currentUserRole === Role.SUPER_ADMIN;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
         <div>
            <h3 className="text-lg font-display font-bold text-white">Knowledge Base Analytics</h3>
            <p className="text-xs text-slate-400">Content Engagement & RAG Performance</p>
         </div>
         <div className="flex gap-3">
            {isSuperAdmin && ragConfig && (
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${showSettings ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Config
            </button>
            )}
         </div>
      </div>
      
      {/* SETTINGS PANEL */}
      {showSettings && isSuperAdmin && ragConfig && onConfigChange && (
        <div className="bg-slate-950 border-b border-slate-700 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div>
               <label className="block text-xs text-slate-400 mb-2 font-bold uppercase">Chunk Size</label>
               <div className="flex items-center gap-3">
                  <input 
                    type="range" min="128" max="2048" step="128" 
                    value={ragConfig.chunkSize}
                    onChange={(e) => onConfigChange({...ragConfig, chunkSize: parseInt(e.target.value)})}
                    className="w-full accent-brand-500"
                  />
                  <span className="text-sm font-mono text-brand-400 w-12">{ragConfig.chunkSize}</span>
               </div>
            </div>
            <div>
               <label className="block text-xs text-slate-400 mb-2 font-bold uppercase">Overlap</label>
               <div className="flex items-center gap-3">
                  <input 
                    type="range" min="0" max="200" step="10" 
                    value={ragConfig.chunkOverlap}
                    onChange={(e) => onConfigChange({...ragConfig, chunkOverlap: parseInt(e.target.value)})}
                    className="w-full accent-brand-500"
                  />
                  <span className="text-sm font-mono text-brand-400 w-12">{ragConfig.chunkOverlap}</span>
               </div>
            </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="p-6 space-y-6">
        
        {/* Drag Drop Zone */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-brand-500 bg-brand-900/20' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
           <div className="flex flex-col items-center justify-center">
               <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
               <p className="text-slate-300 text-sm">Drag new PDF/Docs here</p>
           </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="relative">
                   <select 
                     value={filterTeacher}
                     onChange={(e) => setFilterTeacher(e.target.value)}
                     className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-brand-500"
                   >
                       <option value="all">All Uploaders</option>
                       {teachers.map(t => <option key={t} value={t!}>{t}</option>)}
                   </select>
                   <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                </div>
            </div>
            <div className="text-xs text-slate-500">
                {processedDocs.length} Documents Found
            </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                            Document Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-3">Uploader</th>
                        <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('citationCount')}>
                            Citations {sortField === 'citationCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                         <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('engagementScore')}>
                            Engagement {sortField === 'engagementScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {loading ? (
                         <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading Analytics...</td></tr>
                    ) : processedDocs.length === 0 ? (
                        <tr><td colSpan={6} className="p-6 text-center text-slate-500">No documents found.</td></tr>
                    ) : (
                        processedDocs.map(doc => (
                            <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <div>
                                            <p className="text-sm font-medium text-white truncate max-w-[200px]" title={doc.name}>{doc.name}</p>
                                            <p className="text-[10px] text-slate-500">{doc.size}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                                        {doc.uploadedByName || doc.uploadedBy}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                                    {doc.uploadDate}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold text-brand-400">{doc.citationCount}</span>
                                        <span className="text-[10px] text-slate-500">refs</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full ${doc.engagementScore > 80 ? 'bg-gradient-to-r from-green-400 to-green-600' : doc.engagementScore > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-slate-600'}`}
                                              style={{ width: `${doc.engagementScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-300">{doc.engagementScore}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                     {isSuperAdmin && (
                                        <button onClick={() => handleDelete(doc.id)} className="text-slate-500 hover:text-red-400 transition-colors" title="Delete Index">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                     )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    );
  };
