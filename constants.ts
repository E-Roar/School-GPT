
import { Role, User, RAGDocument, AnalyticsData, School, LeaderboardEntry, RevenueData, TokenUsageData, SystemHealth, Quiz, Classroom } from './types';

// --- USERS ---
export const MOCK_STUDENT: User = {
  id: 'st_123',
  name: 'Alex Chen',
  email: 'alex.chen@student.edu',
  role: Role.STUDENT,
  schoolId: 'sch_A',
  level: 12,
  xp: 4500,
  status: 'active'
};

export const MOCK_TEACHER: User = {
  id: 'tc_456',
  name: 'Mrs. Johnson',
  email: 'sarah.johnson@school.edu',
  role: Role.TEACHER,
  schoolId: 'sch_A',
  status: 'active'
};

export const MOCK_SCHOOL_ADMIN: User = {
  id: 'sa_789',
  name: 'Principal Skinner',
  email: 'admin@springfield.edu',
  role: Role.SCHOOL_ADMIN,
  schoolId: 'sch_A',
  status: 'active'
};

export const MOCK_SUPER_ADMIN: User = {
  id: 'su_000',
  name: 'System Overlord',
  email: 'root@edunexus.ai',
  role: Role.SUPER_ADMIN,
  schoolId: 'system',
  status: 'active'
};

// --- MOCK USER DIRECTORY ---
export const MOCK_USER_DIRECTORY: User[] = [
  MOCK_STUDENT, MOCK_TEACHER, MOCK_SCHOOL_ADMIN,
  { id: 'u_1', name: 'James Smith', email: 'j.smith@springfield.edu', role: Role.TEACHER, schoolId: 'sch_A', status: 'active' },
  { id: 'u_2', name: 'Emily Davis', email: 'e.davis@springfield.edu', role: Role.STUDENT, schoolId: 'sch_A', status: 'active', level: 10, xp: 3200 },
  { id: 'u_3', name: 'Michael Brown', email: 'm.brown@springfield.edu', role: Role.STUDENT, schoolId: 'sch_A', status: 'suspended', level: 11, xp: 1500 },
  { id: 'u_4', name: 'Jessica Wilson', email: 'j.wilson@springfield.edu', role: Role.STUDENT, schoolId: 'sch_A', status: 'active', level: 9, xp: 2100 },
  { id: 'u_5', name: 'David Miller', email: 'd.miller@springfield.edu', role: Role.TEACHER, schoolId: 'sch_A', status: 'inactive' },
  { id: 'u_6', name: 'Sarah Moore', email: 's.moore@westside.edu', role: Role.TEACHER, schoolId: 'sch_B', status: 'active' },
  { id: 'u_7', name: 'Robert Taylor', email: 'r.taylor@westside.edu', role: Role.STUDENT, schoolId: 'sch_B', status: 'active' },
  { id: 'u_8', name: 'Linda Anderson', email: 'l.anderson@westside.edu', role: Role.SCHOOL_ADMIN, schoolId: 'sch_B', status: 'active' },
  { id: 'u_9', name: 'William Thomas', email: 'w.thomas@riverside.edu', role: Role.STUDENT, schoolId: 'sch_D', status: 'active' },
  { id: 'u_10', name: 'Elizabeth Jackson', email: 'e.jackson@riverside.edu', role: Role.TEACHER, schoolId: 'sch_D', status: 'active' },
];

export const MOCK_CLASSES: Classroom[] = [
  { id: 'cls_1', schoolId: 'sch_A', name: 'AP Biology', teacherId: 'tc_456', teacherName: 'Mrs. Johnson', studentCount: 24, schedule: 'Mon/Wed 10:00 AM' },
  { id: 'cls_2', schoolId: 'sch_A', name: 'World History', teacherId: 'u_1', teacherName: 'James Smith', studentCount: 30, schedule: 'Tue/Thu 09:00 AM' },
  { id: 'cls_3', schoolId: 'sch_A', name: 'Physics 101', teacherId: 'tc_456', teacherName: 'Mrs. Johnson', studentCount: 18, schedule: 'Fri 11:00 AM' },
  { id: 'cls_4', schoolId: 'sch_B', name: 'Calculus AB', teacherId: 'u_6', teacherName: 'Sarah Moore', studentCount: 15, schedule: 'Mon/Wed 01:00 PM' },
];

