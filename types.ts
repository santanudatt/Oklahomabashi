export type Department = 'OBCS' | 'OBSS' | 'General';

export interface Event {
  id: string;
  title: string;
  department: Department;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  totalSeats: number;
  soldSeats: number;
  coordinates: { lat: number; lng: number }; // For map integration
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export type TicketStatus = 'valid' | 'used' | 'invalid';

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  status: TicketStatus;
  qrCodeData: string; // Encrypted string in real app
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}