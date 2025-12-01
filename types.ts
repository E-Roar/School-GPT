
export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum ChatMode {
  TUTOR = 'TUTOR', // Socratic method, guides learning
  QUIZ = 'QUIZ', // Conversational quiz
  CASUAL = 'CASUAL' // General help (still safe)
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  avatarUrl?: string;
  schoolId: string; // For multi-tenancy
  level?: number; // Gamification
  xp?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserFormData {
  name: string;
  email: string;
  role: Role;
  schoolId: string;
}

export interface Classroom {
  id: string;
  schoolId: string;
  name: string;
  teacherId: string;
  teacherName?: string;
  studentCount: number;
  schedule: string;
}

export interface RAGConfiguration {
  chunkSize: number;
  chunkOverlap: number;
  retrievalK: number; // Top K results
  embeddingModel: 'text-embedding-004' | 'openai-ada-002' | 'local-bert';
  strictness: number; // 0-1 how strictly it adheres to context
}

export interface School {
  id: string;
  name: string;
  primaryContactName: string;
  contactEmail: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  studentCount: number;
  status: 'active' | 'suspended';
  ragConfig: RAGConfiguration;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  toolCalls?: any[]; // For visualizing MCP actions
}

export interface RAGDocument {
  id: string;
  schoolId: string; // Which school owns this
  name: string;
  size: string;
  status: 'processing' | 'ready' | 'error';
  uploadDate: string;
  uploadedBy: Role; // To see if it was a teacher or super admin override
  uploadedByName?: string; // For filtering by specific teacher
  citationCount: number; // How many times AI used this in answers
  quizzesGenerated: number; // How many quizzes spawned from this doc
  engagementScore: number; // 0-100 computed metric
}

export interface Quiz {
  id: string;
  schoolId: string;
  title: string;
  generatedFromDocId?: string; // Linked RAG doc
  docName?: string;
  createdBy: 'AI' | 'TEACHER';
  questionCount: number;
  avgScore: number;
  completionCount: number;
  dateCreated: string;
}

export interface AnalyticsData {
  date: string;
  engagement: number;
  quizzesTaken: number;
  accuracy: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  xp: number;
  badges: string[];
}

// --- NEW ANALYTICS TYPES ---
export interface RevenueData {
  month: string;
  amount: number;
  expenses: number;
}

export interface TokenUsageData {
  schoolName: string;
  tokens: number; // in millions
  cost: number;
}

export interface SystemHealth {
  apiStatus: 'operational' | 'degraded' | 'down';
  vectorDbLatency: number; // ms
  activeConnections: number;
  errorRate: number; // percentage
}
