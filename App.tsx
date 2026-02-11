import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Shield } from 'lucide-react';
import { db } from './services/db';
import { AuthState } from './types';
import clsx from 'clsx';

// Pages
import HeroSection from './components/HeroSection';
import EventsPage from './pages/Events';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TicketVerification from './pages/TicketVerification';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = ({ auth, onLogin, onLogout }: { auth: AuthState, onLogin: () => void, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={clsx(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
      scrolled ? "bg-slate-950/80 backdrop-blur-md border-white/10 py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter text-white font-orbitron">
          OK<span className="text-cyan-400">BASHI</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">HOME</Link>
          <Link to="/events" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">EVENTS</Link>
          <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">ABOUT</Link>
          <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">CONTACT</Link>
          
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-bold text-white flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
                <User className="w-4 h-4" /> Dashboard
              </Link>
              {auth.user?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-bold text-fuchsia-400 flex items-center gap-2 bg-fuchsia-500/10 px-4 py-2 rounded-full border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <button onClick={onLogout} className="text-xs text-slate-400 hover:text-white">Sign Out</button>
            </div>
          ) : (
            <button onClick={onLogin} className="text-sm font-bold bg-cyan-500 text-slate-950 px-6 py-2 rounded-full hover:bg-cyan-400 transition-colors">
              LOGIN
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-white/10 p-6 flex flex-col space-y-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-300">Home</Link>
          <Link to="/events" onClick={() => setIsOpen(false)} className="text-slate-300">Events</Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-300">Dashboard</Link>
          {auth.isAuthenticated ? (
            <button onClick={onLogout} className="text-left text-red-400">Sign Out</button>
          ) : (
            <button onClick={onLogin} className="text-left text-cyan-400 font-bold">Login</button>
          )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">OKLAHOMABASHI</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            A non-profit organization dedicated to preserving Bangladeshi heritage and promoting sports in Oklahoma City.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Departments</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="hover:text-cyan-400 cursor-pointer">OBCS (Culture)</li>
            <li className="hover:text-fuchsia-400 cursor-pointer">OBSS (Sports)</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="hover:text-white cursor-pointer"><Link to="/events">Events</Link></li>
            <li className="hover:text-white cursor-pointer"><Link to="/contact">Contact</Link></li>
            <li className="hover:text-white cursor-pointer">Donate</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Contact</h4>
          <p className="text-slate-400 text-sm">Oklahoma City, OK 73101</p>
          <p className="text-slate-400 text-sm">info@oklahomabashi.com</p>
        </div>
      </div>
      <div className="text-center text-slate-600 text-xs pt-8 border-t border-white/5">
        © 2024 Oklahomabashi. All rights reserved.
      </div>
    </div>
  </footer>
);

function App() {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });

  // Load user from session (simulated)
  useEffect(() => {
    const savedUser = localStorage.getItem('ob_user');
    if (savedUser) {
      setAuth({ user: JSON.parse(savedUser), isAuthenticated: true });
    }
  }, []);

  const handleLogin = () => {
    // Simulate login flow
    const email = prompt("Enter email (use 'admin' for admin role):", "user@test.com");
    if (email) {
      const user = db.login(email);
      if (user) {
        setAuth({ user, isAuthenticated: true });
        localStorage.setItem('ob_user', JSON.stringify(user));
      }
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('ob_user');
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar auth={auth} onLogin={handleLogin} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              {/* Highlights Section */}
              <section className="py-20 container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">DEPARTMENTS</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto rounded-full" />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-2xl glass border border-cyan-500/20 hover:border-cyan-500/50 transition-all group">
                    <h3 className="text-3xl font-bold text-cyan-400 mb-4">OBCS</h3>
                    <p className="text-slate-400 mb-6">The Cultural heartbeat. Celebrating Pohela Boishakh, Ekushey February, and promoting Bengali arts and music.</p>
                    <Link to="/events?filter=OBCS" className="text-white group-hover:text-cyan-400 font-bold flex items-center gap-2">Explore Culture <span className="text-xl">→</span></Link>
                  </div>
                  <div className="p-8 rounded-2xl glass border border-fuchsia-500/20 hover:border-fuchsia-500/50 transition-all group">
                    <h3 className="text-3xl font-bold text-fuchsia-400 mb-4">OBSS</h3>
                    <p className="text-slate-400 mb-6">The Spirit of Competition. Organizing Cricket tournaments, Soccer leagues, and community fitness challenges.</p>
                    <Link to="/events?filter=OBSS" className="text-white group-hover:text-fuchsia-400 font-bold flex items-center gap-2">Join League <span className="text-xl">→</span></Link>
                  </div>
                </div>
              </section>
            </>
          } />
          
          <Route path="/events" element={<EventsPage auth={auth} onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<UserDashboard auth={auth} />} />
          <Route path="/admin" element={<AdminDashboard auth={auth} />} />
          <Route path="/admin/verify" element={<TicketVerification auth={auth} />} />
          
          <Route path="/about" element={
            <div className="pt-32 container mx-auto px-6 min-h-screen">
              <h1 className="text-5xl font-bold mb-8">About Us</h1>
              <p className="text-xl text-slate-400">Oklahomabashi is the digital home of the Bangladeshi community in Oklahoma.</p>
            </div>
          } />
          <Route path="/contact" element={
            <div className="pt-32 container mx-auto px-6 min-h-screen">
               <h1 className="text-5xl font-bold mb-8">Contact</h1>
               <form className="max-w-md space-y-4">
                 <input type="email" placeholder="Your Email" className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white" />
                 <textarea placeholder="Message" className="w-full p-4 h-32 bg-white/5 border border-white/10 rounded-lg text-white" />
                 <button className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg">Send Message</button>
               </form>
            </div>
          } />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;