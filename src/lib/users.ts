import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { UserProfile } from '@/types';

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: 'admin' | 'user';
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersStoreSchema {
  users: StoredUser[];
}

const PROJECT_DATA_DIR = path.join(process.cwd(), 'data');
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), 'cool-maxwell-data');

let USERS_DATA_DIR = PROJECT_DATA_DIR;
let USERS_FILE = path.join(USERS_DATA_DIR, 'users.json');

let inMemoryUsersCache: UsersStoreSchema | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 1500;

function resolveWritableUsersStore() {
  const candidates = [
    { dir: PROJECT_DATA_DIR, file: path.join(PROJECT_DATA_DIR, 'users.json') },
    { dir: FALLBACK_DATA_DIR, file: path.join(FALLBACK_DATA_DIR, 'users.json') },
  ];

  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate.dir)) {
        fs.mkdirSync(candidate.dir, { recursive: true });
      }
      fs.accessSync(candidate.dir, fs.constants.W_OK);
      USERS_DATA_DIR = candidate.dir;
      USERS_FILE = candidate.file;
      return;
    } catch {
      // Continue to next candidate
    }
  }

  USERS_DATA_DIR = FALLBACK_DATA_DIR;
  USERS_FILE = path.join(FALLBACK_DATA_DIR, 'users.json');
  if (!fs.existsSync(USERS_DATA_DIR)) {
    fs.mkdirSync(USERS_DATA_DIR, { recursive: true });
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function ensureUsersDbExists(): UsersStoreSchema {
  const now = Date.now();
  if (inMemoryUsersCache && now - lastCacheTime < CACHE_TTL_MS) {
    return inMemoryUsersCache;
  }

  resolveWritableUsersStore();

  if (!fs.existsSync(USERS_DATA_DIR)) {
    fs.mkdirSync(USERS_DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    const initialData: UsersStoreSchema = {
      users: [],
    };
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch {}
    inMemoryUsersCache = initialData;
    lastCacheTime = now;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = [];
    }
    inMemoryUsersCache = parsed;
    lastCacheTime = now;
    return parsed;
  } catch {
    const initialData: UsersStoreSchema = { users: [] };
    inMemoryUsersCache = initialData;
    lastCacheTime = now;
    return initialData;
  }
}

function saveUsersDb(data: UsersStoreSchema): void {
  inMemoryUsersCache = data;
  lastCacheTime = Date.now();
  try {
    resolveWritableUsersStore();
    if (!fs.existsSync(USERS_DATA_DIR)) {
      fs.mkdirSync(USERS_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Ignore write failure on read-only serverless lambdas
  }
}

export const usersDb = {
  getAll: (): StoredUser[] => {
    const { users } = ensureUsersDbExists();
    return users;
  },

  findByEmail: (email: string): StoredUser | undefined => {
    const cleanEmail = email.trim().toLowerCase();
    const { users } = ensureUsersDbExists();
    return users.find((u) => u.email.toLowerCase() === cleanEmail);
  },

  findById: (id: string): StoredUser | undefined => {
    const { users } = ensureUsersDbExists();
    return users.find((u) => u.id === id);
  },

  create: (data: {
    id?: string;
    email: string;
    password?: string;
    fullName?: string;
    role?: 'admin' | 'user';
    avatarUrl?: string;
  }): StoredUser => {
    const current = ensureUsersDbExists();
    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if user already exists
    const existingIndex = current.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = data.password ? hashPassword(data.password, salt) : '';
    
    const isFirstUser = current.users.length === 0;
    const isAdmin =
      data.role === 'admin' ||
      cleanEmail.includes('admin') ||
      cleanEmail === 'taxwiseplatform@gmail.com' ||
      cleanEmail === 'princefredkent@gmail.com' ||
      isFirstUser;

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: data.id || `user_${crypto.randomUUID()}`,
      email: cleanEmail,
      fullName: data.fullName || cleanEmail.split('@')[0] || 'User',
      avatarUrl:
        data.avatarUrl ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: isAdmin ? 'admin' : 'user',
      passwordHash,
      salt,
      createdAt: existingIndex >= 0 ? current.users[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      // Retain existing password hash if new one is not provided
      if (!data.password && current.users[existingIndex].passwordHash) {
        newUser.passwordHash = current.users[existingIndex].passwordHash;
        newUser.salt = current.users[existingIndex].salt;
      }
      current.users[existingIndex] = newUser;
    } else {
      current.users.unshift(newUser);
    }

    saveUsersDb(current);
    return newUser;
  },

  verifyPassword: (user: StoredUser, passwordAttempt: string): boolean => {
    if (!user.passwordHash || !user.salt) {
      return true; // Passwordless / Supabase synced account
    }
    const attemptHash = hashPassword(passwordAttempt, user.salt);
    return crypto.timingSafeEqual(
      Buffer.from(attemptHash, 'hex'),
      Buffer.from(user.passwordHash, 'hex')
    );
  },

  update: (
    id: string,
    updates: Partial<Pick<StoredUser, 'fullName' | 'avatarUrl' | 'role'>> & { password?: string }
  ): StoredUser | null => {
    const current = ensureUsersDbExists();
    const index = current.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const user = current.users[index];
    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.password) {
      user.salt = crypto.randomBytes(16).toString('hex');
      user.passwordHash = hashPassword(updates.password, user.salt);
    }
    user.updatedAt = new Date().toISOString();

    current.users[index] = user;
    saveUsersDb(current);
    return user;
  },

  toProfile: (user: StoredUser): UserProfile => {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  },
};
