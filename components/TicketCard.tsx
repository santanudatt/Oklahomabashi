import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Event } from '../types';
import { motion } from 'framer-motion';
import { Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  event: Event;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, event }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl max-w-sm mx-auto"
    >
      {/* Header */}
      <div className={`h-2 w-full ${event.department === 'OBCS' ? 'bg-cyan-500' : 'bg-fuchsia-500'}`} />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`text-xs font-bold px-2 py-1 rounded border ${
              event.department === 'OBCS' ? 'border-cyan-500 text-cyan-400' : 'border-fuchsia-500 text-fuchsia-400'
            }`}>
              {event.department}
            </span>
            <h3 className="text-xl font-bold text-white mt-2 leading-tight">{event.title}</h3>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <QRCodeSVG value={ticket.qrCodeData} size={80} level="H" />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-slate-400 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
            ID: {ticket.id.split('-').pop()}
          </div>
          <div className="flex items-center gap-2">
            {ticket.status === 'valid' && (
              <span className="flex items-center text-green-400 text-xs font-bold">
                <CheckCircle className="w-3 h-3 mr-1" /> VALID
              </span>
            )}
            {ticket.status === 'used' && (
              <span className="flex items-center text-yellow-500 text-xs font-bold">
                <CheckCircle className="w-3 h-3 mr-1" /> USED
              </span>
            )}
            {ticket.status === 'invalid' && (
              <span className="flex items-center text-red-500 text-xs font-bold">
                <XCircle className="w-3 h-3 mr-1" /> VOID
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Holographic overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
    </motion.div>
  );
};

export default TicketCard;