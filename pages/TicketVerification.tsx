import React, { useState } from 'react';
import { AuthState, Ticket } from '../types';
import { Navigate } from 'react-router-dom';
import { db } from '../services/db';
import { Scan, Keyboard, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketVerificationProps {
  auth: AuthState;
}

const TicketVerification: React.FC<TicketVerificationProps> = ({ auth }) => {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState<{ status: 'success' | 'error'; message: string; ticket?: Ticket } | null>(null);

  if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleSimulateScan = () => {
    // In a real app, this would open the camera and wait for result.
    // For this demo, we will simulate a scan by prompting for the base64 string
    // or just checking a hardcoded one if users don't have one handy.
    // Since copy-pasting base64 is hard, let's ask for the visible Ticket ID instead for the "Simulate" flow
    // and internally look it up to find the QR data, then pass that to verify.
    
    const ticketIdInput = prompt("SIMULATION MODE: Enter visible Ticket ID (e.g. tkt-173...-abc) found on the ticket card:");
    if (!ticketIdInput) return;

    // Reverse lookup to find the QR data (in real life the scanner reads the QR data directly)
    const tickets = db.getTickets();
    const ticket = tickets.find(t => t.id === ticketIdInput);
    
    if (ticket) {
      const res = db.verifyTicket(ticket.qrCodeData);
      setResult(res);
    } else {
      setResult({ status: 'error', message: 'Ticket ID not found in system.' });
    }
  };

  const reset = () => {
    setResult(null);
    setManualInput('');
  };

  return (
    <div className="pt-24 pb-20 min-h-screen container mx-auto px-6 max-w-2xl">
      <h1 className="text-3xl font-black text-white mb-8 text-center">TICKET VERIFICATION</h1>

      {/* Mode Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 mb-8">
        <button 
          onClick={() => { setMode('scan'); reset(); }}
          className={`flex-1 py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all ${mode === 'scan' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Scan className="w-5 h-5" /> Scanner
        </button>
        <button 
          onClick={() => { setMode('manual'); reset(); }}
          className={`flex-1 py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all ${mode === 'manual' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Keyboard className="w-5 h-5" /> Manual Entry
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[300px]"
            >
              {mode === 'scan' ? (
                <div className="text-center w-full">
                  <div className="relative w-64 h-64 mx-auto mb-6 bg-black rounded-xl border-2 border-cyan-500/50 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent animate-scan" style={{ animation: 'scan 2s infinite linear' }} />
                    <Scan className="w-16 h-16 text-slate-700" />
                    <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }`}</style>
                  </div>
                  <p className="text-slate-400 mb-6">Point camera at QR Code</p>
                  <button onClick={handleSimulateScan} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold text-sm">
                    [DEV] Simulate Scan
                  </button>
                </div>
              ) : (
                <div className="w-full">
                   <label className="block text-sm font-medium text-slate-400 mb-2">Ticket ID</label>
                   <input 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter ID (e.g. tkt-123...)" 
                    className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-lg mb-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                   />
                   <button 
                    onClick={handleSimulateScan} // Using same logic for demo since we look up by ID there
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
                   >
                     Verify Ticket
                   </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[300px] text-center"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${result.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {result.status === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2">{result.status === 'success' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h2>
              <p className="text-xl text-slate-300 mb-8">{result.message}</p>
              
              {result.ticket && (
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-8 w-full">
                    <div className="text-sm text-slate-500 uppercase">Ticket ID</div>
                    <div className="font-mono text-white">{result.ticket.id}</div>
                 </div>
              )}

              <button 
                onClick={reset}
                className="flex items-center gap-2 text-slate-400 hover:text-white font-bold"
              >
                <RefreshCcw className="w-4 h-4" /> Scan Next Ticket
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default TicketVerification;