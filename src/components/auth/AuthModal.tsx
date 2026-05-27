import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { X, UserRound, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAgent, setIsAgent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? JSON.stringify({ email, password })
        : JSON.stringify({ email, password, fullName, isAgent });
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      setAuth(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Google Authentication failed');
      }
      
      setAuth(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-kliyvo-gray border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
              <UserRound className="w-5 h-5 text-electric-lime" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Join KLIYVO'}
            </h2>
          </div>
          <p className="text-gray-400 text-sm mb-6 font-sans">
            {isLogin ? 'Sign in to access your geospatial data.' : 'Create an account to browse or publish properties.'}
          </p>

          <div className="mb-6 flex justify-center w-full overflow-hidden rounded-lg">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text={isLogin ? 'signin_with' : 'signup_with'}
              width="334px"
            />
          </div>

          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-kliyvo-black border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-electric-lime/50 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-kliyvo-black border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-electric-lime/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-kliyvo-black border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-electric-lime/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            {!isLogin && (
              <div className="flex items-center gap-3 mt-4 p-4 rounded-lg bg-kliyvo-black/50 border border-white/5">
                <input 
                  type="checkbox" 
                  id="isAgent"
                  checked={isAgent}
                  onChange={(e) => setIsAgent(e.target.checked)}
                  className="w-4 h-4 rounded text-electric-lime focus:ring-electric-lime/50 bg-kliyvo-gray border-gray-600 outline-none"
                />
                <label htmlFor="isAgent" className="text-sm text-gray-300 select-none">
                  I am a Real Estate Agent
                </label>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm font-medium p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-kliyvo-black font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Profile')}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

