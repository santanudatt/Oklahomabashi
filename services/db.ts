import { Event, Ticket, User, TicketStatus } from '../types';

// Initial Data
const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Pohela Boishakh 1431',
    department: 'OBCS',
    date: '2024-04-14T10:00:00',
    location: 'Scissortail Park, OKC',
    description: 'Join us for the biggest Bengali New Year celebration in Oklahoma! Cultural performances, food stalls, and more.',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    price: 20,
    totalSeats: 500,
    soldSeats: 120,
    coordinates: { lat: 35.4590, lng: -97.5172 }
  },
  {
    id: 'evt-2',
    title: 'Summer Cricket League',
    department: 'OBSS',
    date: '2024-06-15T09:00:00',
    location: 'Riverside Sports Complex',
    description: 'The annual T20 tournament begins. Register your teams now or come watch the matches.',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    price: 10,
    totalSeats: 200,
    soldSeats: 45,
    coordinates: { lat: 35.4320, lng: -97.5500 }
  },
  {
    id: 'evt-3',
    title: 'Language Day Vigil',
    department: 'OBCS',
    date: '2024-02-21T18:00:00',
    location: 'UCO Plunkett Park',
    description: 'Honoring the martyrs of the Language Movement.',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    price: 0,
    totalSeats: 100,
    soldSeats: 80,
    coordinates: { lat: 35.6580, lng: -97.4720 }
  }
];

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Demo User',
  email: 'user@oklahomabashi.com',
  role: 'user'
};

const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@oklahomabashi.com',
  role: 'admin'
};

// Helpers
const getStorage = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return initial;
  try {
    return JSON.parse(stored);
  } catch {
    return initial;
  }
};

const setStorage = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Database Methods
export const db = {
  getEvents: (): Event[] => getStorage('ob_events', INITIAL_EVENTS),
  
  saveEvent: (event: Event) => {
    const events = db.getEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    setStorage('ob_events', events);
  },

  getTickets: (): Ticket[] => getStorage('ob_tickets', []),

  getTicketsByUser: (userId: string): Ticket[] => {
    return db.getTickets().filter(t => t.userId === userId);
  },

  purchaseTicket: (eventId: string, userId: string, quantity: number): Ticket[] => {
    const events = db.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');
    
    const event = events[eventIndex];
    if (event.soldSeats + quantity > event.totalSeats) throw new Error('Not enough seats available');

    // Update event
    event.soldSeats += quantity;
    events[eventIndex] = event;
    setStorage('ob_events', events);

    // Generate tickets
    const newTickets: Ticket[] = [];
    const currentTickets = db.getTickets();
    
    for (let i = 0; i < quantity; i++) {
      const ticket: Ticket = {
        id: `tkt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        eventId,
        userId,
        purchaseDate: new Date().toISOString(),
        status: 'valid',
        qrCodeData: '' // filled below
      };
      // Simple "encryption" for demo
      ticket.qrCodeData = btoa(JSON.stringify({ id: ticket.id, secret: 'oklahomabashi-secure' }));
      newTickets.push(ticket);
    }

    setStorage('ob_tickets', [...currentTickets, ...newTickets]);
    return newTickets;
  },

  verifyTicket: (qrData: string): { status: 'success' | 'error'; message: string; ticket?: Ticket } => {
    try {
      const decoded = JSON.parse(atob(qrData));
      if (decoded.secret !== 'oklahomabashi-secure') return { status: 'error', message: 'Invalid Ticket Signature' };

      const tickets = db.getTickets();
      const ticketIndex = tickets.findIndex(t => t.id === decoded.id);

      if (ticketIndex === -1) return { status: 'error', message: 'Ticket ID not found in database' };

      const ticket = tickets[ticketIndex];

      if (ticket.status === 'used') return { status: 'error', message: 'Ticket already used' };
      if (ticket.status === 'invalid') return { status: 'error', message: 'Ticket has been invalidated' };

      // Mark as used
      ticket.status = 'used';
      tickets[ticketIndex] = ticket;
      setStorage('ob_tickets', tickets);

      return { status: 'success', message: 'Access Granted', ticket };

    } catch (e) {
      return { status: 'error', message: 'QR Code Parsing Failed' };
    }
  },

  // Auth Simulation
  login: (email: string): User | null => {
    if (email.includes('admin')) return MOCK_ADMIN;
    return MOCK_USER;
  }
};