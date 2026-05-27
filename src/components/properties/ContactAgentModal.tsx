import { X, Send } from 'lucide-react';
import React, { useState } from 'react';

export function ContactAgentModal({ isOpen, onClose, agentName, propertyTitle }: { isOpen: boolean, onClose: () => void, agentName: string, propertyTitle: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-kliyvo-black border border-white/10 rounded-2xl shadow-2xl flex flex-col p-6 animate-in zoom-in-95">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white tracking-tight">Contact {agentName || 'Agent'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="py-12 text-center text-electric-lime space-y-4">
            <Send className="w-12 h-12 mx-auto opacity-80" />
            <h3 className="text-xl font-bold font-display">Message Sent</h3>
            <p className="text-gray-400 text-sm font-medium">The agent will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm font-medium text-gray-400 mb-6">
              You're inquiring about <span className="text-white font-bold">{propertyTitle}</span>
            </p>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
              <input required type="text" className="w-full px-4 py-3 bg-kliyvo-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-electric-lime/50 transition-colors" placeholder="John Doe" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input required type="email" className="w-full px-4 py-3 bg-kliyvo-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-electric-lime/50 transition-colors" placeholder="john@example.com" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
              <textarea 
                required
                rows={4} 
                className="w-full px-4 py-3 bg-kliyvo-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-electric-lime/50 transition-colors resize-none" 
                defaultValue={`I am interested in ${propertyTitle} and would like to schedule a viewing.`} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={status === 'sending'}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-electric-lime hover:bg-white text-black font-bold py-3.5 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
               {status === 'sending' ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...
                  </span>
               ) : (
                  <>Send Message <Send className="w-4 h-4" /></>
               )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
