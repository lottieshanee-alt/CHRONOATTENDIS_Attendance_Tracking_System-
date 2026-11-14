export interface AuthUser {
  id: string;
  username: string;
  passwordHash: string; // Plain mock string for demo purposes; marked as mock
  name: string;
  email: string;
  department: string;
  initials: string;
  role: 'admin' | 'teacher';
}

// MOCK: Preconfigured mock credentials for demonstration & evaluation
// NOTE: This mock authentication layer is for evaluation only and does NOT provide production-grade security.
export const MOCK_USERS: AuthUser[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    passwordHash: 'admin123',
    name: 'Capt. Roberto M. Sian',
    email: 'r.sian@jblcf-bacolod.edu.ph',
    department: 'College of Maritime Education',
    initials: 'RS',
    role: 'admin',
  },
  {
    id: 'user-teacher-1',
    username: 'teacher',
    passwordHash: 'teacher123',
    name: '2/O Ramon S. Villanueva',
    email: 'r.villanueva@jblcf-bacolod.edu.ph',
    department: 'College of Maritime Education',
    initials: 'RV',
    role: 'teacher',
  },
];

