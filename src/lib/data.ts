import { Charger, EV } from './types';

export const chargers: Charger[] = [
  {
    id: 'CZ-001',
    name: 'Zenith Charger 1',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-002',
    name: 'Apex Charger 2',
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
    name: 'Pulse Charger 3',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-004',
    name: 'Volt Charger 4',
    status: 'Available',
    queue: [
       { user: { id: '4', name: 'Charlie' }, joinTime: new Date(new Date().getTime() - 5 * 60000) },
       { user: { id: '5', name: 'Diana' }, joinTime: new Date(new Date().getTime() - 2 * 60000) },
    ],
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