// --- DATA ---
const DEFAULT_RAG_CONFIG = {
  chunkSize: 512,
  chunkOverlap: 50,
  retrievalK: 3,
  embeddingModel: 'text-embedding-004' as const,
  strictness: 0.7
};

export const MOCK_SCHOOLS: School[] = [
  { 
    id: 'sch_A', 
    name: 'Springfield High', 
    primaryContactName: 'Principal Skinner',
    contactEmail: 'admin@springfield.edu',
    subscriptionPlan: 'enterprise', 
    studentCount: 1200, 
    status: 'active', 
    ragConfig: { ...DEFAULT_RAG_CONFIG, chunkSize: 1024 } 
  },
  { 
    id: 'sch_B', 
    name: 'Westside Academy', 
    primaryContactName: 'Dr. Linda Anderson',
    contactEmail: 'contact@westside.edu',
    subscriptionPlan: 'pro', 
    studentCount: 850, 
    status: 'active', 
    ragConfig: DEFAULT_RAG_CONFIG 
  },
  { 
    id: 'sch_C', 
    name: 'East High', 
    primaryContactName: 'Mr. Bolton',
    contactEmail: 'info@easthigh.edu',
    subscriptionPlan: 'free', 
    studentCount: 400, 
    status: 'suspended', 
    ragConfig: DEFAULT_RAG_CONFIG 
  },
  { 
    id: 'sch_D', 
    name: 'Riverside Tech', 
    primaryContactName: 'Dean Roberts',
    contactEmail: 'dean@riversidetech.edu',
    subscriptionPlan: 'enterprise', 
    studentCount: 2100, 
    status: 'active', 
    ragConfig: DEFAULT_RAG_CONFIG 
  },
  { 
    id: 'sch_E', 
    name: 'Oak Creek Elementary', 
    primaryContactName: 'Mrs. Krabappel',
    contactEmail: 'admin@oakcreek.edu',
    subscriptionPlan: 'pro', 
    studentCount: 600, 
    status: 'active', 
    ragConfig: DEFAULT_RAG_CONFIG 
  },
];

export const MOCK_DOCS: RAGDocument[] = [
  { 
    id: '1', schoolId: 'sch_A', name: 'Biology_Ch3_Photosynthesis.pdf', size: '2.4 MB', status: 'ready', 
    uploadDate: '2023-10-25', uploadedBy: Role.TEACHER, uploadedByName: 'Mrs. Johnson',
    citationCount: 145, quizzesGenerated: 12, engagementScore: 88
  },
  { 
    id: '2', schoolId: 'sch_A', name: 'History_WW2_Timeline.pdf', size: '5.1 MB', status: 'ready', 
    uploadDate: '2023-10-26', uploadedBy: Role.TEACHER, uploadedByName: 'Mr. Smith',
    citationCount: 89, quizzesGenerated: 5, engagementScore: 65
  },
  { 
    id: '3', schoolId: 'sch_B', name: 'Math_Calculus_Intro.pdf', size: '1.2 MB', status: 'processing', 
    uploadDate: '2023-10-27', uploadedBy: Role.TEACHER, uploadedByName: 'Mrs. Davis',
    citationCount: 0, quizzesGenerated: 0, engagementScore: 0
  },
  { 
    id: '4', schoolId: 'sch_A', name: 'School_Code_Of_Conduct_2024.pdf', size: '0.5 MB', status: 'ready', 
    uploadDate: '2023-11-01', uploadedBy: Role.SUPER_ADMIN, uploadedByName: 'System Overlord',
    citationCount: 320, quizzesGenerated: 0, engagementScore: 95
  },
  { 
    id: '5', schoolId: 'sch_A', name: 'Physics_Motion_Basics.pdf', size: '3.1 MB', status: 'ready', 
    uploadDate: '2023-11-05', uploadedBy: Role.TEACHER, uploadedByName: 'Mrs. Johnson',
    citationCount: 42, quizzesGenerated: 3, engagementScore: 45
  },
];

