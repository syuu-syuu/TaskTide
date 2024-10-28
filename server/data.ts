import { ObjectId } from 'mongodb';

export const DISABLE_SECURITY = process.env.DISABLE_SECURITY
export const passportStrategies = [...(process.env.DISABLE_SECURITY ? ["disable-security"] : []),"oidc",]

export const ADVANCED_GROUP_ID = 77164;
export const ADVANCED_GROUP_NAME = "lalala" // Advanced group name to be updated later to correspond with the GitLab group name.

export const mongodbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017"
// Production
// export const mongodbUrl = process.env.MONGO_URL || "mongodb://localhost:27017"

export const baseServerUrl = process.env.BASE_SERVER_URL || 'http://localhost:8171';
export const baseUIUrl = process.env.BASE_UI_URL || 'http://localhost:8170';
// // Production
// export const baseServerUrl = process.env.BASE_SERVER_URL || 'http://localhost:31001';
// export const baseUIUrl = process.env.BASE_UI_URL || 'http://localhost:31000';

export const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:8170/api/login-callback"
// Production
// export const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:31000/api/login-callback";


export interface User {
  _id?: string;
  email: string;
  name: string;
  preferred_username: string;
  picture: string;
  groups: string[];
  role: string;
}

export interface Task {
  _id?: ObjectId;
  projectId?: string; 
  title: string;
  description?: string;
  deadline?: Date;
  completed: boolean,
  status: "todo" | "in progress" | "done";
  creatorId: string;
  assigneeId?: string;
  createdAt?: Date; 
  completedAt?: Date; 
}

export interface Project {
  _id?: ObjectId;
  title: string;
  ownerId: string;
  members?: ProjectMember[]; 
  taskIds?: ObjectId[];
  isStarred: boolean;
  type: "Quick" | "Private" | "Shared";
  createdAt?: Date;
  gitlabGroupId?: number;
}

export interface ProjectMember{
  id: string;
  name: string;
}

export interface GitlabGroupParams {
  name: string;
  path: string;
  [key: string]: any; 
}


export interface SessionUser {
      _id: string;
      email: string;
      name: string;
      preferred_username: string;
      picture: string;
      groups: string[];
      role: string;
}


export interface TaskLock {
    taskId: string;
    userId: string;
    lockedAt: Date;
}
