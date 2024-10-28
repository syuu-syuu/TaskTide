export type ObjectId = string;

export interface DragEvent {
  oldIndex: number;
  newIndex: number;
}

export const defaultUser: User = {
  _id: 'sample_id',
  email: 'knowsnothing@duke.edu',
  name: 'Jon Snow',
  picture: 'https://img.freepik.com/premium-photo/jon-snow-game-thrones-cartoon-character-generative-ai_934475-8645.jpg?w=740',
  role: 'basic'
};

export type TaskStatus = "todo" | "in progress" | "done";
export const statuses: TaskStatus[] = ["todo", "in progress", "done"];

export const menuItems = [
  { icon: "icon-home", text: "Home", to: "/"},
  { icon: "icon-envelope", text: "Notification", to: "/" },
  { icon: "icon-clock", text: "Tide Clock", to: "/" }
]

export interface User {
  _id: string;
  email: string;
  name: string;
  picture: string;
  role: string;
}

export interface ProjectMember{
  id: string;
  name: string;
}

export interface Project {
  _id?: ObjectId;
  title: string;
  ownerId: string;
  members?: ProjectMember[]; 
  isStarred: boolean;
  type: "Quick" | "Private" | "Shared";
}

export interface Task {
  _id?: ObjectId;
  projectId: ObjectId; 
  title: string;
  description?: string;
  deadline?: Date;
  status?: "todo" | "in progress" | "done";
  creatorId?: string;
  assignee?: string;
  completed: boolean;
  createdAt?: Date; 
  completedAt?: Date; 
}

export async function getUserInfo() {
    const response = await (await fetch('/api/user/profile')).json();
    console.log("🎉 Successfully retrieved user information:", response);
    return response;
}

export async function upsertProject(newProject: Project) {
  const response = await (await fetch('/api/projects/upsert', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProject) 
    })).json();
  
    if (response.ok) {
      console.log(`🎉 ${ response.message }`)
    }
}

export async function upsertTask(newTask: Task) {
  const response = await (await fetch('/api/tasks/upsert', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask) 
    })).json();
  
    if (response.ok) {
      console.log(`🎉 ${ response.message }`)
    }
}


export async function getProjects(type: string) {
  const response = await(await fetch(`/api/projects/type/${type}`)).json();
  console.log(`🎉 Successfully retrieved current user's ${type} projects:`, response)
  return response
}

export async function getProjectByProjectId(projectId: ObjectId) {
  const response = await(await fetch(`/api/projects/id/${projectId}`)).json();
  console.log(`🎉 Successfully retrieved project (Id: ${projectId}):`, response)
  return response
}


export async function getTasksByProjectId(projectId: ObjectId | undefined) {
   const response = await (await fetch(`/api/tasks/${projectId}`)).json();
   console.log("🎉 Successfully retrieved current project's tasks:", response)
   return response;
}


export async function deleteTask(taskId: ObjectId) {
    await fetch(`/api/tasks/delete/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
}

export async function deleteProject(projectId: ObjectId) {
    await fetch(`/api/projects/delete/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
}

export async function getQuickTasks() {
    return  fetch('/api/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query:  "{ quickTask }"
        })
    }).then(res => res.json())
}
