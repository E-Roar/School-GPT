
import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { databaseService } from '../services/database';

interface QuizManagerProps {
  schoolId: string;
}

const QuizManager: React.FC<QuizManagerProps> = ({ schoolId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizzes = async () => {
      setLoading(true);
      const data = await databaseService.getQuizzesBySchool(schoolId);
      setQuizzes(data);
      setLoading(false);
    };
    loadQuizzes();
  }, [schoolId]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading Quizzes...</div>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
        <h3 className="text-lg font-display font-bold text-white">Generated Quiz History</h3>
        <span className="text-xs text-slate-400">AI & Teacher Generated Assessments</span>
      </div>
      
      <table className="w-full text-left">
        <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
           <tr>
             <th className="px-6 py-4">Quiz Title</th>
             <th className="px-6 py-4">Source Material</th>
             <th className="px-6 py-4">Creator</th>
             <th className="px-6 py-4 text-center">Completions</th>
             <th className="px-6 py-4 text-center">Avg. Score</th>
             <th className="px-6 py-4 text-right">Date</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
           {quizzes.length === 0 ? (
             <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No quizzes generated yet.</td></tr>
           ) : (
             quizzes.map(quiz => (
               <tr key={quiz.id} className="hover:bg-slate-800/30 transition-colors">
                 <td className="px-6 py-4 font-medium text-white">{quiz.title}</td>
                 <td className="px-6 py-4">
                    {quiz.docName ? (
                      <div className="flex items-center gap-1 text-xs text-brand-400 bg-brand-900/20 px-2 py-1 rounded w-fit">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <span className="truncate max-w-[150px]">{quiz.docName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">General Topic</span>
                    )}
                 </td>
                 <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${quiz.createdBy === 'AI' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                       {quiz.createdBy}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-center text-slate-300">{quiz.completionCount}</td>
                 <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${quiz.avgScore >= 80 ? 'text-green-400' : quiz.avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {quiz.avgScore}%
                    </span>
                 </td>
                 <td className="px-6 py-4 text-right text-xs text-slate-500 font-mono">{quiz.dateCreated}</td>
               </tr>
             ))
           )}
        </tbody>
      </table>
    </div>
  );
};

export default QuizManager;
