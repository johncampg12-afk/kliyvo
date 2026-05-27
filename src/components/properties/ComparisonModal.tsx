import { X, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function ComparisonModal({ properties, isOpen, onClose }: { properties: any[], isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-kliyvo-black border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Compare Properties</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          {properties.length === 0 ? (
             <div className="py-20 text-center text-gray-500">No properties selected for comparison.</div>
          ) : (
            <div className={`grid gap-6 ${properties.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : properties.length === 2 ? 'grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-3'}`}>
              {properties.map((prop, idx) => {
                // Calculate abstract score based on simple metrics
                const rawScore = (Number(prop.rooms || 0) * 10) + (Number(prop.bathrooms || 0) * 15) + (Number(prop.area_sqm || 0) / 10);
                const score = Math.max(10, Math.min(99, Math.floor(rawScore)));

                return (
                  <div key={prop.id} className="flex flex-col bg-kliyvo-gray border border-white/5 rounded-xl overflow-hidden relative">
                    {/* Image */}
                    <div className="h-48 bg-kliyvo-dark relative">
                      {prop.thumbnail ? (
                        <img src={prop.thumbnail} alt={prop.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-700 font-medium text-xs">No Image</div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-bold text-electric-lime">Prop {idx + 1}</span>
                      </div>
                    </div>
                    
                    {/* Basic Info */}
                    <div className="p-5 border-b border-white/5">
                      <div className="text-2xl font-bold text-white mb-2">${Number(prop.price).toLocaleString()}</div>
                      <h3 className="text-sm font-bold font-display text-gray-300 leading-tight line-clamp-2 min-h-[2.5rem]">{prop.title}</h3>
                    </div>

                    {/* Stats List */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col">
                      
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</span>
                        <span className="text-sm font-medium text-gray-200 capitalize">{prop.property_type || 'N/A'}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Listing</span>
                        <span className="text-sm font-medium text-gray-200 capitalize">{prop.listing_type || 'N/A'}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rooms</span>
                        <span className="text-sm font-medium text-gray-200">{prop.rooms || 0}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Baths</span>
                        <span className="text-sm font-medium text-gray-200">{prop.bathrooms || 0}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Area</span>
                        <span className="text-sm font-medium text-gray-200">{prop.area_sqm ? `${prop.area_sqm} m²` : 'N/A'}</span>
                      </div>
                      
                      <div className="mt-auto pt-6">
                        <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-white/5">
                           <span className="text-xs font-bold text-electric-lime uppercase tracking-widest">Match Score</span>
                           <span className="text-2xl font-display font-bold text-white">{score}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
