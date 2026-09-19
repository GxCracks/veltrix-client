export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';

export type User = {
  id: string;
  veltrixUserId: string;
  minecraftUuid: string;
  minecraftUsername: string;
  role: UserRole;
  memberStatus: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientSession = {
  id: string;
  userId: string;
  minecraftUuid: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  lastSeen: Date;
  revokedAt: Date | null;
};

export interface VeltrixStore {
  upsertUser(input: Pick<User, 'veltrixUserId' | 'minecraftUuid' | 'minecraftUsername'>): Promise<User>;
  createClientSession(session: ClientSession): Promise<void>;
  getClientSessionByHash(tokenHash: string): Promise<ClientSession | null>;
  touchClientSession(id: string, at: Date): Promise<void>;
  revokeClientSession(id: string, at: Date): Promise<void>;
  getUserById(id: string): Promise<User | null>;
}
