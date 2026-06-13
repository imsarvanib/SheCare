import type { FeatureCard, NavItem, Scheme } from '../types'

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard' },
  { label: 'Period Tracker', path: '/app/period-tracker' },
  { label: 'Pregnancy Care', path: '/app/pregnancy-care' },
  { label: 'Medicine Reminder', path: '/app/medicine-reminder' },
  { label: 'PCOS/PCOD Tracker', path: '/app/pcos-tracker' },
  { label: 'Mental Health', path: '/app/mental-health' },
  { label: 'Healthcare Schemes', path: '/app/schemes' },
  { label: 'Profile', path: '/app/profile' },
]

export const featureCards: FeatureCard[] = [
  { title: 'Period Tracking', description: 'Log cycles, symptoms, and smart predictions.', tag: 'Precision Care' },
  { title: 'Pregnancy Journey', description: 'Weekly milestones with wellness guidance.', tag: 'Nurture' },
  { title: 'Medicine Reminders', description: 'Never miss meds with elegant daily planners.', tag: 'Routine' },
  { title: 'PCOS Support', description: 'Track patterns and discover personalized insights.', tag: 'Balance' },
  { title: 'Mental Wellness', description: 'Mood journaling and quote-based emotional support.', tag: 'Mindful' },
  { title: 'Healthcare Schemes', description: 'Find eligible programs with one smart search.', tag: 'Access' },
]

export const dashboardCards = [
  { title: 'Next Cycle Prediction', value: 'Apr 20', note: 'Based on your last 3 cycles' },
  { title: 'Medicine Reminders', value: '3 today', note: 'Next dose in 2h 15m' },
  { title: 'Mood Summary', value: 'Calm', note: 'Energy has improved this week' },
]

export const weeklyInsightsInput = {
  moodScores: [3, 3, 4, 4, 5, 5, 5],
  cycleLengths: [28, 29, 28, 28],
  reminderTaken: [true, true, false, true, true, true, true],
}

export const cycleLogs = [
  { date: 'Mar 01', pain: 3, mood: 4, flow: 3 },
  { date: 'Mar 08', pain: 4, mood: 3, flow: 4 },
  { date: 'Mar 15', pain: 2, mood: 5, flow: 2 },
  { date: 'Mar 22', pain: 3, mood: 4, flow: 3 },
  { date: 'Mar 29', pain: 2, mood: 5, flow: 2 },
]

export const weeklyPregnancy = [
  { week: 8, title: 'Growth Update', detail: 'Baby is about the size of a raspberry.' },
  { week: 9, title: 'Nutrition', detail: 'Prioritize iron-rich foods and hydration.' },
  { week: 10, title: 'Movement', detail: 'Try gentle walks for 20 minutes daily.' },
  { week: 11, title: 'Rest', detail: 'Aim for consistent bedtime and naps when needed.' },
]

export const appointments = [
  { doctor: 'Dr. Kavya Mehta', date: 'Apr 06, 10:00 AM', type: 'Prenatal Checkup' },
  { doctor: 'Dr. Rhea Nair', date: 'Apr 18, 04:30 PM', type: 'Nutrition Consultation' },
]

export const medicines = [
  { name: 'Iron Supplement', schedule: '08:00 AM', active: true },
  { name: 'Vitamin D', schedule: '01:00 PM', active: true },
  { name: 'Calcium Tablet', schedule: '08:30 PM', active: false },
]

export const pcosSymptoms = [
  'Irregular periods',
  'Bloating',
  'Acne flare-ups',
  'Hair thinning',
  'Low energy',
  'Sugar cravings',
]

export const pcosInsights = [
  'Hydration has improved symptom stability by 11% this month.',
  'Sleep consistency correlates with lower mood volatility.',
  'Post-meal walks are reducing energy crashes.',
]

export const wellnessCards = [
  { title: '2-Minute Breathing', body: 'Slow nasal breathing can calm stress response quickly.' },
  { title: 'Evening Reflection', body: 'Write one win and one gratitude point before bed.' },
  { title: 'Body Scan', body: 'A gentle body scan can reduce anxious thought loops.' },
]

export const schemes: Scheme[] = [
  {
    id: 'scheme-1',
    name: 'Janani Suraksha Yojana',
    ageRange: '18-45',
    eligibility: 'Pregnant women below poverty line',
    summary: 'Cash assistance for safe institutional delivery support.',
  },
  {
    id: 'scheme-2',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    ageRange: '19-40',
    eligibility: 'First-time mothers',
    summary: 'Maternity benefit for wage compensation during pregnancy.',
  },
  {
    id: 'scheme-3',
    name: 'RKSK Adolescent Health',
    ageRange: '10-19',
    eligibility: 'Adolescent girls and boys',
    summary: 'Counseling and preventive care for adolescent health.',
  },
  {
    id: 'scheme-4',
    name: 'Ayushman Bharat PM-JAY',
    ageRange: 'All ages',
    eligibility: 'Low-income eligible households',
    summary: 'Hospitalization coverage for secondary and tertiary care.',
  },
]

export const profileData = {
  name: 'Aarohi Sharma',
  email: 'aarohi.shecare@example.com',
  phone: '+91 98765 43210',
  age: 29,
  city: 'Hyderabad',
}
