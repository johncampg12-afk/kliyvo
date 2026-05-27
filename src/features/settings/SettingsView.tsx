import { useAuthStore } from '../../store/useAuthStore';
import { User, Lock, Bell, Moon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

export function SettingsView() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('account');

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Please sign in to view settings.</p>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
       updateUser({ fullName });
       setIsSaving(false);
       alert('Profile updated successfully.');
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto w-full bg-kliyvo-black p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-2 lg:col-span-1">
             <button 
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'account' ? 'bg-kliyvo-gray border border-white/5 text-white border-l-4 border-l-electric-lime' : 'hover:bg-kliyvo-gray text-gray-400 hover:text-white'}`}
             >
                <User className="w-5 h-5 text-electric-lime" /> Account
             </button>
             <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'security' ? 'bg-kliyvo-gray border border-white/5 text-white border-l-4 border-l-electric-lime' : 'hover:bg-kliyvo-gray text-gray-400 hover:text-white'}`}
             >
                <Lock className="w-5 h-5" /> Security
             </button>
             <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'notifications' ? 'bg-kliyvo-gray border border-white/5 text-white border-l-4 border-l-electric-lime' : 'hover:bg-kliyvo-gray text-gray-400 hover:text-white'}`}
             >
                <Bell className="w-5 h-5" /> Notifications
             </button>
             <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'preferences' ? 'bg-kliyvo-gray border border-white/5 text-white border-l-4 border-l-electric-lime' : 'hover:bg-kliyvo-gray text-gray-400 hover:text-white'}`}
             >
                <Moon className="w-5 h-5" /> Preferences
             </button>
          </div>

          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'account' && (
              <>
            <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold font-display text-white mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full bg-kliyvo-dark border border-white/10 text-gray-400 rounded-lg px-4 py-3 text-sm cursor-not-allowed opacity-70"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 font-medium">Email cannot be changed directly. Contact support if needed.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name" 
                    className="w-full bg-kliyvo-dark border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-electric-lime text-kliyvo-black font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-kliyvo-gray border border-red-500/10 rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
               <h2 className="text-xl font-bold font-display text-white mb-2">Danger Zone</h2>
               <p className="text-gray-400 font-medium text-sm mb-6">Irreversible actions for your account.</p>
               
               <div className="flex items-center gap-4 justify-between">
                 <div>
                   <h4 className="font-bold text-white text-sm">Sign Out</h4>
                   <p className="text-gray-500 text-xs font-medium">Sign out on this device.</p>
                 </div>
                 <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-colors"
                 >
                   Sign Out
                 </button>
               </div>
            </div>
              </>
            )}

            {activeTab !== 'account' && (
              <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-12 text-center">
                 <h2 className="text-xl font-bold font-display text-white mb-2 tracking-tight capitalize">{activeTab} Settings</h2>
                 <p className="text-gray-400 font-medium">This section is currently under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
