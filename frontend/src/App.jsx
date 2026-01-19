import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom' // <--- IMPORTANTE
import Iridescence from './components/Iridescence'
import BlurText from './components/BlurText'

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = type === 'success' ? 'bg-emerald-900/90 border-emerald-500' : 'bg-red-900/90 border-red-500';
  const icon = type === 'success' ? 'check_circle' : 'error';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-8 right-8 z-[110] flex items-center gap-3 px-6 py-4 rounded-xl border ${bgColors} backdrop-blur-md shadow-2xl text-white`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-bold text-sm">{message}</span>
    </motion.div>
  );
};

const AnimatedSubscribeButton = ({ onClick, loading, status }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={loading || status === 'success'}
      className={`relative w-full overflow-hidden font-bold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group
        ${status === 'success' ? 'bg-emerald-600 text-white cursor-default' : 'bg-white text-black hover:bg-emerald-400 hover:text-white'}
      `}
    >
      <AnimatePresence mode='wait'>
        {loading ? (
           <motion.div 
             key="loading"
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: 50, opacity: 0 }}
             className="flex items-center gap-2"
           >
             <motion.span 
               animate={{ x: [0, 100], y: [0, -50], opacity: [1, 0] }}
               transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
               className="material-symbols-outlined"
             >
               send
             </motion.span>
             <span>Enviando...</span>
           </motion.div>
        ) : status === 'success' ? (
           <motion.div 
             key="success"
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="flex items-center gap-2"
           >
             <span className="material-symbols-outlined">check</span>
             <span>¡Suscrito!</span>
           </motion.div>
        ) : (
           <motion.div 
             key="idle"
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -20, opacity: 0 }}
             className="flex items-center gap-2"
           >
             <span>Suscribirme</span>
             <span className="material-symbols-outlined text-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
           </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

const NewsSkeleton = () => (
  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-[280px] animate-pulse flex flex-col justify-between">
    <div>
      <div className="h-3 w-20 bg-white/10 rounded mb-4"></div>
      <div className="h-6 w-full bg-white/10 rounded mb-2"></div>
      <div className="h-6 w-2/3 bg-white/10 rounded mb-4"></div>
      <div className="h-3 w-full bg-white/5 rounded mb-1"></div>
      <div className="h-3 w-full bg-white/5 rounded mb-1"></div>
    </div>
    <div className="h-3 w-24 bg-white/10 rounded"></div>
  </div>
)


const Navbar = ({ menuAbierto, setMenuAbierto }) => { 
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 w-full z-[80] px-6 py-6 pointer-events-none">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            
            <div className="pointer-events-auto">
              {isHome ? (
                <div 
                   className="bg-black/40 backdrop-blur-md rounded-full p-2 pr-5 flex items-center gap-3 border border-white/30 shadow-lg cursor-pointer hover:bg-black/60 transition-all" 
                   onClick={() => {
                     const element = document.getElementById('top');
                     if(element) element.scrollIntoView({ behavior: 'smooth' });
                   }}
                >
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img src="/botbi.jpg" alt="Botbi Logo" className="w-full h-full object-cover" />
                   </div>
                   <span className="font-display font-bold text-white tracking-tight">Botbi news</span>
                </div>
              ) : (
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/10 group transition-all"
                >
                   <span className="material-symbols-outlined text-2xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                </button>
              )}
            </div>

            <button 
              onClick={() => setMenuAbierto(!menuAbierto)} 
              className="pointer-events-auto w-14 h-14 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-lg hover:bg-white hover:text-black active:scale-95 transition-all duration-300 z-[80]"
              aria-label="Alternar menú"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuAbierto ? 'close' : 'menu'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                  className="material-symbols-outlined text-3xl"
                >
                  {menuAbierto ? 'close' : 'menu'}
                </motion.span>
              </AnimatePresence>
            </button>
        </div>
    </header>
  );
};

const VistaNoticia = () => {
    const location = useLocation();
    const noticia = location.state?.noticia;

    if (!noticia) return <Navigate to="/" replace />;

    return (
        <div className="pt-36 pb-20 px-6 min-h-screen relative z-10 max-w-4xl mx-auto">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f1214]/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
             >
                {/* Header Decorativo */}
                <div className="h-48 bg-gradient-to-r from-slate-900 via-slate-800 to-black relative flex items-end p-8">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <span className="relative z-10 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        {noticia.categoria}
                    </span>
                </div>

                <div className="p-8 md:p-12">
                    <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-8 leading-tight">
                        {noticia.titulo}
                    </h1>

                    {/* Bloque IA */}
                    <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-cyan-500"></div>
                        <h3 className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-bold mb-4 text-sm uppercase tracking-wider">
                            <span className="material-symbols-outlined text-lg text-emerald-400">psychology</span>
                            Análisis Botbi AI
                        </h3>
                        <p className="text-lg text-slate-300 leading-relaxed font-light">
                            {noticia.contenido_ia}
                        </p>
                    </div>

                    {/* Texto original */}
                    <div className="prose prose-invert prose-lg max-w-none text-slate-400 mb-12">
                        <p>{noticia.contenido_original ? noticia.contenido_original.substring(0, 400) : "Contenido no disponible"}...</p>
                        <p className="italic text-sm mt-8 text-slate-600 border-t border-white/5 pt-4">
                            *Este resumen fue generado automáticamente por inteligencia artificial analizando la fuente original.
                        </p>
                    </div>

                    {/* Botón Fuente */}
                    <div className="flex justify-center md:justify-start">
                        <a 
                            href={noticia.source_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full md:w-auto bg-white text-black font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 hover:text-white hover:scale-105 transition-all shadow-lg"
                        >
                            Leer artículo completo
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                    </div>
                </div>
             </motion.div>
        </div>
    );
};

const HomeFeed = ({ noticias, mercados, cargandoDatos }) => {
    const navigate = useNavigate();

    const abrirNoticia = (noticia) => {
        navigate('/noticia', { state: { noticia } });
    };

    const noticiasTech = noticias.filter(n => n.categoria === 'Tecnología');
    const techHero = noticiasTech[0]; 
    const techRestantes = noticiasTech.slice(1, 9);

    const noticiasNegocios = noticias.filter(n => 
        n.categoria === 'Negocios' || n.categoria === 'Economía' || n.categoria === 'Mercados'
    );
    const businessHero = noticiasNegocios[0]; 
    const businessRestantes = noticiasNegocios.slice(1, 9); 

    return (
        <main className="pt-36 pb-20 max-w-[1440px] mx-auto px-6">
            
            <div className="flex flex-col items-center justify-center mb-12 w-full px-2">
                <BlurText
                    text="Donde el mundo sucede."
                    delay={50}
                    animateBy="words" 
                    direction="top"
                    className="text-3xl md:text-5xl font-bold text-slate-200 mb-2 tracking-tight text-center"
                />
                <BlurText
                    text="Botbi news."
                    delay={400}
                    animateBy="letters"
                    direction="bottom"
                    className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tighter text-center"
                />
            </div>
            
            {/* Seccion tecnología */}
            <section id="seccion-tecnologia" className="mb-24">
              <div className="flex items-center gap-4 mb-8 opacity-80">
                <h2 className="font-display font-bold text-2xl text-white tracking-widest uppercase">Tecnología</h2>
                <div className="h-px bg-white/20 flex-1"></div>
              </div>
              
              {cargandoDatos ? (
                 <div className="w-full h-[500px] bg-white/5 rounded-2xl animate-pulse mb-6"></div>
              ) : techHero && (
                <div 
                    onClick={() => abrirNoticia(techHero)} 
                    className="mb-6 relative rounded-2xl overflow-hidden group bento-card border-none h-[500px] cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-20 max-w-4xl">
                        <span className="bg-primary/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest mb-4 inline-block border border-white/10">
                          {techHero.categoria}
                        </span>
                        <h3 className="font-display font-bold text-3xl md:text-5xl text-white mb-6 leading-tight drop-shadow-lg">
                          {techHero.titulo}
                        </h3>
                        <p className="text-slate-300 mb-8 text-lg leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md">
                          {techHero.contenido_ia}
                        </p>
                        <button className="bg-white text-black font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                          Leer noticia <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                    </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cargandoDatos 
                   ? [...Array(4)].map((_, i) => <NewsSkeleton key={i} />)
                   : techRestantes.map((noticia, idx) => (
                  <div 
                      key={idx} 
                      className="bento-card rounded-2xl p-6 flex flex-col justify-between h-[280px] group cursor-pointer" 
                      onClick={() => abrirNoticia(noticia)} 
                  >
                      <div>
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3 block opacity-80">{noticia.categoria}</span>
                        <h4 className="font-display font-bold text-lg text-white mb-3 line-clamp-3 group-hover:text-primary transition-colors leading-snug">
                          {noticia.titulo}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{noticia.contenido_ia}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-bold text-white uppercase tracking-wider">Leer más</span>
                         <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
                      </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Seccion negocios */}
            <section id="seccion-negocios" className="mb-24 scroll-mt-32">
              <div className="flex items-center gap-4 mb-8 opacity-80">
                <h2 className="font-display font-bold text-2xl text-white tracking-widest uppercase">Negocios</h2>
                <div className="h-px bg-white/20 flex-1"></div>
              </div>

              {cargandoDatos ? (
                 <div className="w-full h-[500px] bg-white/5 rounded-2xl animate-pulse mb-6"></div>
              ) : businessHero && (
                <div 
                    onClick={() => abrirNoticia(businessHero)} 
                    className="mb-6 relative rounded-2xl overflow-hidden group bento-card border-none h-[500px] cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-20 max-w-4xl">
                        <span className="bg-emerald-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest mb-4 inline-block border border-white/10">
                          {businessHero.categoria}
                        </span>
                        <h3 className="font-display font-bold text-3xl md:text-5xl text-white mb-6 leading-tight drop-shadow-lg">
                          {businessHero.titulo}
                        </h3>
                        <p className="text-slate-300 mb-8 text-lg leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md">
                          {businessHero.contenido_ia}
                        </p>
                        <button className="bg-white text-black font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                          Leer reporte <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                    </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cargandoDatos 
                   ? [...Array(4)].map((_, i) => <NewsSkeleton key={i} />)
                   : businessRestantes.map((noticia, idx) => (
                  <div 
                     key={idx} 
                     className="bento-card rounded-2xl p-6 flex flex-col justify-between h-[280px] group cursor-pointer" 
                     onClick={() => abrirNoticia(noticia)} 
                  >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mb-3 block opacity-80">{noticia.categoria}</span>
                        <h4 className="font-display font-bold text-lg text-white mb-3 line-clamp-3 group-hover:text-emerald-400 transition-colors leading-snug">
                          {noticia.titulo}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{noticia.contenido_ia}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-bold text-white uppercase tracking-wider">Leer más</span>
                         <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
                      </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Seccion mercados */}
            <section id="seccion-mercados" className="mb-20 scroll-mt-32">
              <div className="flex items-center gap-4 mb-8 opacity-80">
                <h2 className="font-display font-bold text-2xl text-white tracking-widest uppercase">Mercados</h2>
                <div className="h-px bg-white/20 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Acciones */}
                  <div className="bento-card rounded-2xl overflow-hidden min-h-[300px]">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="font-display font-bold text-white text-xl flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">show_chart</span> Acciones
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="text-slate-500 border-b border-white/5">
                                <th className="px-6 py-4 font-bold">Activo</th>
                                <th className="px-6 py-4 font-bold text-right">Precio</th>
                                <th className="px-6 py-4 font-bold text-right">Cambio</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {mercados.acciones.length > 0 ? mercados.acciones.map((acc, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-white font-bold">{acc.simbolo}</td>
                                    <td className="px-6 py-4 text-right font-display text-slate-200 text-lg font-mono tracking-tighter">${acc.precio}</td>
                                    <td className={`px-6 py-4 text-right font-bold font-mono ${acc.cambio >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {acc.cambio > 0 ? '+' : ''}{acc.cambio}%
                                    </td>
                                </tr>
                              )) : (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-white/10 rounded animate-pulse"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/10 rounded animate-pulse ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-10 bg-white/10 rounded animate-pulse ml-auto"></div></td>
                                    </tr>
                                ))
                              )}
                          </tbody>
                        </table>
                    </div>
                  </div>
                  
                  {/* Criptos */}
                  <div className="bento-card rounded-2xl overflow-hidden min-h-[300px]">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="font-display font-bold text-white text-xl flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">currency_bitcoin</span> Criptomonedas
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="text-slate-500 border-b border-white/5">
                                <th className="px-6 py-4 font-bold">Activo</th>
                                <th className="px-6 py-4 font-bold text-right">Precio</th>
                                <th className="px-6 py-4 font-bold text-right">Cambio</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {mercados.criptos.length > 0 ? mercados.criptos.map((cry, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-white font-bold">{cry.simbolo}</td>
                                    <td className="px-6 py-4 text-right font-display text-slate-200 text-lg font-mono tracking-tighter">
                                      {cry.precio > 10 ? `$${cry.precio.toLocaleString()}` : `$${cry.precio}`}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold font-mono ${cry.cambio >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {cry.cambio > 0 ? '+' : ''}{cry.cambio}%
                                    </td>
                                </tr>
                              )) : (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-white/10 rounded animate-pulse"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/10 rounded animate-pulse ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-10 bg-white/10 rounded animate-pulse ml-auto"></div></td>
                                    </tr>
                                ))
                              )}
                          </tbody>
                        </table>
                    </div>
                  </div>
              </div>
            </section>
        </main>
    );
}

