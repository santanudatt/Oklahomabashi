import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, MapPin, DollarSign, Search, Shield } from 'lucide-react';
import { db } from '../services/db';
import { Event, AuthState, Department } from '../types';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

interface EventsPageProps {
  auth: AuthState;
  onLogin: () => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ auth, onLogin }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<Department | 'All'>('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEvents(db.getEvents());
  }, []);

  const filteredEvents = events.filter(e => filter === 'All' || e.department === filter);

  const handlePurchase = async () => {
    if (!auth.isAuthenticated) {
      onLogin();
      return;
    }
    if (!selectedEvent) return;

    setPurchasing(true);
    // Simulate Stripe Delay
    setTimeout(() => {
      try {
        db.purchaseTicket(selectedEvent.id, auth.user!.id, ticketQty);
        alert(`Successfully purchased ${ticketQty} ticket(s) for ${selectedEvent.title}!`);
        setSelectedEvent(null);
        setTicketQty(1);
        navigate('/dashboard'); // Redirect to dashboard to see tickets
      } catch (e: any) {
        alert(e.message);
      } finally {
        setPurchasing(false);
      }
    }, 1500);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen container mx-auto px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black mb-4 neon-text-blue">UPCOMING EVENTS</h1>
          <p className="text-slate-400">Join the community in our upcoming cultural and sports gatherings.</p>
        </div>
        
        {/* Filter */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['All', 'OBCS', 'OBSS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-6 py-2 rounded-md font-medium transition-all",
                filter === f ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
          >
            <div className="h-48 overflow-hidden relative">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className={clsx(
                  "px-3 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-md border",
                  event.department === 'OBCS' ? "text-cyan-400 border-cyan-400/30" : "text-fuchsia-400 border-fuchsia-400/30"
                )}>
                  {event.department}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                <span className="text-lg font-bold text-green-400">${event.price}</span>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-slate-400 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                 <div className="text-xs text-slate-500">
                    {event.totalSeats - event.soldSeats} seats left
                 </div>
                 <button 
                  onClick={() => setSelectedEvent(event)}
                  className="px-4 py-2 bg-white/5 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 text-white rounded-lg transition-all font-semibold text-sm"
                 >
                   Get Tickets
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Buy Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl"
          >
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2">Checkout</h2>
            <p className="text-slate-400 mb-6">You are purchasing tickets for <span className="text-white font-bold">{selectedEvent.title}</span>.</p>
            
            <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-800">
               <div className="flex justify-between mb-2">
                 <span>Price per ticket</span>
                 <span>${selectedEvent.price}</span>
               </div>
               <div className="flex justify-between items-center mb-4">
                 <span>Quantity</span>
                 <div className="flex items-center gap-3">
                   <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))} className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">-</button>
                   <span className="font-bold w-4 text-center">{ticketQty}</span>
                   <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))} className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">+</button>
                 </div>
               </div>
               <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-xl text-green-400">
                 <span>Total</span>
                 <span>${selectedEvent.price * ticketQty}</span>
               </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {purchasing ? 'Processing Stripe Payment...' : (
                <>Pay with Card <DollarSign className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
               <Shield className="w-3 h-3" /> Secure Payment via Stripe
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Helper for close icon
const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);

export default EventsPage;