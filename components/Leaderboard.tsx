import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-brand-900 to-slate-900">
        <h3 className="font-display font-bold text-lg text-white flex items-center">
          <span className="mr-2">🏆</span> Class Leaderboard
        </h3>
      </div>
      <div className="divide-y divide-slate-800">
        {data.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                entry.rank === 1 ? 'bg-yellow-500 text-black' :
                entry.rank === 2 ? 'bg-slate-400 text-black' :
                entry.rank === 3 ? 'bg-orange-700 text-white' :
                'bg-slate-800 text-slate-400'
              }`}>
                {entry.rank}
              </div>
              <div>
                <p className="font-medium text-white">{entry.studentName}</p>
                <div className="flex space-x-1 mt-1">
                  {entry.badges.map((b, i) => <span key={i} title="Badge">{b}</span>)}
                </div>
              </div>
            </div>
            <div className="text-brand-400 font-mono font-bold">
              {entry.xp.toLocaleString()} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;