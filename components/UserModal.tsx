
import React, { useState } from 'react';
import { Role, UserFormData } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  schoolId: string;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, schoolId }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: Role.STUDENT,
    schoolId: schoolId
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
    // Reset form
    setFormData({ name: '', email: '', role: Role.STUDENT, schoolId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
       <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 relative animate-float">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <h3 className="text-xl font-display font-bold text-white mb-1">Add New User</h3>
          <p className="text-slate-400 text-sm mb-6">Create a new account for your school.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="John Doe"
                />
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="john@school.edu"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Role</label>
                <select 
                   value={formData.role}
                   onChange={e => setFormData({...formData, role: e.target.value as Role})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-brand-500 focus:outline-none"
                >
                   <option value={Role.STUDENT}>Student</option>
                   <option value={Role.TEACHER}>Teacher</option>
                   <option value={Role.SCHOOL_ADMIN}>School Admin</option>
                </select>
             </div>

             <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-medium transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2 bg-brand-600 text-white rounded hover:bg-brand-500 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  Create User
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default UserModal;
