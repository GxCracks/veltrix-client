export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
export type LoginStatus = 'pending' | 'approved' | 'denied' | 'expired';

export type User = {
  id: string; veltrixUserId: string; minecraftUuid: string; minecraftUsername: string;
  role: UserRole; memberStatus: string; createdAt: Date; updatedAt: Date;
};
export type ClientSession = {
  id: string; userId: string; minecraftUuid: string; tokenHash: string; createdAt: Date;
  expiresAt: Date; lastSeen: Date; revokedAt: Date | null;
};
export type WebLoginRequest = {
  id: string; verificationCodeHash: string; codeCiphertext: string; minecraftUuid: string; userId: string;
  status: LoginStatus; createdAt: Date; expiresAt: Date; approvedAt: Date | null; deniedAt: Date | null; consumedAt: Date | null;
};
export type WebSession = {
  id: string; userId: string; tokenHash: string; csrfHash: string; createdAt: Date;
  expiresAt: Date; lastSeen: Date; revokedAt: Date | null;
};

export interface VeltrixStore {
  upsertUser(input: Pick<User, 'veltrixUserId' | 'minecraftUuid' | 'minecraftUsername'>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  createClientSession(session: ClientSession): Promise<void>;
  getClientSessionByHash(tokenHash: string): Promise<ClientSession | null>;
  findActiveClientSessionByUsername(username: string, onlineAfter: Date, now: Date): Promise<ClientSession | null>;
  touchClientSession(id: string, at: Date): Promise<void>;
  revokeClientSession(id: string, at: Date): Promise<void>;
  expirePendingWebLoginRequests(userId: string, at: Date): Promise<void>;
  createWebLoginRequest(request: WebLoginRequest): Promise<void>;
  getWebLoginRequest(id: string): Promise<WebLoginRequest | null>;
  listPendingWebLoginRequests(userId: string, now: Date): Promise<WebLoginRequest[]>;
  setWebLoginStatus(id: string, userId: string, status: 'approved' | 'denied', at: Date): Promise<boolean>;
  consumeApprovedWebLoginRequest(id: string, at: Date): Promise<WebLoginRequest | null>;
  createWebSession(session: WebSession): Promise<void>;
  getWebSessionByHash(tokenHash: string): Promise<WebSession | null>;
  updateWebSessionCsrf(id: string, csrfHash: string, at: Date): Promise<void>;
  revokeWebSession(id: string, at: Date): Promise<void>;
}
