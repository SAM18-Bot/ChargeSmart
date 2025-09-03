export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
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
  startTime: Date;
  endTime: Date;
}

export interface Charger {
  id: string;
  name: string;
  status: 'Available' | 'Occupied';
  currentUser?: User;
  currentVehicle?: CurrentVehicle;
  kwhReserved?: number;
  startTime?: Date;
  estimatedEndTime?: Date;
  queue: QueueItem[];
  bookings?: Booking[];
}
