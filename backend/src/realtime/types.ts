export type RealtimeEventType =
  | 'web_login_request'
  | 'web_login_approved'
  | 'web_login_denied'
  | 'cosmetic_owned'
  | 'cosmetic_equipped'
  | 'cosmetic_unequipped'
  | 'account_updated'
  | 'session_revoked';

export interface RealtimePublisher {
  publish(userId: string, type: RealtimeEventType, payload: Record<string, unknown>): void;
}

export const noRealtime: RealtimePublisher = {
  publish() {},
};
