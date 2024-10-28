import { Server as SocketIOServer, Socket } from 'socket.io';
import { Task, User } from './data';  
import { tasks, projects, taskLocks } from './db';
import { addGitlabGroup, addMembertoGroup } from "./gitlab"
import { setupRedis } from "./redis"

export class SocketManager {
    private io: SocketIOServer;

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    async initialize() {
        const { socketIoAdapter: adapter } = await setupRedis();
        this.io.adapter(adapter);
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.io.on('connection', (socket: Socket) => {
            const user = (socket.request as any).session?.passport?.user;
            if (!user) {
                 socket.emit('redirect', '/');
                } 

            console.log('🔗 User', user._id, 'connected with socket ID', socket.id);

            socket.on('request-edit', (task: Partial<Task>, type: string) => {
                this.handleEditRequest(socket, task, type, user);
            });

            socket.on('submit-task', async (task) => {
                await this.handleTaskSubmission(socket, task, user);
            });

            socket.on('discard-edit', async (taskId) => {
                const unlocked = await taskLocks.unlockTask(taskId, user._id);
                if (unlocked) {
                    this.io.emit('unlock-task', taskId);
                    console.log(`Task ${taskId} unlocked by user ${user._id}`);
                } else {
                    console.log(`Failed to unlock Task ${taskId} or no lock held by user ${user._id}`);
                }
            });


            socket.on('disconnect', async () => {
                const lockedTasks = await taskLocks.getTasksLockedByUser(user._id);
                if (lockedTasks.length > 0) {
                    await taskLocks.unlockAllTasksByUser(user._id);
                    lockedTasks.forEach(taskId => {
                        this.io.emit('unlock-task', taskId);
                    });
                    console.log(`Unlocked all tasks held by user ${user._id} upon disconnection.`);
                }
            });


            socket.on('remove-task', async (taskId: string) => {
                await this.handleTaskRemoval(socket, taskId, user);
            });


            socket.on('submit-project', async (project) => {
                console.log("🔗 Received project submission for:", project);
                const result = await projects.upsertProject(project) 
                if (result.upsertedCount > 0) {
                    const projectId = result.upsertedId.toString(); 
                    console.log("Inserted project with id:", projectId)
                    try {
                    // const groupInfo = await addGitlabGroup({name: projectId, path: projectId})
                    // console.log("Group successfully added in GitLab:", groupInfo);
                    // await addMembertoGroup(groupInfo.id, user._id)
                    } catch (error){
                    console.error("Failed to add group in GitLab:", error.message);
                    }
                }
                this.io.emit('project-submitted', true);
                });

            socket.on('delete-project', async (project) => {
                console.log("🔗 Received delete request for:", project);
                await projects.deleteProject(project)    
                this.io.emit('project-deleted', true);
                });
            
    });
       
    }

    private async handleEditRequest(socket: Socket, task: Partial<Task>, type: string, user: User) {
         if (task._id) {
          const taskId = task._id.toString()
          const isLockedByAnother = await taskLocks.isTaskLockedByAnotherUser(taskId, user._id);
          console.log(`✔️ Update request received for ${type} task: ${task._id}`);
          console.log('Task is locked by other users?', isLockedByAnother);
          // Current task is private or is not locked by others
          if (type === "Private" || !isLockedByAnother) {
              // Lock the task and broadcast the locking state
              await taskLocks.lockTask(taskId, user._id);
              console.log(`🔏 Task ${taskId} is now locked by ${user._id}`);
              socket.broadcast.emit('lock-task', taskId, user._id);
          } else {
            // Need to be caught from front end
            socket.emit('reject-edit', taskId);
          }
        } else {
            console.log('✔️ Create request received for a new task');
            socket.emit('grant-edit', null, user._id);
        }  
    }

    private async handleTaskSubmission(socket: Socket, task: Partial<Task>, user: User) {
        console.log("🔗 Received task submission for:", task);
        if (!task._id) {
            // Handle new task creation
            task.creatorId = user._id;
            await tasks.upsertTask(task);
            console.log(`Task created successfully.`);
            this.io.emit('submit-result', true);
            return;
        } else {
            // Check if the task is locked by another user
            const isLockedByAnother = await taskLocks.isTaskLockedByAnotherUser(task._id.toString(), user._id);
            if (isLockedByAnother) {
                console.log(`Task ${task._id} is currently locked by another user.`);
                socket.emit('submit-result', false);
                return;
            } else {
                // Update task and unlock
                await tasks.upsertTask(task);
                await taskLocks.unlockTask(task._id.toString(), user._id);
                console.log(`Task ${task._id} updated and unlocked successfully.`);
                this.io.emit('submit-result', true);
                this.io.emit('unlock-task', task._id);  // Notify all clients that the task is now unlocked
            }
        }
    }


    private async handleTaskRemoval(socket: Socket, taskId: string, user: User) {
        console.log("Received request to remove task with ID:", taskId);
        
        if (!taskId) {
            console.error("Invalid task ID received for deletion.");
            socket.emit('remove-result', false, "Invalid task ID.");
            return;
        }

        // Check if the task is locked by another user
        const isLockedByAnother = await taskLocks.isTaskLockedByAnotherUser(taskId, user._id);
        if (isLockedByAnother) {
            console.error(`Deletion failed for task ${taskId}, locked by another user.`);
            socket.emit('remove-result', false);
            return;
        }

        try {
            // Delete task from the tasks collection
            await tasks.deleteTask(taskId);
            // Attempt to unlock the task
            await taskLocks.unlockTask(taskId, user._id);
            this.io.emit('remove-result', true);
            console.log(`Task ${taskId} removed successfully.`);
        } catch (error) {
            console.error(`Error removing task ${taskId}: ${error.message}`);
            socket.emit('remove-result', false);
        }
    }

}