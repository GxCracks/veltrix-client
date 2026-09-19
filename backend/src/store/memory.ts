import { randomUUID } from 'node:crypto';
import type { ClientSession, User, VeltrixStore } from './types.js';

export class MemoryStore implements VeltrixStore {
  private readonly users = new Map<string, User>();
  private readonly clientSessions = new Map<string, ClientSession>();

  async upsertUser(input: Pick<User, 'veltrixUserId' | 'minecraftUuid' | 'minecraftUsername'>): Promise<User> {
    const existing = [...this.users.values()].find(user => user.veltrixUserId === input.veltrixUserId || user.minecraftUuid === input.minecraftUuid);
    const now = new Date();
    if (existing) {
      existing.veltrixUserId = input.veltrixUserId;
      existing.minecraftUuid = input.minecraftUuid;
      existing.minecraftUsername = input.minecraftUsername;
      existing.updatedAt = now;
      return { ...existing };
    }
    const user: User = { id: randomUUID(), ...input, role: 'USER', memberStatus: 'Member', createdAt: now, updatedAt: now };
    this.users.set(user.id, user);
    return { ...user };
  }

  async createClientSession(session: ClientSession): Promise<void> {
    this.clientSessions.set(session.id, { ...session });
  }

  async getClientSessionByHash(tokenHash: string): Promise<ClientSession | null> {
    const value = [...this.clientSessions.values()].find(session => session.tokenHash === tokenHash);
    return value ? { ...value } : null;
  }

  async touchClientSession(id: string, at: Date): Promise<void> {
    const session = this.clientSessions.get(id);
    if (session) session.lastSeen = at;
  }

  async revokeClientSession(id: string, at: Date): Promise<void> {
    const session = this.clientSessions.get(id);
    if (session) session.revokedAt = at;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }
}
