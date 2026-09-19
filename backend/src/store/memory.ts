import { randomUUID } from 'node:crypto';
import type {
  ClientSession,
  Cosmetic,
  OwnedCosmetic,
  User,
  VeltrixStore,
  WebLoginRequest,
  WebSession,
} from './types.js';

const dragon: Cosmetic = {
  id: 'veltrix_dragon',
  name: 'VELTRIX Dragon',
  description: 'A cute little Veltrix Dragon that sits on your shoulder and accompanies you throughout Minecraft.',
  categories: ['Pets', 'Shoulder Cosmetics'],
  slot: 'shoulder',
  rarity: 'LEGENDARY',
  priceCents: 499,
  currency: 'EUR',
  preview: 'assets/cosmetics/veltrix-dragon.svg',
  modelId: 'veltrix_dragon',
  enabled: true,
  purchasable: false,
  limited: false,
  featured: true,
  createdAt: new Date('2026-09-19T00:00:00Z'),
};

type OwnedRecord = {
  cosmeticId: string;
  equipped: boolean;
  purchasedAt: Date;
  source: string;
};

export class MemoryStore implements VeltrixStore {
  private readonly users = new Map<string, User>();
  private readonly clientSessions = new Map<string, ClientSession>();
  private readonly webLoginRequests = new Map<string, WebLoginRequest>();
  private readonly webSessions = new Map<string, WebSession>();
  private readonly cosmetics = new Map<string, Cosmetic>([[dragon.id, dragon]]);
  private readonly owned = new Map<string, OwnedRecord>();

  private ownershipKey(userId: string, cosmeticId: string): string {
    return `${userId}:${cosmeticId}`;
  }