export const MOCK_QUIZZES: Quiz[] = [
  { id: 'q1', schoolId: 'sch_A', title: 'Photosynthesis Review', generatedFromDocId: '1', docName: 'Biology_Ch3_Photosynthesis.pdf', createdBy: 'AI', questionCount: 10, avgScore: 78, completionCount: 45, dateCreated: '2023-10-28' },
  { id: 'q2', schoolId: 'sch_A', title: 'WW2 Key Events', generatedFromDocId: '2', docName: 'History_WW2_Timeline.pdf', createdBy: 'TEACHER', questionCount: 15, avgScore: 82, completionCount: 30, dateCreated: '2023-10-30' },
  { id: 'q3', schoolId: 'sch_A', title: 'Midterm Prep: Biology', generatedFromDocId: '1', docName: 'Biology_Ch3_Photosynthesis.pdf', createdBy: 'AI', questionCount: 20, avgScore: 71, completionCount: 120, dateCreated: '2023-11-02' },
  { id: 'q4', schoolId: 'sch_B', title: 'Calculus Limits', generatedFromDocId: '3', docName: 'Math_Calculus_Intro.pdf', createdBy: 'AI', questionCount: 5, avgScore: 60, completionCount: 12, dateCreated: '2023-11-01' },
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { date: 'Mon', engagement: 65, quizzesTaken: 120, accuracy: 78 },
  { date: 'Tue', engagement: 72, quizzesTaken: 145, accuracy: 82 },
  { date: 'Wed', engagement: 85, quizzesTaken: 160, accuracy: 80 },
  { date: 'Thu', engagement: 78, quizzesTaken: 130, accuracy: 85 },
  { date: 'Fri', engagement: 90, quizzesTaken: 180, accuracy: 88 },
  { date: 'Sat', engagement: 45, quizzesTaken: 60, accuracy: 92 },
  { date: 'Sun', engagement: 50, quizzesTaken: 70, accuracy: 90 },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, studentName: 'Alex Chen', xp: 4500, badges: ['🚀', '🧠'] },
  { rank: 2, studentName: 'Sarah Smith', xp: 4350, badges: ['📚'] },
  { rank: 3, studentName: 'Jayden Lee', xp: 4200, badges: ['⚡', '🔥'] },
  { rank: 4, studentName: 'Emma Watson', xp: 4100, badges: ['🧠'] },
  { rank: 5, studentName: 'Michael Brown', xp: 3900, badges: [] },
];

// --- NEW MOCK DATA FOR SUPER ADMIN DASHBOARD ---
export const MOCK_REVENUE: RevenueData[] = [
  { month: 'Jan', amount: 8500, expenses: 2000 },
  { month: 'Feb', amount: 9200, expenses: 2200 },
  { month: 'Mar', amount: 10500, expenses: 2500 },
  { month: 'Apr', amount: 11800, expenses: 2800 },
  { month: 'May', amount: 12400, expenses: 2900 },
  { month: 'Jun', amount: 14500, expenses: 3500 },
];

export const MOCK_TOKEN_USAGE: TokenUsageData[] = [
  { schoolName: 'Springfield High', tokens: 12.5, cost: 125 },
  { schoolName: 'Westside Academy', tokens: 8.2, cost: 82 },
  { schoolName: 'Riverside Tech', tokens: 18.9, cost: 189 },
  { schoolName: 'Oak Creek', tokens: 4.1, cost: 41 },
];

export const MOCK_SYSTEM_HEALTH: SystemHealth = {
  apiStatus: 'operational',
  vectorDbLatency: 124, // ms
  activeConnections: 342,
  errorRate: 0.02
};

export const RAG_CONTEXT_MOCK = `
CONTEXT FROM VECTOR DATABASE:
Subject: Photosynthesis
Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.
The main reaction takes place in the chloroplasts.
Equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2.
Light-dependent reactions occur in the thylakoid membranes.
Calvin Cycle occurs in the stroma.
`;
