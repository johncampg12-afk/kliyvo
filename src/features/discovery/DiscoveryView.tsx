import React, { useState, useEffect } from 'react';
import { PropertyMap } from '../../components/map/PropertyMap';
import { SlidersHorizontal, MapPin, Heart, Plus, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useFavorites } from '../../hooks/useFavorites';
import { useSearchParams } from 'react-router-dom';
import { ComparisonModal } from '../../components/properties/ComparisonModal';

export function DiscoveryView({ onSelectProperty }: { onSelectProperty: (id: string) => void }) {
  const [urlParams, setUrlParams] = useSearchParams();
  const listingType = urlParams.get('type') || 'all';
  
  const [searchParams, setSearchParams] = useState({ lat: -0.1807, lng: -78.4678, radius: 5000, type: listingType, minPrice: '', maxPrice: '', minRooms: '', minBaths: '', propertyType: 'all', sort: 'newest' });
  const [radiusInput, setRadiusInput] = useState(5); // km
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [minRoomsInput, setMinRoomsInput] = useState('');
  const [minBathsInput, setMinBathsInput] = useState('');
  const [propertyTypeInput, setPropertyTypeInput] = useState('all');
  const [sortInput, setSortInput] = useState('newest');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  const { isFavorited, toggleFavorite } = useFavorites();

  // Sync state if url changes
  useEffect(() => {
    setSearchParams(prev => ({ ...prev, type: listingType }));
  }, [listingType]);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', searchParams],
    queryFn: async () => {
      const url = new URL('/api/properties', window.location.origin);
      url.searchParams.append('lat', (searchParams as any).lat.toString());
      url.searchParams.append('lng', (searchParams as any).lng.toString());
      url.searchParams.append('radius', (searchParams as any).radius.toString());
      if (searchParams.type && searchParams.type !== 'all') {
         url.searchParams.append('listing_type', searchParams.type);
      }
      if ((searchParams as any).minPrice) {
         url.searchParams.append('min_price', (searchParams as any).minPrice);
      }
      if ((searchParams as any).maxPrice) {
         url.searchParams.append('max_price', (searchParams as any).maxPrice);
      }
      if ((searchParams as any).minRooms) {
         url.searchParams.append('min_rooms', (searchParams as any).minRooms);
      }
      if ((searchParams as any).minBaths) {
         url.searchParams.append('min_baths', (searchParams as any).minBaths);
      }
      if ((searchParams as any).propertyType && (searchParams as any).propertyType !== 'all') {
         url.searchParams.append('property_type', (searchParams as any).propertyType);
      }
      if ((searchParams as any).sort) {
         url.searchParams.append('sort', (searchParams as any).sort);
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const handleSearch = () => {
    setSearchParams((prev: any) => ({ 
      ...prev, 
      radius: radiusInput * 1000, 
      minPrice: minPriceInput, 
      maxPrice: maxPriceInput,
      minRooms: minRoomsInput,
      minBaths: minBathsInput,
      propertyType: propertyTypeInput,
      sort: sortInput
    }));
  };

  const handleTypeChange = (type: string) => {
     if (type === 'all') {
       urlParams.delete('type');
     } else {
       urlParams.set('type', type);
     }
     setUrlParams(urlParams);
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 3) {
         alert('You can only compare up to 3 properties at a time.');
         return prev;
      }
      return [...prev, id];
    });
  };

  const propertiesToCompare = properties?.filter((p: any) => compareIds.includes(p.id)) || [];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden relative">
      {/* Sidebar: Filters & List */}
      <div className="w-full md:w-[450px] lg:w-[500px] h-full flex flex-col bg-kliyvo-black border-r border-white/5 z-10 shrink-0 shadow-2xl">
        
        {/* Search Header */}
        <div className="p-6 border-b border-light/5 space-y-4 shadow-sm z-10 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                disabled
                value="Quito, Ecuador (Demo)"
                className="w-full bg-kliyvo-gray border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors cursor-not-allowed"
              />
            </div>
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`p-3 border rounded-lg transition-colors group ${isFiltersOpen ? 'bg-electric-lime text-black border-electric-lime' : 'bg-kliyvo-gray text-gray-400 border-white/10 hover:bg-white/5'}`}
            >
              <SlidersHorizontal className={`w-5 h-5 ${isFiltersOpen ? 'text-black' : 'group-hover:text-electric-lime'}`} />
            </button>
          </div>
          
          {isFiltersOpen && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-4 text-sm mt-4 border-t border-white/5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Listing Type</label>
                <div className="flex gap-2">
                  {['all', 'sale', 'rent'].map(t => (
                    <button 
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={`flex-1 py-1.5 rounded font-bold capitalize text-sm transition-colors ${listingType === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Price Range</label>
                <div className="flex gap-2 items-center mb-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="flex-1 bg-kliyvo-dark border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                  />
                  <span className="text-gray-500 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="flex-1 bg-kliyvo-dark border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                  />
                </div>

                <div className="flex gap-4 mb-4">
                   <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Property Type</label>
                      <select 
                         value={propertyTypeInput}
                         onChange={(e) => setPropertyTypeInput(e.target.value)}
                         className="w-full bg-kliyvo-dark border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                      >
                         <option value="all">Any</option>
                         <option value="apartment">Apartment</option>
                         <option value="house">House</option>
                         <option value="land">Commercial/Land</option>
                      </select>
                   </div>
                   <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Sort By</label>
                      <select 
                         value={sortInput}
                         onChange={(e) => setSortInput(e.target.value)}
                         className="w-full bg-kliyvo-dark border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                      >
                         <option value="newest">Newest</option>
                         <option value="price_asc">Price (Low)</option>
                         <option value="price_desc">Price (High)</option>
                      </select>
                   </div>
                </div>

                <div className="flex gap-4 mb-6">
                   <div className="flex-1">
                     <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Rooms (Min)</label>
                     <input
                       type="number"
                       placeholder="0"
                       min="0"
                       value={minRoomsInput}
                       onChange={(e) => setMinRoomsInput(e.target.value)}
                       className="w-full bg-kliyvo-dark border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                     />
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Baths (Min)</label>
                     <input
                       type="number"
                       placeholder="0"
                       min="0"
                       value={minBathsInput}
                       onChange={(e) => setMinBathsInput(e.target.value)}
                       className="w-full bg-kliyvo-dark border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-electric-lime/50 transition-colors"
                     />
                   </div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Radius ({radiusInput}km)</label>
                </div>
                <div className="flex gap-4 items-center">
                  <input 
                    type="range"
                    min="1"
                    max="50"
                    value={radiusInput}
                    onChange={(e) => setRadiusInput(Number(e.target.value))}
                    className="flex-1 h-2 bg-kliyvo-dark rounded-lg appearance-none cursor-pointer accent-electric-lime border border-white/10"
                  />
                  <button 
                    onClick={handleSearch}
                    className="bg-electric-lime text-kliyvo-black font-bold px-4 py-1.5 rounded hover:bg-white transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide z-0">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-display font-bold text-white">Select Property</h2>
            <span className="text-sm text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded">{properties?.length || 0} listings</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-electric-lime border-t-transparent rounded-full" />
            </div>
          ) : properties?.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 h-[300px] border border-dashed border-white/10 rounded-2xl bg-white/5">
                <MapPin className="w-10 h-10 text-gray-500 mb-4 opacity-50" />
                <p className="text-gray-400 text-sm font-medium">No properties found.</p>
             </div>
          ) : (
            <div className="space-y-4 pb-20 md:pb-0">
              {properties?.map((prop: any) => (
                <div 
                  key={prop.id} 
                  onClick={() => onSelectProperty(prop.id)}
                  className={`bg-kliyvo-gray rounded-xl overflow-hidden border transition-all group cursor-pointer flex h-[140px] shadow-lg ${
                    compareIds.includes(prop.id) ? 'border-electric-lime bg-electric-lime/5' : 'border-white/5 hover:border-electric-lime/40 hover:-translate-y-1'
                  }`}
                >
                  <div className="w-2/5 bg-kliyvo-dark relative overflow-hidden">
                    {prop.thumbnail ? (
                      <img src={prop.thumbnail} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-700 font-medium text-xs">No Image</div>
                    )}
                    
                    <button 
                      onClick={(e) => toggleCompare(prop.id, e)}
                      className={`absolute top-2 right-2 p-1.5 rounded-md transition-colors backdrop-blur-sm z-10 border ${
                        compareIds.includes(prop.id)
                          ? 'bg-electric-lime text-black border-electric-lime'
                          : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
                      }`}
                      title="Compare"
                    >
                      {compareIds.includes(prop.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(prop.id);
                      }}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm z-10"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          isFavorited(prop.id) 
                            ? "fill-electric-lime text-electric-lime" 
                            : "text-white"
                        }`} 
                      />
                    </button>
                  </div>
                  <div className="w-3/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="text-electric-lime font-bold text-xl tracking-tight leading-none">
                          ${Number(prop.price).toLocaleString()}
                        </div>
                        <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded uppercase font-bold tracking-widest">{prop.listing_type}</span>
                      </div>
                      <h3 className="text-white font-bold font-display leading-tight mt-2 line-clamp-2 text-sm">{prop.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <span>{prop.rooms} Beds</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span>{prop.bathrooms} Baths</span>
                      {prop.area_sqm && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span>{prop.area_sqm} m²</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-kliyvo-dark relative z-0 h-[400px] md:h-auto border-t md:border-t-0 border-white/10 shadow-inner">
        <PropertyMap 
          properties={properties || []} 
          center={[(searchParams as any).lat, (searchParams as any).lng]} 
          radius={(searchParams as any).radius} 
          onSelectProperty={onSelectProperty}
        />
      </div>

      {/* Floating Compare Bar */}
      {compareIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl z-20 animate-in slide-in-from-bottom-10 fade-in">
           <div className="flex -space-x-3">
             {propertiesToCompare.map((p: any) => (
               <div key={p.id} className="w-10 h-10 rounded-full border-2 border-black bg-kliyvo-dark overflow-hidden">
                 {p.thumbnail ? (
                   <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-zinc-800" />
                 )}
               </div>
             ))}
           </div>
           
           <div className="text-white font-medium text-sm">
             <span className="font-bold text-electric-lime">{compareIds.length}</span>/3 Selected
           </div>

           <div className="flex gap-2">
             <button 
                onClick={() => setCompareIds([])}
                className="text-xs text-gray-400 hover:text-white font-bold px-3 py-2"
             >
               Clear
             </button>
             <button 
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-electric-lime text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-white transition-colors"
                disabled={compareIds.length < 2}
             >
               Compare
             </button>
           </div>
        </div>
      )}

      {/* Compare Modal */}
      <ComparisonModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        properties={propertiesToCompare}
      />
    </div>
  );
}
