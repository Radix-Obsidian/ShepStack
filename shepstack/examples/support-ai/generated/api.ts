// Generated API client for SupportAI
// DO NOT EDIT - regenerate from .shep file

import type { Company, KnowledgeBase, Conversation, Message, Escalation } from "./types";

const API_BASE = process.env.API_URL || "http://localhost:3001/api";

// Company API
export const companyApi = {
  getAll: async (): Promise<Company[]> => {
    const res = await fetch(`${API_BASE}/companys`);
    return res.json();
  },
  
  getById: async (id: string): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companys/${id}`);
    return res.json();
  },
  
  create: async (data: Omit<Company, "id">): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: Partial<Company>): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companys/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/companys/${id}`, { method: "DELETE" });
  },
};

// KnowledgeBase API
export const knowledgebaseApi = {
  getAll: async (): Promise<KnowledgeBase[]> => {
    const res = await fetch(`${API_BASE}/knowledgebases`);
    return res.json();
  },
  
  getById: async (id: string): Promise<KnowledgeBase> => {
    const res = await fetch(`${API_BASE}/knowledgebases/${id}`);
    return res.json();
  },
  
  create: async (data: Omit<KnowledgeBase, "id">): Promise<KnowledgeBase> => {
    const res = await fetch(`${API_BASE}/knowledgebases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: Partial<KnowledgeBase>): Promise<KnowledgeBase> => {
    const res = await fetch(`${API_BASE}/knowledgebases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/knowledgebases/${id}`, { method: "DELETE" });
  },
};

// Conversation API
export const conversationApi = {
  getAll: async (): Promise<Conversation[]> => {
    const res = await fetch(`${API_BASE}/conversations`);
    return res.json();
  },
  
  getById: async (id: string): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    return res.json();
  },
  
  create: async (data: Omit<Conversation, "id">): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/conversations/${id}`, { method: "DELETE" });
  },
};

// Message API
export const messageApi = {
  getAll: async (): Promise<Message[]> => {
    const res = await fetch(`${API_BASE}/messages`);
    return res.json();
  },
  
  getById: async (id: string): Promise<Message> => {
    const res = await fetch(`${API_BASE}/messages/${id}`);
    return res.json();
  },
  
  create: async (data: Omit<Message, "id">): Promise<Message> => {
    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: Partial<Message>): Promise<Message> => {
    const res = await fetch(`${API_BASE}/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/messages/${id}`, { method: "DELETE" });
  },
};

// Escalation API
export const escalationApi = {
  getAll: async (): Promise<Escalation[]> => {
    const res = await fetch(`${API_BASE}/escalations`);
    return res.json();
  },
  
  getById: async (id: string): Promise<Escalation> => {
    const res = await fetch(`${API_BASE}/escalations/${id}`);
    return res.json();
  },
  
  create: async (data: Omit<Escalation, "id">): Promise<Escalation> => {
    const res = await fetch(`${API_BASE}/escalations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  update: async (id: string, data: Partial<Escalation>): Promise<Escalation> => {
    const res = await fetch(`${API_BASE}/escalations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/escalations/${id}`, { method: "DELETE" });
  },
};

