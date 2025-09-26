
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  contactNumber?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  stationId: string;
  stationName?: string;
}

export interface EV {
  model: string;
  batteryCapacity: number; // in kWh
}

export interface CurrentVehicle {
    model: string;
    batteryPercentage?: number;
}

export interface QueueItem {
  user: User;
  joinTime: Date;
}

export interface Booking {
  id: string;
  chargerId: string;
  userId: string;
  userName: string;
  kwh: number;
  cost: number;
  date: Date;
  status: 'pending' | 'active' | 'completed';
  chargeStartTime?: Date;
  chargeEndTime?: Date;
}

export interface Charger {
  id:string;
  name: string;
  status: 'Available' | 'Occupied' | 'Booked';
  lat: number;
  lng: number;
  currentUser?: User;
  currentVehicle?: CurrentVehicle;
  kwhReserved?: number;
  startTime?: Date;
  estimatedEndTime?: Date;
  queue: QueueItem[];
  bookings?: Booking[];
  distance?: number;
}

export interface ChargingHistory {
    id: string;
    chargerName: string;
    date: Date;
    kwhCharged: number;
    cost: number;
    durationMinutes: number;
}
