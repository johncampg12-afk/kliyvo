/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { AuthModal } from './components/auth/AuthModal';
import { PropertyUploadForm } from './components/properties/PropertyUploadForm';
import { DiscoveryView } from './features/discovery/DiscoveryView';
import { PropertyDetailViewWrapper } from './features/property-detail/PropertyDetailViewWrapper';
import { LogOut, Map, Plus, User as UserIcon } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LandingView } from './features/landing/LandingView';
import { ProfileView } from './features/profile/ProfileView';
import { SettingsView } from './features/settings/SettingsView';

function NavigationHeader({ setIsAuthOpen }: { setIsAuthOpen: (b: boolean) => void }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isDiscover = location.pathname.startsWith('/discover');
  const isPublish = location.pathname === '/publish';
  
  return (
    <header className="border-b border-light/5 py-3 px-6 flex items-center justify-between shrink-0 bg-kliyvo-black z-20">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-3xl font-display font-bold tracking-tighter text-white">
          KLIYVO<span className="text-electric-lime">.</span>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center flex-1 justify-center ml-8">
          <Link to="/discover?type=sale" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
            Buy
          </Link>
          <Link to="/discover?type=rent" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
            Rent
          </Link>
          <Link to="/publish" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
            Sell
          </Link>
          <Link to="/discover" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
            Agent Finder
          </Link>
          {user?.isAgent && (
            <Link to="/publish" className="text-sm font-bold text-electric-lime hover:text-white transition-colors">
              Manage Rentals
            </Link>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 hidden sm:flex hover:opacity-80 transition-opacity">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-electric-lime/20 flex items-center justify-center text-electric-lime font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-400 font-sans">
                {user.fullName || user.email} {user.isAgent && <span className="bg-electric-lime/10 text-electric-lime px-2 py-0.5 rounded-md text-[10px] ml-2 tracking-wide font-bold uppercase hidden lg:inline-block">Verified Agent</span>}
              </span>
            </Link>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="bg-white text-kliyvo-black font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

function MainApp() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-kliyvo-black text-kliyvo-white overflow-hidden">
      <NavigationHeader setIsAuthOpen={setIsAuthOpen} />

      <main className="flex-1 overflow-y-auto w-full relative">
        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route path="/discover" element={
            <DiscoveryView onSelectProperty={(id) => navigate(`/property/${id}`)} />
          } />
          <Route path="/publish" element={
            <div className="p-6 h-full text-center">
              <PropertyUploadForm />
            </div>
          } />
          <Route path="/property/:id" element={<PropertyDetailViewWrapper />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  )
}
