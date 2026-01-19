import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ setMenuAbierto }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const esVistaNoticia = location.pathname !== '/';

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center pointer-events-none">
      
      <div className="pointer-events-auto">
        {esVistaNoticia ? (
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#0f1214]/80 backdrop-blur-md border border-white/10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-white/10 hover:scale-110 transition-all group"
          >
            <span className="material-symbols-outlined text-slate-200 group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
          </button>
        ) : (
          <div className="bg-[#0f1214]/80 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-lg">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">
              <span className="material-symbols-outlined text-sm">bolt</span>
            </div>
            <span className="font-bold text-sm tracking-wide text-slate-200">Botbi news</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => setMenuAbierto(true)}
        className="pointer-events-auto bg-[#0f1214]/80 backdrop-blur-md border border-white/10 w-12 h-12 rounded-full flex items-center justify-center text-slate-200 shadow-lg hover:bg-white/10 hover:rotate-90 transition-all duration-300"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

    </header>
  );
};

export default Navbar;