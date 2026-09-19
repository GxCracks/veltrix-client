import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { ClientSession, User, VeltrixStore } from './types.js';

function toUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    veltrixUserId: String(row.veltrix_user_id),
    minecraftUuid: String(row.minecraft_uuid),
    minecraftUsername: String(row.minecraft_username),
    role: String(row.role) as User['role'],
    memberStatus: String(row.member_status),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at))
  };
}

function toClientSession(row: Record<string, unknown>): ClientSession {
  return {
    id: String(row.id), userId: String(row.user_id), minecraftUuid: String(row.minecraft_uuid), tokenHash: String(row.token_hash),
    createdAt: new Date(String(row.created_at)), expiresAt: new Date(String(row.expires_at)), lastSeen: new Date(String(row.last_seen)),
    revokedAt: row.revoked_at ? new Date(String(row.revoked_at)) : null
  };
}

export class PostgresStore implements VeltrixStore {
  constructor(private readonly pool: Pool) {}

  async upsertUser(input: Pick<User, 'veltrixUserId' | 'minecraftUuid' | 'minecraftUsername'>): Promise<User> {
    const existing = await this.pool.query('SELECT * FROM users WHERE veltrix_user_id=$1 OR minecraft_uuid=$2 LIMIT 1', [input.veltrixUserId, input.minecraftUuid]);
    if (existing.rowCount) {
      const id = String(existing.rows[0].id);
      const updated = await this.pool.query('UPDATE users SET veltrix_user_id=$1,minecraft_uuid=$2,minecraft_username=$3,updated_at=NOW() WHERE id=$4 RETURNING *', [input.veltrixUserId,input.minecraftUuid,input.minecraftUsername,id]);
      return toUser(updated.rows[0]);
    }
    const inserted = await this.pool.query('INSERT INTO users(id,veltrix_user_id,minecraft_uuid,minecraft_username) VALUES($1,$2,$3,$4) RETURNING *', [randomUUID(),input.veltrixUserId,input.minecraftUuid,input.minecraftUsername]);
    return toUser(inserted.rows[0]);
  }

  async createClientSession(session: ClientSession): Promise<void> {
    await this.pool.query('INSERT INTO client_sessions(id,user_id,minecraft_uuid,token_hash,created_at,expires_at,last_seen,revoked_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [session.id,session.userId,session.minecraftUuid,session.tokenHash,session.createdAt,session.expiresAt,session.lastSeen,session.revokedAt]);
  }

  async getClientSessionByHash(tokenHash: string): Promise<ClientSession | null> {
    const result = await this.pool.query('SELECT * FROM client_sessions WHERE token_hash=$1 LIMIT 1', [tokenHash]);
    return result.rowCount ? toClientSession(result.rows[0]) : null;
  }

  async touchClientSession(id: string, at: Date): Promise<void> { await this.pool.query('UPDATE client_sessions SET last_seen=$1 WHERE id=$2', [at,id]); }
  async revokeClientSession(id: string, at: Date): Promise<void> { await this.pool.query('UPDATE client_sessions SET revoked_at=$1 WHERE id=$2 AND revoked_at IS NULL', [at,id]); }
  async getUserById(id: string): Promise<User | null> { const r=await this.pool.query('SELECT * FROM users WHERE id=$1 LIMIT 1',[id]); return r.rowCount?toUser(r.rows[0]):null; }
}
