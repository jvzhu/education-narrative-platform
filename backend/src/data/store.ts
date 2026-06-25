import { v4 as uuidv4 } from 'uuid';

export type Role = 'admin' | 'educator' | 'student';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Narrative {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  authorId: string;
  likes: string[];
  bookmarks: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  narrativeId: string;
  authorId: string;
  content: string;
  parentId?: string;
  likes: string[];
  createdAt: string;
}

export interface Rating {
  id: string;
  narrativeId: string;
  authorId: string;
  score: number;
  review?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  narrativeId: string;
  userId: string;
  level: 'viewer' | 'editor';
  createdAt: string;
}

export interface FileMeta {
  id: string;
  narrativeId?: string;
  uploaderId: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
}

export const db = {
  users: [] as User[],
  narratives: [] as Narrative[],
  comments: [] as Comment[],
  ratings: [] as Rating[],
  permissions: [] as Permission[],
  files: [] as FileMeta[],
  activities: [] as Activity[]
};

export const now = () => new Date().toISOString();

export function logActivity(userId: string, action: string, resourceType: string, resourceId: string) {
  db.activities.push({ id: uuidv4(), userId, action, resourceType, resourceId, createdAt: now() });
}

export function resetStore() {
  db.users.length = 0;
  db.narratives.length = 0;
  db.comments.length = 0;
  db.ratings.length = 0;
  db.permissions.length = 0;
  db.files.length = 0;
  db.activities.length = 0;
}
