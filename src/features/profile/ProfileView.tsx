import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { User, LogOut, Heart, FileText, Settings, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ProfileView() {
  const { user, logout, token, updateUser } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  const { data: myProperties, isLoading: isPropsLoading } = useQuery({
    queryKey: ['my-properties', user.id],
    queryFn: async () => {
      if (!token) return [];
      // Quick way to get properties for agent - normally there should be an endpoint like /api/me/properties
      const res = await fetch('/api/properties?agent_id=' + user.id);
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data = await res.json();
      // Filter just in case the endpoint doesn't support agent_id filtering perfectly yet
      return data.filter((p: any) => p.agent_id === user.id);
    },
    enabled: user.isAgent, // only if agent
  });

  return (
    <div className="flex-1 overflow-y-auto w-full bg-kliyvo-black">
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        
        {/* Profile Header */}
        <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="w-32 h-32 rounded-full border-2 border-white/10 shrink-0 bg-kliyvo-dark flex items-center justify-center overflow-hidden">
             {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-electric-lime/20 flex items-center justify-center text-electric-lime font-bold text-4xl">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
              {user.fullName || "User Profile"}
            </h1>
            <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-center md:items-start text-gray-400 font-medium mb-6">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</span>
              {user.isAgent && (
                <span className="flex items-center gap-2 text-electric-lime bg-electric-lime/10 px-3 py-1 rounded-full text-sm">
                  <ShieldCheck className="w-4 h-4" /> Verified Agent
                </span>
              )}
            </div>
            
            <div className="flex gap-4 justify-center md:justify-start">
              <Link to="/settings" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" /> Edit Profile
              </Link>
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Navigation/Sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Account Overview</h3>
            <button className="w-full text-left px-4 py-3 bg-kliyvo-gray border border-white/5 rounded-xl font-bold flex items-center gap-3 text-white border-l-4 border-l-electric-lime transition-all">
              <User className="w-5 h-5 text-electric-lime" /> Profile Info
            </button>
            <Link to="/discover" className="w-full text-left px-4 py-3 hover:bg-kliyvo-gray rounded-xl font-bold flex items-center gap-3 text-gray-400 hover:text-white transition-all">
               <Heart className="w-5 h-5" /> Saved Properties
            </Link>
            {user.isAgent && (
              <Link to="/publish" className="w-full text-left px-4 py-3 hover:bg-kliyvo-gray rounded-xl font-bold flex items-center gap-3 text-gray-400 hover:text-white transition-all">
                 <FileText className="w-5 h-5" /> Active Listings
              </Link>
            )}
          </div>
          
          <div className="lg:col-span-2">
            {user.isAgent && (
              <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display text-white">Your Listings</h2>
                  <Link to="/publish" className="text-electric-lime font-bold text-sm tracking-wide bg-electric-lime/10 px-4 py-2 rounded-lg hover:bg-electric-lime hover:text-black transition-colors">
                    Add New
                  </Link>
                </div>
                
                {isPropsLoading ? (
                  <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-electric-lime border-t-transparent rounded-full" /></div>
                ) : myProperties?.length > 0 ? (
                  <div className="space-y-4">
                    {myProperties.map((p: any) => (
                      <div key={p.id} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-kliyvo-black items-center">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-kliyvo-dark">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 bg-kliyvo-dark">No Img</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold font-display text-white">{p.title}</h4>
                            <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-white capitalize">{p.status}</span>
                          </div>
                          <p className="text-sm font-bold text-electric-lime mb-2">${Number(p.price).toLocaleString()}</p>
                          <div className="flex gap-4 text-xs font-medium text-gray-500">
                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 font-medium border border-dashed border-white/10 rounded-xl bg-white/5">
                    No active listings found. Start publishing properties!
                  </div>
                )}
              </div>
            )}
            
            {!user.isAgent && (
               <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-8 text-center">
                 <ShieldCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                 <h2 className="text-xl font-bold font-display text-white mb-2">Agent Upgrade</h2>
                 <p className="text-gray-400 font-medium mb-6">Want to list properties on Kliyvo? Upgrade to a Verified Agent account to start publishing your inventory.</p>
                 <button 
                   onClick={() => {
                     updateUser({ isAgent: true });
                     alert('Congratulations! You are now a Verified Agent.');
                   }}
                   className="bg-white text-kliyvo-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                 >
                   Apply for Agent Status
                 </button>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
