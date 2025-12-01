
import { School, RAGDocument, RevenueData, TokenUsageData, SystemHealth, User, Quiz, Classroom, UserFormData } from '../types';
import { MOCK_SCHOOLS, MOCK_DOCS, MOCK_REVENUE, MOCK_TOKEN_USAGE, MOCK_SYSTEM_HEALTH, MOCK_USER_DIRECTORY, MOCK_QUIZZES, MOCK_CLASSES } from '../constants';

// KEYS for localStorage
const STORAGE_KEYS = {
  SCHOOLS: 'edunexus_schools',
  DOCS: 'edunexus_docs',
  REVENUE: 'edunexus_revenue',
  USERS: 'edunexus_users',
  QUIZZES: 'edunexus_quizzes',
  CLASSES: 'edunexus_classes'
};

/**
 * Simulates a Backend Database/Service Layer.
 * Persists changes to localStorage so admins can actually "Save" configs.
 */
class DatabaseService {
  
  constructor() {
    try {
      this.initializeData();
    } catch (e) {
      console.error("Failed to initialize database mock data", e);
    }
  }

  private initializeData() {
    if (typeof window === 'undefined') return;
    
    try {
      if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
        localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(MOCK_SCHOOLS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DOCS)) {
        localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(MOCK_DOCS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USER_DIRECTORY));
      }
      if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(MOCK_QUIZZES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(MOCK_CLASSES));
      }
    } catch (e) {
      console.warn("LocalStorage access denied or full. Using in-memory mocks.");
    }
  }

  private getFromStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }

  // --- SIMULATED ASYNC API CALLS ---

  public async getSchools(): Promise<School[]> {
    await this.simulateLatency();
    return this.getFromStorage(STORAGE_KEYS.SCHOOLS, MOCK_SCHOOLS);
  }

  public async getSchoolById(id: string): Promise<School | undefined> {
    await this.simulateLatency();
    const schools = await this.getSchools();
    return schools.find(s => s.id === id);
  }

  public async updateSchool(updatedSchool: School): Promise<void> {
    await this.simulateLatency();
    const schools = await this.getSchools();
    const index = schools.findIndex(s => s.id === updatedSchool.id);
    if (index !== -1) {
      schools[index] = updatedSchool;
      this.saveToStorage(STORAGE_KEYS.SCHOOLS, schools);
    }
  }

  public async getDocuments(schoolId?: string): Promise<RAGDocument[]> {
    await this.simulateLatency();
    const docs = this.getFromStorage<RAGDocument[]>(STORAGE_KEYS.DOCS, MOCK_DOCS);
    
    if (schoolId) {
      return docs.filter(d => d.schoolId === schoolId);
    }
    return docs;
  }

  public async addDocument(doc: RAGDocument): Promise<void> {
    await this.simulateLatency();
    const docs = await this.getDocuments();
    docs.unshift(doc);
    this.saveToStorage(STORAGE_KEYS.DOCS, docs);
  }

  public async deleteDocument(docId: string): Promise<void> {
    await this.simulateLatency();
    const docs = await this.getDocuments();
    const filtered = docs.filter(d => d.id !== docId);
    this.saveToStorage(STORAGE_KEYS.DOCS, filtered);
  }

  // --- USER MANAGEMENT ---

  public async getAllUsers(): Promise<User[]> {
    return this.getFromStorage(STORAGE_KEYS.USERS, MOCK_USER_DIRECTORY);
  }

  public async getUsersBySchool(schoolId: string, page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    await this.simulateLatency();
    const allUsers = await this.getAllUsers();
    
    const schoolUsers = allUsers.filter(u => u.schoolId === schoolId);
    const total = schoolUsers.length;
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = schoolUsers.slice(start, end);
    
    return { users: paginatedUsers, total };
  }

  public async createUser(userData: UserFormData): Promise<User> {
    await this.simulateLatency();
    const allUsers = await this.getAllUsers();
    const newUser: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      schoolId: userData.schoolId,
      status: 'active',
      level: 1,
      xp: 0
    };
    allUsers.unshift(newUser);
    this.saveToStorage(STORAGE_KEYS.USERS, allUsers);
    return newUser;
  }

  public async deleteUser(userId: string): Promise<void> {
    await this.simulateLatency();
    const allUsers = await this.getAllUsers();
    const filtered = allUsers.filter(u => u.id !== userId);
    this.saveToStorage(STORAGE_KEYS.USERS, filtered);
  }

  // --- CLASS MANAGEMENT ---

  public async getClassrooms(schoolId: string): Promise<Classroom[]> {
    await this.simulateLatency();
    const classes = this.getFromStorage<Classroom[]>(STORAGE_KEYS.CLASSES, MOCK_CLASSES);
    return classes.filter(c => c.schoolId === schoolId);
  }

  public async createClassroom(schoolId: string, name: string): Promise<Classroom> {
    await this.simulateLatency();
    const classes = this.getFromStorage<Classroom[]>(STORAGE_KEYS.CLASSES, MOCK_CLASSES);
    
    const newClass: Classroom = {
      id: 'cls_' + Math.random().toString(36).substr(2, 5),
      schoolId,
      name,
      teacherId: 't_placeholder',
      teacherName: 'Unassigned',
      studentCount: 0,
      schedule: 'TBD'
    };
    
    classes.push(newClass);
    this.saveToStorage(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  }

  // --- QUIZ MANAGEMENT ---

  public async getQuizzesBySchool(schoolId: string): Promise<Quiz[]> {
    await this.simulateLatency();
    const quizzes = this.getFromStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, MOCK_QUIZZES);
    return quizzes.filter(q => q.schoolId === schoolId);
  }

  // --- METRICS ---

  public async getRevenueMetrics(): Promise<RevenueData[]> {
    await this.simulateLatency();
    return MOCK_REVENUE; // Read-only for now
  }

  public async getTokenUsage(): Promise<TokenUsageData[]> {
    await this.simulateLatency();
    return MOCK_TOKEN_USAGE; // Read-only for now
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    await this.simulateLatency();
    return MOCK_SYSTEM_HEALTH;
  }

  // Helper to make it feel like a real network request
  private simulateLatency(ms: number = 400): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const databaseService = new DatabaseService();