function App() {
  const [noticias, setNoticias] = useState([])
  const [mercados, setMercados] = useState({ acciones: [], criptos: [] })
  const [emailUsuario, setEmailUsuario] = useState("")
  
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [modalNewsletter, setModalNewsletter] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(true) 
  
  const [toast, setToast] = useState(null)
  const [btnStatus, setBtnStatus] = useState('idle')

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  }

  //Apis para obtener los datos
  const obtenerDatos = async () => {
    setCargandoDatos(true)
    try {
      const config = { timeout: 8000 }; 
      const [resNoticias, resMercados] = await Promise.all([
        axios.get('https://botbi-hackathon.onrender.com/noticias', config),
        axios.get('https://botbi-hackathon.onrender.com/mercados', config)
      ])
      setNoticias(resNoticias.data)
      setMercados(resMercados.data)
    } catch (error) {
      console.error("Error cargando datos:", error)
      showToast("Error cargando noticias. Intenta recargar.", "error")
    } finally {
      setCargandoDatos(false)
    }
  }

  const sincronizarAhora = async () => {
    setMenuAbierto(false)
    setSincronizando(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      const res = await axios.post('https://botbi-hackathon.onrender.com/sincronizar-noticias')
      
      if(res.data.status === 'ok') {
        await obtenerDatos()
        showToast(`Sincronización completa. ${res.data.nuevas_noticias} noticias nuevas.`)
      }
    } catch (error) {
      showToast("Error al sincronizar con IA.", "error")
    }
    setSincronizando(false)
  }

  const enviarNewsletterBackend = async () => {
      if (!emailUsuario || !emailUsuario.includes('@')) {
          showToast("Por favor escribe un correo válido.", "error");
          return;
      }
      setBtnStatus('loading');
      try {
        const res = await axios.post('https://botbi-hackathon.onrender.com/enviar-newsletter', {
          email: emailUsuario
        });

        if (res.data.status === 'enviado') {
          setBtnStatus('success');
          showToast("¡Correo enviado exitosamente!", "success");
          setTimeout(() => {
             setModalNewsletter(false);
             setBtnStatus('idle');
             setEmailUsuario("");
          }, 2000);
        } else {
          setBtnStatus('error');
          showToast("Error: " + res.data.mensaje, "error");
          setTimeout(() => setBtnStatus('idle'), 2000);
        }
      } catch (error) {
        setBtnStatus('error');
        showToast("Error de conexión con el servidor.", "error");
        setTimeout(() => setBtnStatus('idle'), 2000);
      }
  }

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setModalNewsletter(false);
        setMenuAbierto(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => { obtenerDatos() }, [])

  const irASeccion = (id) => {
    setMenuAbierto(false)

    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen font-body text-slate-200 relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">

        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
          <Iridescence color={[0, 0.6, 0.8]} mouseReact={true} amplitude={0.1} speed={1.0} />
        </div>

        <Navbar 
            menuAbierto={menuAbierto}
            setMenuAbierto={setMenuAbierto} 
        />

        <div className="relative z-10 min-h-screen">
            <Routes>
                <Route path="/" element={<HomeFeed noticias={noticias} mercados={mercados} cargandoDatos={cargandoDatos} />} />
                <Route path="/noticia" element={<VistaNoticia />} />
            </Routes>
        </div>

        
        <AnimatePresence>
          {toast && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          )}
        </AnimatePresence>

        <div className={`fixed inset-0 z-[100] backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ${sincronizando ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <div className="relative">
              <div className="w-24 h-24 border-4 border-primary border-t-emerald-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white animate-pulse">smart_toy</span>
              </div>
           </div>
           <h2 className="mt-8 text-2xl font-display font-bold text-white animate-pulse">Sincronizando con IA...</h2>
           <p className="text-slate-400 mt-2">Analizando mercados y procesando noticias.</p>
        </div>

        <AnimatePresence>
        {modalNewsletter && (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalNewsletter(false)}></div>
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-[#0f1214] border border-white/10 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl shadow-emerald-500/10"
            >
               <button onClick={() => setModalNewsletter(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
               </button>
               <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 mx-auto">
                  <span className="material-symbols-outlined text-emerald-400 text-3xl">mail</span>
               </div>
               <h3 className="text-2xl font-display font-bold text-white text-center mb-2">Únete a Botbi News</h3>
               <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                 Recibe cada mañana el resumen de noticias seleccionado y analizado por nuestra Inteligencia Artificial.
               </p>
               <div className="space-y-4">
                  <input 
                      type="email" 
                      placeholder="tu@correo.com" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-600"
                      value={emailUsuario}
                      onChange={(e) => setEmailUsuario(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && enviarNewsletterBackend()}
                  />             
                  <AnimatedSubscribeButton 
                      onClick={enviarNewsletterBackend}
                      loading={btnStatus === 'loading'}
                      status={btnStatus}
                  />
               </div>
               <p className="text-center text-[10px] text-slate-600 mt-4">Sin spam. Date de baja cuando quieras.</p>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <div 
          className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${menuAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setMenuAbierto(false)}
        />
        <div className={`fixed top-0 right-0 h-full w-full md:w-1/4 min-w-[300px] bg-black/80 backdrop-blur-2xl border-l border-white/10 z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuAbierto ? 'translate-x-0' : 'translate-x-full'} flex flex-col p-8 shadow-2xl`}>
           <div className="mt-16 space-y-8">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4 opacity-70">Secciones</p>
                <nav className="flex flex-col gap-4 items-start">
                  <a href="/" onClick={() => setMenuAbierto(false)} className="group relative text-left text-2xl font-display font-bold text-white w-fit">
                      <span className="group-hover:text-primary transition-colors duration-300">Inicio</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  {['seccion-tecnologia', 'seccion-negocios', 'seccion-mercados'].map((id) => (
                      <a key={id} href={`/#${id}`} onClick={() => setMenuAbierto(false)} className="group relative text-left text-2xl font-display font-bold text-white w-fit cursor-pointer">
                          <span className="group-hover:text-primary transition-colors duration-300">{id.replace('seccion-', '').charAt(0).toUpperCase() + id.replace('seccion-', '').slice(1)}</span>
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      </a>
                  ))}
                </nav>
              </div>
              <div>
                 <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 opacity-70">Acciones</p>
                 <div className="space-y-3">
                   <button onClick={() => { setMenuAbierto(false); setModalNewsletter(true); }} className="w-full bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 transition-all group">
                      <span className="material-symbols-outlined text-emerald-400 group-hover:scale-110 transition-transform">mail</span>
                      <span className="text-white font-bold">Suscribirse al newsletter</span>
                   </button>
                   <button onClick={sincronizarAhora} className="w-full bg-primary/10 hover:bg-primary/30 border border-primary/30 p-4 rounded-xl flex items-center gap-3 transition-all group">
                      <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform duration-500">sync</span>
                      <span className="text-white font-bold">Actualizar noticias</span>
                   </button>
                 </div>
              </div>
              <div className="mt-auto bg-white/5 rounded-xl p-4 border border-white/30">
                 <p className="text-xs text-primary font-bold mb-2 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">smart_toy</span> ESTADO DEL SISTEMA
                 </p>
                 <p className="text-sm text-slate-400">
                   Botbi AI: <span className="text-emerald-400">En línea</span><br/>
                   <span className="text-white font-bold">{noticias.length} noticias</span> procesadas hoy.
                 </p>
              </div>
           </div>
        </div>

        <style>{`
          .bento-card { background: rgba(20, 20, 20, 0.6); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(20px); }
          .bento-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }
        `}</style>

      </div>
    </BrowserRouter>
  )
}

export default App