import { useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';

export function PropertyUploadForm() {
  const [images, setImages] = useState<File[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImages(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-kliyvo-gray border border-white/5 shadow-2xl rounded-2xl overflow-hidden p-8 mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Publish a Property</h2>
        <p className="text-gray-400 font-sans text-sm">Upload stunning geospatial data to the KLIYVO network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Property Title</label>
            <input type="text" className="w-full bg-kliyvo-black border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-electric-lime/50 transition-colors" placeholder="e.g. Modern Neo-Loft in Cumbayá" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price (USD)</label>
              <input type="number" className="w-full bg-kliyvo-black border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-electric-lime/50 transition-colors" placeholder="250000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Area (sqm)</label>
              <input type="number" className="w-full bg-kliyvo-black border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-electric-lime/50 transition-colors" placeholder="120" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location Coordinates</label>
             <div className="grid grid-cols-2 gap-4">
              <input type="text" className="w-full bg-kliyvo-black border border-white/10 text-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="LAT: -0.1807" />
              <input type="text" className="w-full bg-kliyvo-black border border-white/10 text-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="LNG: -78.4678" />
             </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Media Pipeline</label>
          
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex-1 min-h-[240px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors ${isHovering ? 'border-electric-lime bg-electric-lime/5' : 'border-gray-600 hover:border-gray-500 bg-kliyvo-black'}`}
          >
            {images.length === 0 ? (
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-white font-medium text-sm mb-1">Drag and drop images here</p>
                <p className="text-gray-500 text-xs">JPEG, PNG or WEBP (Standard Cloudflare R2 ingestion)</p>
                
                <label className="mt-4 px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm font-medium cursor-pointer transition-colors">
                  Browse Files
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                  />
                </label>
              </div>
            ) : (
              <div className="w-full h-full p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative group bg-kliyvo-gray border border-white/5 rounded-lg overflow-hidden flex items-center p-2">
                       <span className="text-xs text-white truncate max-w-[80%] pl-2">{file.name}</span>
                       <button onClick={() => removeImage(idx)} className="absolute right-2 p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                  <span>{images.length} file(s) queued for pipeline</span>
                  <button className="text-electric-lime hover:underline" onClick={() => setImages([])}>Clear all</button>
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={images.length === 0 || uploadProgress > 0}
            onClick={() => {
              setUploadProgress(1);
              setTimeout(() => setUploadProgress(100), 1500); 
              setTimeout(() => {
                 setUploadProgress(0);
                 setImages([]);
                 alert('Property published with Sharp dimension optimization! (Mock)');
              }, 2000);
            }}
            className="w-full mt-6 bg-electric-lime text-kliyvo-black font-bold py-4 rounded-lg hover:bg-white transition-colors shadow-[0_0_20px_rgba(207,251,1,0.15)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            {uploadProgress > 0 ? (uploadProgress === 100 ? 'Published!' : 'Processing via Sharp...') : 'Verify & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
