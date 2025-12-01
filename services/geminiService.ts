
import { GoogleGenAI, Chat, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { RAG_CONTEXT_MOCK } from "../constants";
import { databaseService } from "./database";

// --- MCP TOOL DEFINITIONS ---
// These define what the AI can "do" in the admin panel.
const adminTools: FunctionDeclaration[] = [
  {
    name: 'getSchoolStats',
    description: 'Get current statistics like student count and engagement for the school.',
    parameters: { 
      type: Type.OBJECT, 
      properties: {
        schoolId: { type: Type.STRING, description: "The ID of the school" }
      },
      required: ['schoolId']
    }
  },
  {
    name: 'resetUserPassword',
    description: 'Reset password for a specific user by ID.',
    parameters: {
       type: Type.OBJECT,
       properties: { 
         userId: { type: Type.STRING, description: "The ID of the user" } 
       },
       required: ['userId']
    }
  },
  {
    name: 'createClassroom',
    description: 'Create a new classroom or course in the database.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        schoolId: { type: Type.STRING, description: "School ID to create class for" },
        name: { type: Type.STRING, description: "Name of the class, e.g., Biology 101" }
      },
      required: ['name', 'schoolId']
    }
  }
];

class GeminiService {
  private ai: GoogleGenAI;
  private modelName: string = 'gemini-2.5-flash';

  constructor() {
    // strictly use process.env.API_KEY as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Allows switching providers in the future (Ollama, etc.)
   */
  public setProvider(provider: 'gemini' | 'ollama' | 'openrouter') {
    console.log(`Switched provider to ${provider} (Mock implementation)`);
  }

  private getSystemInstruction(role: string, context: string): string {
    if (role === 'student') {
      return `
        You are "Nexus", a friendly and highly intelligent AI tutor.
        
        CORE RULES:
        1. SAFE AI: No hacking, violence, or illegal topics.
        2. ANTI-CHEAT: Do NOT provide direct answers to homework. Use Socratic method.
        3. KNOWLEDGE BASE: Use the provided CONTEXT.
        4. PERSONALITY: Encouraging, energetic.

        CONTEXT:
        ${context}
      `;
    } else {
      return `
        You are "Nexus Admin", an AI assistant for school administrators.
        You have access to tools to manage the school.
        If asked to create a class or check stats, USE THE TOOLS provided.
        Be professional and concise.
      `;
    }
  }

  public async createChat(role: 'student' | 'teacher' | 'admin'): Promise<Chat> {
    const instruction = this.getSystemInstruction(role, RAG_CONTEXT_MOCK);
    
    // Construct config dynamically to avoid passing undefined properties
    const config: any = {
      systemInstruction: instruction,
      temperature: 0.7,
    };

    // Only add tools if this is an admin role
    if (role !== 'student') {
      config.tools = [{ functionDeclarations: adminTools }];
    }

    return this.ai.chats.create({
      model: this.modelName,
      config: config
    });
  }

  public async sendMessage(chat: Chat, message: string): Promise<{text: string, toolCalls?: any[]}> {
    try {
      // Ensure message is passed as an object as per strict guidelines
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      
      // Handle Tool Calls (MCP Simulation)
      if (response.functionCalls && response.functionCalls.length > 0) {
        const toolCalls = response.functionCalls;
        const toolResponses = [];

        for (const call of toolCalls) {
          let result: any = {};
          const args = call.args as any;

          try {
             if (call.name === 'getSchoolStats') {
                const school = await databaseService.getSchoolById(args.schoolId || 'sch_A');
                result = { students: school?.studentCount || 0, status: school?.status || 'unknown' };
             } 
             else if (call.name === 'resetUserPassword') {
                result = { status: "success", newTempPassword: "ChangeMe123!" };
             } 
             else if (call.name === 'createClassroom') {
                const newClass = await databaseService.createClassroom(args.schoolId || 'sch_A', args.name);
                result = { id: newClass.id, name: newClass.name, status: "created" };
             }
          } catch (e) {
             console.error("Tool execution failed", e);
             result = { error: "Failed to execute tool" };
          }

          toolResponses.push({
            id: call.id,
            name: call.name,
            response: { result }
          });
        }

        // Send tool results back to the model to get the final text response
        const finalResponse = await chat.sendToolResponse({
           functionResponses: toolResponses
        });
        
        return {
          text: finalResponse.text || "Action completed.",
          toolCalls: toolCalls // Return this to UI to show "Action Performed" badge
        };
      }

      return { text: response.text || "I'm having trouble thinking right now." };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      // Provide a more user-friendly error message
      if (error.message && error.message.includes('500')) {
          return { text: "System temporarily unavailable (Error 500). Please check your connection or API key." };
      }
      return { text: "I encountered a connection error. Please try again." };
    }
  }
}

export const geminiService = new GeminiService();
