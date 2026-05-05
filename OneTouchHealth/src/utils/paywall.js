import { getTodayScanCount } from './database';

// Free plan: 2 scans per day
export const FREE_DAILY_LIMIT = 2;

export const PLANS = {
  entry: {
    id: 'entry',
    name: 'Entry pass',
    price: '$1.99',
    period: 'one-time',
    description: '3–5 scans/day · Better results',
    dailyLimit: 5,
  },
  daily: {
    id: 'daily',
    name: 'Daily power',
    price: '$1.99',
    period: '24 hours',
    description: 'Unlimited scans · Full AI insights',
    dailyLimit: 999,
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: '$4.99',
    period: '/month',
    description: 'Unlimited scans · History · AI insights',
    dailyLimit: 999,
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro+',
    price: '$9.99',
    period: '/month',
    description: 'Family accounts · PDF reports · Advanced insights',
    dailyLimit: 999,
  },
};

// In production this would check a real subscription store
// For now it reads from a simple in-memory/local state
let activePlan = null; // null = free

export function setActivePlan(planId) {
  activePlan = planId;
}

export function getActivePlan() {
  return activePlan;
}

export function canScan() {
  const count = getTodayScanCount();
  if (!activePlan) return count < FREE_DAILY_LIMIT;
  const plan = PLANS[activePlan];
  if (!plan) return count < FREE_DAILY_LIMIT;
  return count < plan.dailyLimit;
}

export function scansRemaining() {
  const count = getTodayScanCount();
  if (!activePlan) return Math.max(0, FREE_DAILY_LIMIT - count);
  return 999;
}