  async upsertUser(input: Pick<User, 'veltrixUserId' | 'minecraftUuid' | 'minecraftUsername'>): Promise<User> {
    const existing = [...this.users.values()].find(
      user => user.veltrixUserId === input.veltrixUserId || user.minecraftUuid === input.minecraftUuid,
    );
    const now = new Date();
    if (existing) {
      Object.assign(existing, input, { updatedAt: now });
      return { ...existing };
    }
    const user: User = {
      id: randomUUID(),
      ...input,
      role: 'USER',
      memberStatus: 'Member',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return { ...user };
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async createClientSession(session: ClientSession): Promise<void> {
    this.clientSessions.set(session.id, { ...session });
  }

  async getClientSessionByHash(tokenHash: string): Promise<ClientSession | null> {
    const session = [...this.clientSessions.values()].find(value => value.tokenHash === tokenHash);
    return session ? { ...session } : null;
  }

  async findActiveClientSessionByUsername(username: string, onlineAfter: Date, now: Date): Promise<ClientSession | null> {
    const user = [...this.users.values()].find(value => value.minecraftUsername.toLowerCase() === username.toLowerCase());
    if (!user) return null;
    const session = [...this.clientSessions.values()]
      .filter(value => value.userId === user.id && !value.revokedAt && value.expiresAt > now && value.lastSeen >= onlineAfter)
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())[0];
    return session ? { ...session } : null;
  }

  async hasActiveClientSession(userId: string, onlineAfter: Date, now: Date): Promise<boolean> {
    return [...this.clientSessions.values()].some(
      value => value.userId === userId && !value.revokedAt && value.expiresAt > now && value.lastSeen >= onlineAfter,
    );
  }

  async touchClientSession(id: string, at: Date): Promise<void> {
    const session = this.clientSessions.get(id);
    if (session) session.lastSeen = at;
  }

  async revokeClientSession(id: string, at: Date): Promise<void> {
    const session = this.clientSessions.get(id);
    if (session) session.revokedAt = at;
  }

  async expirePendingWebLoginRequests(userId: string, _at: Date): Promise<void> {
    for (const request of this.webLoginRequests.values()) {
      if (request.userId === userId && request.status === 'pending') request.status = 'expired';
    }
  }

  async createWebLoginRequest(request: WebLoginRequest): Promise<void> {
    this.webLoginRequests.set(request.id, { ...request });
  }

  async getWebLoginRequest(id: string): Promise<WebLoginRequest | null> {
    const request = this.webLoginRequests.get(id);
    return request ? { ...request } : null;
  }

  async listPendingWebLoginRequests(userId: string, now: Date): Promise<WebLoginRequest[]> {
    return [...this.webLoginRequests.values()]
      .filter(request => request.userId === userId && request.status === 'pending' && request.expiresAt > now)
      .map(request => ({ ...request }));
  }

  async setWebLoginStatus(id: string, userId: string, status: 'approved' | 'denied', at: Date): Promise<boolean> {
    const request = this.webLoginRequests.get(id);
    if (!request || request.userId !== userId || request.status !== 'pending' || request.expiresAt <= at) return false;
    request.status = status;
    if (status === 'approved') request.approvedAt = at;
    else request.deniedAt = at;
    return true;
  }

  async consumeApprovedWebLoginRequest(id: string, at: Date): Promise<WebLoginRequest | null> {
    const request = this.webLoginRequests.get(id);
    if (!request || request.status !== 'approved' || request.consumedAt || request.expiresAt <= at) return null;
    request.consumedAt = at;
    return { ...request };
  }

  async createWebSession(session: WebSession): Promise<void> {
    this.webSessions.set(session.id, { ...session });
  }

  async getWebSessionByHash(tokenHash: string): Promise<WebSession | null> {
    const session = [...this.webSessions.values()].find(value => value.tokenHash === tokenHash);
    return session ? { ...session } : null;
  }

  async updateWebSessionCsrf(id: string, csrfHash: string, at: Date): Promise<void> {
    const session = this.webSessions.get(id);
    if (session) {
      session.csrfHash = csrfHash;
      session.lastSeen = at;
    }
  }

  async revokeWebSession(id: string, at: Date): Promise<void> {
    const session = this.webSessions.get(id);
    if (session) session.revokedAt = at;
  }

  async listCosmetics(): Promise<Cosmetic[]> {
    return [...this.cosmetics.values()]
      .filter(cosmetic => cosmetic.enabled)
      .map(cosmetic => ({ ...cosmetic, categories: [...cosmetic.categories] }));
  }

  async getCosmetic(id: string): Promise<Cosmetic | null> {
    const cosmetic = this.cosmetics.get(id);
    return cosmetic ? { ...cosmetic, categories: [...cosmetic.categories] } : null;
  }

  async listOwnedCosmetics(userId: string): Promise<OwnedCosmetic[]> {
    const result: OwnedCosmetic[] = [];
    const prefix = `${userId}:`;
    for (const [key, record] of this.owned) {
      if (!key.startsWith(prefix)) continue;
      const cosmetic = this.cosmetics.get(record.cosmeticId);
      if (!cosmetic) continue;
      result.push({
        ...cosmetic,
        categories: [...cosmetic.categories],
        owned: true,
        equipped: record.equipped,
        purchasedAt: record.purchasedAt,
        source: record.source,
      });
    }
    return result;
  }

  async grantCosmetic(userId: string, cosmeticId: string, source: 'purchase' | 'admin_grant' | 'beta_reward' | 'promo'): Promise<boolean> {
    if (!this.cosmetics.has(cosmeticId)) return false;
    const key = this.ownershipKey(userId, cosmeticId);
    if (!this.owned.has(key)) {
      this.owned.set(key, { cosmeticId, equipped: false, purchasedAt: new Date(), source });
    }
    return true;
  }

  async equipCosmetic(userId: string, cosmeticId: string): Promise<'ok' | 'not_owned' | 'not_found'> {
    const cosmetic = this.cosmetics.get(cosmeticId);
    if (!cosmetic) return 'not_found';
    const owned = this.owned.get(this.ownershipKey(userId, cosmeticId));
    if (!owned) return 'not_owned';

    const prefix = `${userId}:`;
    for (const [key, record] of this.owned) {
      if (!key.startsWith(prefix)) continue;
      const otherCosmetic = this.cosmetics.get(record.cosmeticId);
      if (otherCosmetic?.slot === cosmetic.slot) record.equipped = false;
    }
    owned.equipped = true;
    return 'ok';
  }

  async unequipCosmetic(userId: string, cosmeticId: string): Promise<'ok' | 'not_owned' | 'not_found'> {
    if (!this.cosmetics.has(cosmeticId)) return 'not_found';
    const owned = this.owned.get(this.ownershipKey(userId, cosmeticId));
    if (!owned) return 'not_owned';
    owned.equipped = false;
    return 'ok';
  }
}
