import { useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VistaNoticia = () => {
  const location = useLocation();
  const noticia = location.state?.noticia;

  if (!noticia) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen relative z-10 max-w-4xl mx-auto">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f1214]/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative flex items-end p-8">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <span className="relative z-10 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {noticia.categoria}
            </span>
        </div>

        <div className="p-8 md:p-12">
            <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-8 leading-tight">
                {noticia.titulo}
            </h1>

            <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 text-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                    Análisis Botbi AI
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                    {noticia.contenido_ia}
                </p>
            </div>

            <div className="prose prose-invert prose-lg max-w-none text-slate-400 mb-12">
                <p>{noticia.contenido_original.substring(0, 300)}...</p>
                <p className="italic text-sm mt-4 text-slate-600">
                    *El contenido completo está disponible en la fuente original.
                </p>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="text-slate-500 text-sm">
                    Publicado: {new Date(noticia.fecha_publicacion).toLocaleDateString()}
                </span>
                
                <a 
                    href={noticia.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full md:w-auto bg-white text-black font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 hover:text-white hover:scale-105 transition-all shadow-lg"
                >
                    Leer en fuente original
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VistaNoticia;