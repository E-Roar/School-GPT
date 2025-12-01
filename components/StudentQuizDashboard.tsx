
import React from 'react';
import { Quiz, User } from '../types';
import { MOCK_QUIZZES } from '../constants';

interface StudentQuizDashboardProps {
  user: User;
  onStartQuiz: (topic: string) => void;
}

export const StudentQuizDashboard: React.FC<StudentQuizDashboardProps> = ({ user, onStartQuiz }) => {
  // Mocking student specific data based on the general mock quizzes
  const myQuizzes = MOCK_QUIZZES.map(q => ({
    ...q,
    myScore: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 60 : null, // Random score or null (not taken)
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
  }));

  const completedCount = myQuizzes.filter(q => q.myScore !== null).length;
  const avgScore = completedCount > 0 
    ? Math.round(myQuizzes.reduce((acc, q) => acc + (q.myScore || 0), 0) / completedCount) 
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-20">
      {/* Header Stats */}
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Quiz Center</h2>
        <p className="text-slate-400">Test your knowledge and earn XP to climb the leaderboard.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
           <div className="bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-500/30 p-5 rounded-xl flex items-center space-x-4 shadow-lg shadow-brand-500/10">
               <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-2xl">⚡</div>
               <div>
                   <p className="text-brand-300 text-xs font-bold uppercase tracking-wider">Total XP Earned</p>
                   <p className="text-2xl font-display font-bold text-white">{user.xp?.toLocaleString()}</p>
               </div>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4">
               <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">✅</div>
               <div>
                   <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">Quizzes Completed</p>
                   <p className="text-2xl font-display font-bold text-white">{completedCount}</p>
               </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4">
               <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">🎯</div>
               <div>
                   <p className="text-green-300 text-xs font-bold uppercase tracking-wider">Average Score</p>
                   <p className="text-2xl font-display font-bold text-white">{avgScore}%</p>
               </div>
           </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
         Available Assessments
         <span className="ml-3 text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{myQuizzes.length}</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myQuizzes.map((quiz) => (
             <div key={quiz.id} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-brand-500/50 transition-all hover:shadow-xl hover:shadow-brand-500/10 flex flex-col">
                 <div className="h-2 bg-gradient-to-r from-brand-500 to-accent-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                 <div className="p-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-3">
                         <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                             quiz.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                             quiz.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                             'bg-red-500/10 text-red-400'
                         }`}>
                             {quiz.difficulty}
                         </span>
                         {quiz.myScore !== null && (
                             <div className="flex items-center space-x-1 text-green-400">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                 <span className="font-bold">{quiz.myScore}%</span>
                             </div>
                         )}
                     </div>
                     
                     <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">{quiz.title}</h4>
                     <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {quiz.docName ? `Based on ${quiz.docName}` : 'General knowledge assessment'}
                     </p>
                     
                     <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                         <div className="text-xs text-slate-500">
                             {quiz.questionCount} Questions • 15 min
                         </div>
                         <button 
                           onClick={() => onStartQuiz(quiz.title)}
                           className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform active:scale-95 ${
                               quiz.myScore !== null 
                               ? 'bg-slate-800 text-white hover:bg-slate-700' 
                               : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/25'
                           }`}
                         >
                            {quiz.myScore !== null ? 'Retake Quiz' : 'Start Quiz'}
                         </button>
                     </div>
                 </div>
             </div>
          ))}

          {/* New Custom Quiz Card */}
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-900 hover:border-slate-700 transition-colors cursor-pointer group" onClick={() => onStartQuiz("a topic of my choice")}>
              <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  ➕
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Custom Quiz</h4>
              <p className="text-slate-400 text-sm">Ask the AI to generate a quiz on any specific topic.</p>
          </div>
      </div>
    </div>
  );
};
