import React, { useEffect, useState } from 'react';
import { AuthState, Ticket, Event } from '../types';
import { db } from '../services/db';
import TicketCard from '../components/TicketCard';
import { Navigate } from 'react-router-dom';
import { Ticket as TicketIcon, Download, Clock } from 'lucide-react';

interface UserDashboardProps {
  auth: AuthState;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ auth }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (auth.user) {
      setTickets(db.getTicketsByUser(auth.user.id));
      setEvents(db.getEvents());
    }
  }, [auth.user]);

  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Helper to find event details for a ticket
  const getEvent = (eventId: string) => events.find(e => e.id === eventId);

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold">
          {auth.user?.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {auth.user?.name}</h1>
          <p className="text-slate-400">{auth.user?.email}</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TicketIcon className="w-6 h-6 text-cyan-400" /> My Tickets
        </h2>
        
        {tickets.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
            <p className="text-slate-500 mb-4">You haven't purchased any tickets yet.</p>
            <a href="#/events" className="text-cyan-400 font-bold hover:underline">Browse Events</a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map(ticket => {
              const evt = getEvent(ticket.eventId);
              if (!evt) return null;
              return (
                <div key={ticket.id} className="flex flex-col gap-4">
                  <TicketCard ticket={ticket} event={evt} />
                  <button 
                    onClick={() => alert("Downloading PDF... (Feature simulated)")}
                    className="flex items-center justify-center gap-2 w-full py-2 border border-slate-700 rounded-lg hover:bg-slate-800 text-sm text-slate-300 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-fuchsia-400" /> Order History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tickets.map(ticket => {
                  const evt = getEvent(ticket.eventId);
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4">{new Date(ticket.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-white">{evt?.title || 'Unknown Event'}</td>
                      <td className="px-6 py-4 font-mono">{ticket.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;