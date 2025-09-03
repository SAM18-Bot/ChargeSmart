import { config } from 'dotenv';
config();

import '@/ai/flows/answer-user-queries.ts';
import '@/ai/flows/estimate-time-till-empty.ts';
import '@/ai/flows/optimize-charging-schedule.ts';