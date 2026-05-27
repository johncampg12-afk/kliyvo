import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Key, BadgeDollarSign } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

export function LandingView() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to discover
    navigate('/discover');
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar relative w-full h-full bg-kliyvo-black text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-32 md:py-48 flex flex-col items-center justify-center min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ 
             backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80")',
          }}
        />
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-lime/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-kliyvo-black/60 to-kliyvo-black/90" />
        
        <div className="relative z-10 text-center w-full max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-8 tracking-tighter drop-shadow-md">
            Agents. Tours. Loans. <span className="text-electric-lime italic">Homes.</span>
          </h1>
          
          <form 
            onSubmit={handleSearch}
            className="w-full max-w-2xl bg-kliyvo-gray border border-white/10 rounded-xl p-2 flex items-center shadow-2xl transition-shadow backdrop-blur-md"
          >
            <input 
              type="text"
              placeholder="Search in Quito, Guayaquil, Cuenca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-lg outline-none bg-transparent text-white placeholder-gray-500 font-medium"
            />
            <button 
              type="submit"
              className="bg-electric-lime hover:bg-white text-kliyvo-black rounded-lg p-3 transition-colors flex items-center justify-center font-bold"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>
          </form>
        </div>
      </section>

      {/* Cards Section */}
      <section className="px-6 py-24 bg-kliyvo-black relative border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">See how Kliyvo can help</h2>
          <div className="w-24 h-1 bg-electric-lime mx-auto mt-6 rounded-full opacity-50" />
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
          {/* Buy Card */}
          <div className="bg-kliyvo-gray rounded-2xl shadow-xl hover:-translate-y-2 transition-transform p-10 flex flex-col items-center text-center border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-24 h-24 mb-8 bg-white/5 rounded-2xl flex items-center justify-center p-4">
              <img src="https://www.zillowstatic.com/bedrock/app/uploads/sites/5/2024/04/Buy_a_home.webp" alt="Buy a home" className="w-full h-full object-contain filter brightness-200" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white mb-4">Buy a home</h3>
            <p className="text-gray-400 mb-8 flex-1 font-medium leading-relaxed">
              Find your place with an immersive photo experience and the most listings, including things you won't find anywhere else.
            </p>
            <Link 
              to="/discover?type=sale"
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white hover:text-black transition-colors w-full z-10 relative"
            >
              Browse homes
            </Link>
          </div>
          
          {/* Rent Card */}
          <div className="bg-kliyvo-gray rounded-2xl shadow-xl hover:-translate-y-2 transition-transform p-10 flex flex-col items-center text-center border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-electric-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-24 h-24 mb-8 bg-electric-lime/10 rounded-2xl flex items-center justify-center p-4">
              <img src="https://www.zillowstatic.com/bedrock/app/uploads/sites/5/2024/04/Rent_a_home.webp" alt="Rent a home" className="w-full h-full object-contain filter brightness-200 hue-rotate-180 sepia-0" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white mb-4">Rent a home</h3>
            <p className="text-gray-400 mb-8 flex-1 font-medium leading-relaxed">
              We're creating a seamless online experience – from shopping on the largest rental network, to applying, to paying rent.
            </p>
            <Link 
              to="/discover?type=rent"
              className="px-8 py-3 bg-electric-lime text-black rounded-lg font-bold hover:bg-white transition-colors w-full z-10 relative"
            >
              Find rentals
            </Link>
          </div>
          
          {/* Sell Card */}
          <div className="bg-kliyvo-gray rounded-2xl shadow-xl hover:-translate-y-2 transition-transform p-10 flex flex-col items-center text-center border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-24 h-24 mb-8 bg-white/5 rounded-2xl flex items-center justify-center p-4">
              <img src="https://www.zillowstatic.com/bedrock/app/uploads/sites/5/2024/04/Sell_a_home.webp" alt="Sell a home" className="w-full h-full object-contain filter brightness-200" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white mb-4">Sell a home</h3>
            <p className="text-gray-400 mb-8 flex-1 font-medium leading-relaxed">
              No matter what path you take to sell your home, we can help you navigate a successful sale.
            </p>
            <Link 
              to="/publish"
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white hover:text-black transition-colors w-full z-10 relative"
            >
              See options
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Cities / Trending */}
      <section className="px-6 py-24 bg-kliyvo-black relative border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center mb-16">
           <h2 className="text-4xl font-display font-bold text-white tracking-tight">Trending Locations</h2>
           <div className="w-24 h-1 bg-electric-lime mx-auto mt-6 rounded-full opacity-50" />
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { name: 'Quito', img: 'https://images.unsplash.com/photo-1583295125721-766a0088cb3f?auto=format&fit=crop&q=80', properties: '1,245' },
             { name: 'Guayaquil', img: 'https://images.unsplash.com/photo-1619441207978-3c420216dcad?auto=format&fit=crop&q=80', properties: '850' },
             { name: 'Cuenca', img: 'https://images.unsplash.com/photo-1533282928373-cdaeb07c5b6b?auto=format&fit=crop&q=80', properties: '620' },
             { name: 'Manta', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80', properties: '430' }
           ].map((city) => (
              <div key={city.name} className="relative rounded-2xl overflow-hidden group cursor-pointer h-64">
                 <img src={city.img} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                 <div className="absolute bottom-6 left-6 relative z-10 text-left">
                    <h3 className="text-2xl font-bold font-display text-white mb-1">{city.name}</h3>
                    <p className="text-electric-lime font-medium text-sm">{city.properties} properties</p>
                 </div>
              </div>
           ))}
        </div>
      </section>

      {/* Stats/ CTA */}
      <section className="px-6 py-24 bg-electric-lime border-t border-white/5">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
               <h2 className="text-4xl md:text-5xl font-display font-bold text-kliyvo-black tracking-tight leading-tight mb-6">
                  Ready to find your <br/>dream home?
               </h2>
               <p className="text-lg text-kliyvo-black/80 font-medium mb-8 max-w-md">
                  Join thousands of Ecuadorians who have found their perfect place to live using our advanced discovery platform.
               </p>
               <div className="flex gap-4">
                  <Link to="/discover" className="bg-kliyvo-black text-white px-8 py-3 rounded-lg font-bold hover:bg-black/80 transition-colors">
                     Start Searching
                  </Link>
                  <Link to="/publish" className="bg-transparent border border-kliyvo-black/20 text-kliyvo-black px-8 py-3 rounded-lg font-bold hover:bg-kliyvo-black/10 transition-colors">
                     List Property
                  </Link>
               </div>
            </div>
            <div className="md:w-1/2 flex gap-8">
               <div className="flex flex-col gap-8 mt-12">
                  <div className="bg-white/20 p-8 rounded-2xl backdrop-blur-sm border border-kliyvo-black/5">
                     <h3 className="text-4xl font-bold font-display text-kliyvo-black mb-2">1M+</h3>
                     <p className="text-kliyvo-black/80 font-medium">Active Listings</p>
                  </div>
                  <div className="bg-white/20 p-8 rounded-2xl backdrop-blur-sm border border-kliyvo-black/5">
                     <h3 className="text-4xl font-bold font-display text-kliyvo-black mb-2">50k+</h3>
                     <p className="text-kliyvo-black/80 font-medium">Verified Agents</p>
                  </div>
               </div>
               <div className="flex flex-col gap-8">
                  <div className="bg-white/20 p-8 rounded-2xl backdrop-blur-sm border border-kliyvo-black/5">
                     <h3 className="text-4xl font-bold font-display text-kliyvo-black mb-2">98%</h3>
                     <p className="text-kliyvo-black/80 font-medium">Customer Satisfaction</p>
                  </div>
                  <div className="bg-kliyvo-black p-8 rounded-2xl text-white shadow-2xl">
                     <BadgeDollarSign className="w-12 h-12 text-electric-lime mb-4" />
                     <h3 className="text-xl font-bold font-display mb-2">Best Prices</h3>
                     <p className="text-gray-400 font-medium text-sm">Direct agent deals, no hidden fees.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-kliyvo-gray px-6 py-16 border-t border-white/5 text-center flex flex-col items-center">
        <span className="text-3xl font-display font-bold tracking-tighter text-white mb-4">
          KLIYVO<span className="text-electric-lime">.</span>
        </span>
        <p className="text-gray-500 text-sm font-medium">© {new Date().getFullYear()} Kliyvo Properties. Designed for clarity.</p>
      </footer>
    </div>
  );
}
