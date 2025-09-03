import { Charger, EV } from './types';

export const chargers: Charger[] = [
  {
    id: 'CZ-001',
    name: 'Koregaon Park Charger',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-002',
    name: 'Hinjewadi IT Park Charger',
    status: 'Occupied',
    currentUser: { id: '2', name: 'Alice' },
    currentVehicle: { model: 'Tesla Model 3', batteryPercentage: 45 },
    kwhReserved: 40,
    startTime: new Date(new Date().getTime() - 15 * 60000), // 15 mins ago
    estimatedEndTime: new Date(new Date().getTime() + 15 * 60000), // 15 mins from now
    queue: [
      { user: { id: '3', name: 'Bob' }, joinTime: new Date(new Date().getTime() - 10 * 60000) },
    ],
  },
  {
    id: 'CZ-003',
    name: 'Viman Nagar Charger',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-004',
    name: 'Baner Charger',
    status: 'Available',
    queue: [
       { user: { id: '4', name: 'Charlie' }, joinTime: new Date(new Date().getTime() - 5 * 60000) },
       { user: { id: '5', name: 'Diana' }, joinTime: new Date(new Date().getTime() - 2 * 60000) },
    ],
  },
  {
    id: 'CZ-005',
    name: 'Kalyani Nagar Charger',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-006',
    name: 'Hadapsar Charger',
    status: 'Occupied',
    currentUser: { id: '6', name: 'Frank' },
    currentVehicle: { model: 'Hyundai Kona Electric', batteryPercentage: 60 },
    kwhReserved: 25,
    startTime: new Date(new Date().getTime() - 20 * 60000),
    estimatedEndTime: new Date(new Date().getTime() + 25 * 60000),
    queue: [],
  },
];

export const evs: EV[] = [
  { model: 'Tesla Model 3', batteryCapacity: 75 },
  { model: 'Tesla Model Y', batteryCapacity: 82 },
  { model: 'Tata Nexon EV', batteryCapacity: 30.2 },
  { model: 'MG ZS EV', batteryCapacity: 44.5 },
  { model: 'Hyundai Kona Electric', batteryCapacity: 39.2 },
  { model: 'Audi e-tron', batteryCapacity: 95 },
];
