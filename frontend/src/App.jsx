import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Video, Type, Image as LucideImage, Brain, BarChart, Users, Zap, ShieldAlert } from 'lucide-react';

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await axios.post('http://localhost:8000/analyze', { url });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze video. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 30) return 'text-green-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-red-500';
  };
  
  const getScoreLabel = (score) => {
    if (score < 30) return 'Trustworthy';
    if (score < 70) return 'Skeptical';
    return 'Clickbait';
  };

  // Helper to format duration
  const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
  };

  // Helper to format views
  const formatViews = (views) => {
      if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
      if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
      return views;
  };

  const isClickbait = result?.clickbait_score > 50;

  return (
    <div className={`min-h-screen text-white overflow-hidden transition-colors duration-1000 ${result ? (isClickbait ? 'bg-red-950/20' : 'bg-green-950/20') : ''}`}>
      
      {/* Dynamic Background Flash */}
      <AnimatePresence>
        {result && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 pointer-events-none z-0 ${isClickbait ? 'bg-red-600' : 'bg-green-600'} mix-blend-overlay`}
            />
        )}
      </AnimatePresence>

      {/* Navbar / Header */}
      <nav className="fixed w-full z-50 p-6 backdrop-blur-sm bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Brain className="w-8 h-8 text-amber-500" />
             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-400 to-purple-400">
               Clickbait Hunter
             </span>
           </div>
           <div className="text-sm text-slate-400 font-medium tracking-wider hidden md:block">
             AI POWERED CONTENT VERIFICATION
           </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-24 relative z-10">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-12">
          
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
             <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold leading-tight">
               Is that video <br />
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-400 to-violet-400">
                 Really Worth Watching?
               </span>
             </motion.h1>
             <motion.p variants={fadeIn} className="text-xl text-slate-300">
               Stop wasting time on misleading content. Use AI to analyze video audio vs thumbnails instantly.
             </motion.p>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-2xl z-10"
          >
            <div className={`glass-card p-2 md:p-3 relative group focus-within:ring-2 focus-within:ring-amber-500/50 transition-all duration-300`}>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-amber-500 opacity-20 group-hover:opacity-30 rounded-2xl blur transition-opacity"></div>
              <form onSubmit={handleAnalyze} className="relative flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Paste YouTube Video URL..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none text-white placeholder-slate-500 focus:bg-black/60 transition-colors"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Analyze Now <Zap className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center gap-2 text-sm font-medium backdrop-blur-md">
                <ShieldAlert className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* RESULTS SECTION */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* VIDEO METADATA ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="glass-card p-4 flex items-center gap-4 border border-white/5">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Users size={20} /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Uploader</div>
                        <div className="text-lg font-medium truncate">{result.metadata?.uploader || 'Unknown'}</div>
                    </div>
                 </div>
                 <div className="glass-card p-4 flex items-center gap-4 border border-white/5">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><BarChart size={20} /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Views</div>
                        <div className="text-lg font-medium">{formatViews(result.metadata?.view_count || 0)}</div>
                    </div>
                 </div>
                 <div className="glass-card p-4 flex items-center gap-4 border border-white/5">
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Zap size={20} /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Duration</div>
                        <div className="text-lg font-medium">{formatDuration(result.metadata?.duration || 0)}</div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Analysis */}
                <div className="glass-card p-6 space-y-6 hover:bg-white/10 transition-colors text-left">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-300">
                    <LucideImage className="w-5 h-5" /> Visual Analysis
                  </h3>
                   <div className="space-y-4">
                     <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">DETECTED TEXT</span>
                        <p className="text-white mt-2 font-medium leading-relaxed">{result.thumbnail_text || "No text detected in thumbnail."}</p>
                     </div>
                     <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">OBJECTS IDENTIFIED</span>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {result.detected_objects.length > 0 ? (
                            result.detected_objects.map((obj, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-bold rounded-lg border border-blue-500/30 uppercase tracking-wider">
                                {obj}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic text-sm">None detected</span>
                          )}
                        </div>
                     </div>
                   </div>
                </div>

                {/* Score Card */}
                <div className={`glass-card p-1 relative overflow-hidden group transition-all duration-500 ${isClickbait ? 'shadow-[0_0_50px_-12px_rgba(220,38,38,0.5)]' : 'shadow-[0_0_50px_-12px_rgba(22,163,74,0.5)]'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-b ${isClickbait ? 'from-red-600/20' : 'from-green-600/20'} to-transparent opacity-50`}></div>
                  
                  {/* POP Effect Ring */}
                  {result && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full ${isClickbait ? 'bg-red-500/20' : 'bg-green-500/20'}`}
                      />
                  )}

                  <div className="relative bg-black/40 h-full w-full rounded-xl p-8 flex flex-col items-center text-center justify-center z-10">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Clickbait Probability</span>
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className={`text-8xl font-black mb-4 ${getScoreColor(result.clickbait_score)} drop-shadow-2xl`}
                    >
                      {result.clickbait_score}<span className="text-4xl">%</span>
                    </motion.div>
                    <div className={`text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider bg-white/5 border border-white/10 ${getScoreColor(result.clickbait_score)}`}>
                      {getScoreLabel(result.clickbait_score)}
                    </div>
                    <p className="mt-8 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-6 w-full">
                      {result.reasoning}
                    </p>
                  </div>
                </div>

                {/* Content Analysis */}
                <div className="glass-card p-6 space-y-4 hover:bg-white/10 transition-colors text-left">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-300">
                    <Video className="w-5 h-5" /> Content Reality
                  </h3>
                   <div className="space-y-4">
                     <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">TRANSCRIPT SUMMARY</span>
                        <p className="text-slate-300 mt-2 text-sm leading-loose opacity-80">
                          {result.transcript_preview}
                        </p>
                     </div>

                     {/* KEYWORD STATS */}
                     <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">KEYWORD MATCH</span>
                            <span className={`text-xs font-bold ${result.keyword_stats?.matches === result.keyword_stats?.total_keywords ? 'text-green-400' : 'text-amber-400'}`}>
                                {result.keyword_stats?.matches} / {result.keyword_stats?.total_keywords}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div 
                                className={`h-1.5 rounded-full ${isClickbait ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${(result.keyword_stats?.matches / (result.keyword_stats?.total_keywords || 1)) * 100}%` }}
                            ></div>
                        </div>
                     </div>
                     
                     {result.missing_keywords && result.missing_keywords.length > 0 && (
                        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                           <span className="text-[10px] text-red-300 uppercase tracking-widest font-bold flex items-center gap-2">
                             <AlertTriangle className="w-3 h-3" /> MISSING PROMISES
                           </span>
                           <div className="flex flex-wrap gap-2 mt-3">
                              {result.missing_keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1 bg-red-500/20 text-red-200 text-xs font-bold rounded-lg border border-red-500/30 uppercase tracking-wider">
                                  {kw}
                                </span>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* GLOBAL STATS SECTION */}
      <section className="relative z-10 py-24 bg-black/20 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-500">
               The Clickbait Epidemic
             </h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-lg">
               Analyzing the hidden cost of the attention economy on a global scale.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             
             {/* Stat Card 1 */}
             <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">User Impact</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">-23%</div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Trust Erosion</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   Channels relying on misleading thumbnails see a <span className="text-indigo-300">23% annual drop</span> in long-term subscriber retention compared to honest creators.
                </p>
             </div>

             {/* Stat Card 2 */}
             <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-500/20 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
                        <BarChart size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Content Flood</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">500 hrs</div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Uploaded Per Minute</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   With over <span className="text-red-300">500 hours of video</span> uploaded every minute, extreme titles have become the only way to stand out in the algorithm.
                </p>
             </div>

             {/* Stat Card 3 */}
             <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                        <Brain size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cognitive Load</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">8.25s</div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Attention Span</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   The average human attention span has dropped from 12 seconds (in 2000) to <span className="text-amber-300">8.25 seconds</span>, largely driven by short-form clickbait.
                </p>
             </div>

             {/* Stat Card 4 */}
             <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">15 min</div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Wasted Daily</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   Average users spend <span className="text-emerald-300">15 minutes a day</span> watching content that doesn't align with the video's initial promise or thumbnail.
                </p>
             </div>

             {/* Stat Card 5 */}
             <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Misinformation</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">60%</div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Share w/o Reading</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   Studies show that <span className="text-purple-300">60% of links</span> are shared on social media based on the headline/thumbnail alone, without consumption.
                </p>
             </div>

             {/* Stat Card 6 */}
             <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
                        <LucideImage size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visual Deception</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">~90%</div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Enhanced Faces</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   About <span className="text-pink-300">90% of top trending</span> thumbnails feature faces with exaggerated emotions to exploit biological engagement reflexes.
                </p>
             </div>

          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/20 text-center relative z-10">
         <p className="text-slate-500 text-sm">© 2025 Clickbait Hunter AI. Building a more honest internet.</p>
      </footer>
    </div>
  );
}

export default App;
