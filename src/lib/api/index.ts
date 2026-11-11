// Re-exports the active API adapter.
// Swap this single import for a real HTTP adapter later.
export { mockAdapter as api } from './mock-adapter';
export type { AttendanceApi, UserProfile } from './types';
export { DEFAULT_PROFILE } from './types';

