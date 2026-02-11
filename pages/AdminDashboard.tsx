import React, { useEffect, useState } from 'react';
import { AuthState, Event } from '../types';
import { db } from '../services/db';
import { Navigate, Link } from 'react-router-dom';
import { BarChart3, ScanLine, Users, DollarSign } from 'lucide-react';

interface AdminDashboardProps {
  auth: AuthState;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ auth }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const evts = db.getEvents();
    setEvents(evts);
    const revenue = evts.reduce((acc, curr) => acc + (curr.soldSeats * curr.price), 0);
    setTotalRevenue(revenue);
  }, []);

  if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">ADMIN CONSOLE</h1>
          <p className="text-slate-400">Manage events, verify tickets, and view analytics.</p>
        </div>
        <Link to="/admin/verify" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-600/20 transition-all">
          <ScanLine className="w-5 h-5" /> Launch Scanner
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium">Active Events</h3>
          </div>
          <p className="text-3xl font-bold text-white">{events.length}</p>
        </div>

         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium">Tickets Sold</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {events.reduce((acc, curr) => acc + curr.soldSeats, 0)}
          </p>
        </div>
      </div>

      {/* Event List */}
      <h2 className="text-2xl font-bold text-white mb-6">Event Management</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Event Name</th>
                <th className="px-6 py-4">Dept</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{event.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      event.department === 'OBCS' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-fuchsia-500/20 text-fuchsia-400'
                    }`}>
                      {event.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-cyan-500" 
                            style={{ width: `${(event.soldSeats / event.totalSeats) * 100}%` }}
                         />
                       </div>
                       <span className="text-xs">{event.soldSeats}/{event.totalSeats}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-green-400 font-mono">${(event.soldSeats * event.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button className="text-cyan-400 hover:text-cyan-300 font-bold mr-4">Edit</button>
                    <button className="text-red-400 hover:text-red-300">Stop Sales</button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;