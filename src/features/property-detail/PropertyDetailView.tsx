import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MapPin, Share2, Phone, TrendingUp, TrendingDown, Minus, CheckCircle, Heart, Mail } from 'lucide-react';
import { MortgageCalculator } from '../../components/properties/MortgageCalculator';
import { useFavorites } from '../../hooks/useFavorites';
import { ContactAgentModal } from '../../components/properties/ContactAgentModal';

export function PropertyDetailView({ propertyId, onBack }: { propertyId: string, onBack: () => void }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${propertyId}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    }
  });

  // Basic SEO meta update
  useEffect(() => {
    if (property) {
      document.title = `${property.title} | KLIYVO`;
    } else {
      document.title = 'Loading... | KLIYVO';
    }
    return () => {
      document.title = 'KLIYVO | Real Estate Ecosystem';
    };
  }, [property]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-electric-lime border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl text-white font-bold mb-4">Property not found</h2>
        <button onClick={onBack} className="text-electric-lime hover:underline">Go back</button>
      </div>
    );
  }

  const getKlyvoScoreBadge = (score: string) => {
    switch (score) {
      case 'Underpriced':
        return <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold tracking-wide"><TrendingDown className="w-4 h-4" /> Opportunity: Underpriced</div>;
      case 'Overpriced':
        return <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold tracking-wide"><TrendingUp className="w-4 h-4" /> Overpriced</div>;
      default:
        return <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/20 border border-gray-500/30 text-gray-300 text-sm font-bold tracking-wide"><Minus className="w-4 h-4" /> Fair Value</div>;
    }
  };

  const images = property.images || [];
  const heroImage = images.length > 0 ? images[0].url : null;
  const phoneNumber = property.agent_phone || '593999999999';
  const waMessage = encodeURIComponent(`Hi ${property.agent_name || 'Agent'}, I'm interested in the property "${property.title}" listed on KLYVO for $${property.price}.`);
  const waLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${waMessage}`;

  return (
    <div className="h-full w-full overflow-y-auto bg-kliyvo-black">
      {/* Top Nav */}
      <div className="sticky top-0 z-20 bg-kliyvo-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back to Map</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleFavorite(propertyId)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorited(propertyId) ? "fill-electric-lime text-electric-lime" : ""}`} />
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Media & Info */}
        <div className="flex-1 space-y-8">
          
          {/* Images */}
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-kliyvo-dark">
            {heroImage ? (
              <img src={heroImage} alt="Property" className="w-full h-[400px] md:h-[500px] object-cover" />
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-gray-600 font-medium">No Image Available</div>
            )}
            
            {images.length > 1 && (
              <div className="flex p-2 gap-2 overflow-x-auto scrollbar-hide bg-kliyvo-gray">
                {images.slice(1).map((img: any, i: number) => (
                  <img key={i} src={img.url} className="w-24 h-24 object-cover rounded-lg shrink-0 cursor-pointer hover:opacity-80 transition-opacity" />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded uppercase font-bold tracking-widest leading-none flex items-center h-[20px]">{property.listing_type}</span>
                  {property.is_verified && <span className="text-[10px] bg-electric-lime/10 text-electric-lime border border-electric-lime/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest leading-none flex items-center gap-1 h-[20px]"><CheckCircle className="w-3 h-3" /> Verified</span>}
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {property.neighborhood}, {property.city}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl md:text-5xl font-display font-bold text-electric-lime tracking-tight">
                  ${Number(property.price).toLocaleString()}
                </div>
                {property.area_sqm > 0 && (
                  <div className="text-gray-400 text-sm mt-1">
                    ${(Number(property.price) / Number(property.area_sqm)).toLocaleString(undefined, {maximumFractionDigits: 0})} / m²
                  </div>
                )}
              </div>
            </div>

            <div className="py-6 border-y border-white/5 flex gap-8">
              <div>
                <div className="text-2xl font-bold text-white">{property.rooms}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Rooms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{property.bathrooms}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Bathrooms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{property.area_sqm || '--'}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Square Meters</div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-display font-bold text-white mb-4">The Klyvo Score</h2>
              <div className="flex items-start gap-6 p-6 bg-kliyvo-gray border border-white/5 rounded-2xl">
                <div>
                  {getKlyvoScoreBadge(property.klyvoScore)}
                </div>
                <div className="text-sm text-gray-400 leading-relaxed font-sans mt-0.5">
                  Our advanced geospatial models compare this property's price per square meter against live neighborhood averages. 
                  {property.klyvoScore === 'Underpriced' && " This listing falls below the median, indicating a strong buying opportunity."}
                  {property.klyvoScore === 'Overpriced' && " This listing exceeds the neighborhood median."}
                  {property.klyvoScore === 'Fair Value' && " This listing aligns with the current market median for its location."}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-display font-bold text-white mb-4">Description</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {property.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Tools */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          
          {/* Agent Card */}
          <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-light/5 pb-2">Listed By</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-kliyvo-dark rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                {property.agent_avatar ? (
                   <img src={property.agent_avatar} alt="Agent" className="w-full h-full object-cover" />
                ) : (
                   <span className="text-gray-500 font-bold">{property.agent_name?.charAt(0) || 'A'}</span>
                )}
              </div>
              <div>
                <div className="text-white font-bold">{property.agent_name || "Verified Agent"}</div>
                <div className="text-xs text-electric-lime font-medium mt-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> KLYVO Verified
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full bg-electric-lime hover:bg-white text-black font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Mail className="w-5 h-5 fill-current" />
                Contact via Email
              </button>
              <a 
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-5 h-5 fill-current" />
                WhatsApp Message
              </a>
            </div>
          </div>

          {/* Mortgage Calculator */}
          <MortgageCalculator price={Number(property.price)} />

        </div>
      </div>
      
      <ContactAgentModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        agentName={property.agent_name || 'Verified Agent'} 
        propertyTitle={property.title} 
      />
    </div>
  );
}
