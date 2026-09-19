import { randomUUID } from 'node:crypto';
import type { ClientSession, User, VeltrixStore, WebLoginRequest, WebSession } from './types.js';

export class MemoryStore implements VeltrixStore {
  private readonly users = new Map<string, User>();
  private readonly clientSessions = new Map<string, ClientSession>();
  private readonly webLoginRequests = new Map<string, WebLoginRequest>();
  private readonly webSessions = new Map<string, WebSession>();

  async upsertUser(input: Pick<User, 'veltrixUserId' | 'minecraftUuid' | 'minecraftUsername'>): Promise<User> {
    const existing = [...this.users.values()].find(user => user.veltrixUserId === input.veltrixUserId || user.minecraftUuid === input.minecraftUuid);
    const now = new Date();
    if (existing) { Object.assign(existing, input, { updatedAt: now }); return { ...existing }; }
    const user: User = { id: randomUUID(), ...input, role: 'USER', memberStatus: 'Member', createdAt: now, updatedAt: now };
    this.users.set(user.id, user); return { ...user };
  }
  async getUserById(id: string): Promise<User | null> { const user=this.users.get(id); return user?{...user}:null; }
  async createClientSession(session: ClientSession): Promise<void> { this.clientSessions.set(session.id,{...session}); }
  async getClientSessionByHash(tokenHash: string): Promise<ClientSession | null> { const s=[...this.clientSessions.values()].find(v=>v.tokenHash===tokenHash); return s?{...s}:null; }
  async findActiveClientSessionByUsername(username: string, onlineAfter: Date, now: Date): Promise<ClientSession | null> {
    const user=[...this.users.values()].find(v=>v.minecraftUsername.toLowerCase()===username.toLowerCase()); if(!user)return null;
    const s=[...this.clientSessions.values()].filter(v=>v.userId===user.id&&!v.revokedAt&&v.expiresAt>now&&v.lastSeen>=onlineAfter).sort((a,b)=>b.lastSeen.getTime()-a.lastSeen.getTime())[0];
    return s?{...s}:null;
  }
  async touchClientSession(id:string,at:Date){const s=this.clientSessions.get(id);if(s)s.lastSeen=at;}
  async revokeClientSession(id:string,at:Date){const s=this.clientSessions.get(id);if(s)s.revokedAt=at;}
  async expirePendingWebLoginRequests(userId:string,at:Date){for(const r of this.webLoginRequests.values())if(r.userId===userId&&r.status==='pending')r.status='expired';}
  async createWebLoginRequest(request:WebLoginRequest){this.webLoginRequests.set(request.id,{...request});}
  async getWebLoginRequest(id:string){const r=this.webLoginRequests.get(id);return r?{...r}:null;}
  async listPendingWebLoginRequests(userId:string,now:Date){return [...this.webLoginRequests.values()].filter(r=>r.userId===userId&&r.status==='pending'&&r.expiresAt>now).map(r=>({...r}));}
  async setWebLoginStatus(id:string,userId:string,status:'approved'|'denied',at:Date){const r=this.webLoginRequests.get(id);if(!r||r.userId!==userId||r.status!=='pending'||r.expiresAt<=at)return false;r.status=status;if(status==='approved')r.approvedAt=at;else r.deniedAt=at;return true;}
  async consumeApprovedWebLoginRequest(id:string,at:Date){const r=this.webLoginRequests.get(id);if(!r||r.status!=='approved'||r.consumedAt||r.expiresAt<=at)return null;r.consumedAt=at;return {...r};}
  async createWebSession(session:WebSession){this.webSessions.set(session.id,{...session});}
  async getWebSessionByHash(tokenHash:string){const s=[...this.webSessions.values()].find(v=>v.tokenHash===tokenHash);return s?{...s}:null;}
  async updateWebSessionCsrf(id:string,csrfHash:string,at:Date){const s=this.webSessions.get(id);if(s){s.csrfHash=csrfHash;s.lastSeen=at;}}
  async revokeWebSession(id:string,at:Date){const s=this.webSessions.get(id);if(s)s.revokedAt=at;}
}
