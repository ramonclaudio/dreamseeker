/**
 * Notifications public API.
 *
 * Implementation split across:
 *   notificationsTokens.ts  - Token CRUD
 *   notificationsSend.ts    - Sending logic
 *   notificationsReceipts.ts - Receipt management
 *
 * This module re-exports the public surface for backwards compatibility.
 * Internal functions are referenced directly via `internal.notificationsTokens.*`, etc.
 */

// ── Token management (public mutations) ─────────────────────────────────────
export { savePushToken, removePushToken } from './notificationsTokens';

// ── Sending (public actions) ────────────────────────────────────────────────
export { sendPushNotification, sendTestNotification } from './notificationsSend';

