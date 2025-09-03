import { Charger, EV } from './types';

export const chargers: Charger[] = [
  {
    id: 'CZ-001',
    name: 'Koregaon Park Plaza',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-002',
    name: 'Phoenix Marketcity',
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
    name: 'Westend Mall',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-004',
    name: 'Amanora Mall',
    status: 'Occupied',
    currentUser: { id: '4', name: 'Charlie' },
    currentVehicle: { model: 'MG ZS EV', batteryPercentage: 30 },
    kwhReserved: 35,
    startTime: new Date(new Date().getTime() - 10 * 60000),
    estimatedEndTime: new Date(new Date().getTime() + 35 * 60000),
    queue: [
       { user: { id: '5', name: 'Diana' }, joinTime: new Date(new Date().getTime() - 5 * 60000) },
    ],
  },
  {
    id: 'CZ-005',
    name: 'Seasons Mall',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-006',
    name: 'Elpro City Square',
    status: 'Occupied',
    currentUser: { id: '6', name: 'Frank' },
    currentVehicle: { model: 'Hyundai Kona Electric', batteryPercentage: 60 },
    kwhReserved: 25,
    startTime: new Date(new Date().getTime() - 20 * 60000),
    estimatedEndTime: new Date(new Date().getTime() + 25 * 60000),
    queue: [],
  },
  {
    id: 'CZ-007',
    name: 'Kumar Pacific Mall',
    status: 'Available',
    queue: [],
  },
  {
    id: 'CZ-008',
    name: 'SGS Magnum Mall',
    status: 'Available',
    queue: [],
  }
];

export const evs: EV[] = [
    { model: 'Tata Nexon EV', batteryCapacity: 30.2 },
    { model: 'Tata Tigor EV', batteryCapacity: 26 },
    { model: 'Tata Punch EV', batteryCapacity: 25 },
    { model: 'MG ZS EV', batteryCapacity: 50.3 },
    { model: 'Hyundai Kona Electric', batteryCapacity: 39.2 },
    { model: 'Hyundai Ioniq 5', batteryCapacity: 72.6 },
    { model: 'Kia EV6', batteryCapacity: 77.4 },
    { model: 'BYD Atto 3', batteryCapacity: 60.48 },
    { model: 'BYD E6', batteryCapacity: 71.7 },
    { model: 'Mahindra XUV400', batteryCapacity: 39.4 },
    { model: 'Volvo XC40 Recharge', batteryCapacity: 78 },
    { model: 'Mercedes-Benz EQC', batteryCapacity: 80 },
    { model: 'BMW iX', batteryCapacity: 76.6 },
    { model: 'Audi e-tron', batteryCapacity: 95 },
    { model: 'Jaguar I-PACE', batteryCapacity: 90 },
    { model: 'Porsche Taycan', batteryCapacity: 93.4 },
    { model: 'Tesla Model 3', batteryCapacity: 75 },
    { model: 'Tesla Model Y', batteryCapacity: 82 },
];
