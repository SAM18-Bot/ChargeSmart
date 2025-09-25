
'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import type { Booking, Charger } from '@/lib/types';
import { chargers as initialChargers } from '@/lib/data';
import { add } from 'date-fns';

interface BookingContextType {
  bookings: Booking[];
  chargers: Charger[];
  setChargers: React.Dispatch<React.SetStateAction<Charger[]>>;
  addBooking: (booking: Booking) => void;
  activateBooking: (bookingId: string, chargerId: string, chargeTimeMinutes: number) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chargers, setChargers] = useState<Charger[]>(initialChargers);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
  };
  
  const activateBooking = (bookingId: string, chargerId: string, chargeTimeMinutes: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    const charger = chargers.find(c => c.id === chargerId);

    if (!booking || !charger || booking.status !== 'pending') {
      return false;
    }

    const chargeStartTime = new Date();
    const chargeEndTime = add(chargeStartTime, { minutes: chargeTimeMinutes });

    // Update booking status
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { ...b, status: 'active', chargeStartTime, chargeEndTime } 
        : b
    ));

    // Update charger status
    setChargers(prev => prev.map(c => {
      if (c.id === chargerId) {
        return {
          ...c,
          status: 'Occupied',
          currentUser: { id: booking.userId, name: booking.userName, email: '' }, // email is not critical here
          startTime: chargeStartTime,
          estimatedEndTime: chargeEndTime,
          kwhReserved: booking.kwh,
        };
      }
      return c;
    }));

    // Simulate charger becoming free later
    setTimeout(() => {
        setChargers(prev => prev.map(ch => ch.id === chargerId ? { ...ch, status: 'Available', currentUser: undefined, startTime: undefined, estimatedEndTime: undefined } : ch))
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completed'} : b));
    }, chargeTimeMinutes * 60000); // convert minutes to ms

    return true;
  };

  return (
    <BookingContext.Provider value={{ bookings, chargers, setChargers, addBooking, activateBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};
