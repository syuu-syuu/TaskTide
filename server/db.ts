import {Collection, Db, MongoClient, ObjectId} from "mongodb"
import {Project, ProjectMember, Task, User, mongodbUrl, TaskLock } from "./data"


// Create a MongoClient instance to connect to the database
const client = new MongoClient(mongodbUrl)
// Define a variable db of type Db to store the database connection instance
let db: Db
let connectionPromise: Promise<Db> | null = null; 

export async function initDatabaseConnection() {
  if (db) {
    return db
  }
  if (!connectionPromise) {
    db = client.db("test");
    console.log("✅ Connected successfully to MongoDB server");
    console.log("✅ Established access to the 'test' database");
    return db;
  }
  return connectionPromise;
}

export const projects = new (class {
  private collection: Collection<Project>;

  constructor() {
    initDatabaseConnection().then((db) => {
      this.collection = db.collection("projects");
      console.log("✅ Collection 'projects' ready");
    });
  }

  async createDefaultProject(userId: string) {
    // Look for default project with type "Quick"
    const defaultProjectExists = await this.collection.findOne({
      type: "Quick",
      ownerId: userId
    });

    if (!defaultProjectExists) {
      await this.collection.insertOne({
        _id: new ObjectId(),
        title: "Quick Tasks",
        ownerId: userId,
        isStarred: false,
        type: "Quick",
        createdAt: new Date()
      });
      console.log("✅ Default project 'Quick Tasks' created for owner ID: " + userId);
    }
  }

  // Will fetch all projects if type not provided
  async getProjectsByOwnerIdAndType(ownerId: string, type: string) {
    let query: { [key: string]: any } = { ownerId };
    if (type && type !== "All") {
        query['type'] = type;
    }
    return this.collection
        .find(query)
        .toArray();
}

  async getProjectByProjectId(projectId: string) {
    return await this.collection.findOne({
      _id: new ObjectId(projectId)
    })
  }

  async upsertProject(project: Partial<Project>) {
    const { _id, ownerId, members, title, isStarred, type } = project;
    const updateData = {
      $set: {
        title,
        isStarred,
        type
      },
      $setOnInsert: {
        ownerId,
        members, 
        createdAt: new Date()
      }
    };

    const query = { _id: _id ? new ObjectId(_id) : new ObjectId() };
    const options = { upsert: true };

    return await this.collection.updateOne(
      query,
      updateData,
      options
    );
  }

  async editMemberIds(projectId: string, members: ProjectMember[]) {
    return await this.collection.updateOne(
      { _id: new ObjectId(projectId)}, 
      { $set: { members }})
  }

  async deleteProject(projectId: string) {
    return await this.collection.deleteOne({ _id: new ObjectId(projectId) });
  }

})();

export const tasks = new (class {
  private collection: Collection<Task>;

  constructor() {
    initDatabaseConnection().then((db) => {
      this.collection = db.collection("tasks");
      console.log("✅ Collection 'tasks' ready");
    });
  }

  async getTasksByProjectId(projectId: string) {
    return await this.collection.find({
      projectId: projectId
    }).toArray();
  }


  async upsertTask(task: Partial<Task>) {
    const { _id, createdAt, creatorId, projectId, ...taskData } = task;
    const updateData = {
      $set: taskData,
      $setOnInsert: {
        projectId: projectId, 
        createdAt: new Date(), 
        creatorId: creatorId
      }
    };
    const query = { _id: _id ? new ObjectId(_id) : new ObjectId() };
    const options = { upsert: true };
    return await this.collection.updateOne(
      query,
      updateData,
      options
    );
  }

  async deleteTask(taskId: string) {
    return await this.collection.deleteOne({ _id: new ObjectId(taskId) });
  }

})();


export const users = new (class {
  private collection: Collection<User>;

  constructor() {
    initDatabaseConnection().then((db) => {
      this.collection = db.collection("users");
      console.log("✅ Collection 'users' ready");
    });
  }

  async upsertUser(user: User) {
    const { _id, ...userData } = user;
    const result = await this.collection.updateOne(
      { _id }, 
      { $set: userData }, 
      { upsert: true }
    );
    console.log(`Upserted user with ID: ${_id}`);
    if (result.upsertedId) {
      console.log("Created new document with ID:", result.upsertedId);
    } else {
      console.log("Updated existing document");
    }
    return _id;
  }

  async findUserById(userId: string) {
    return this.collection.findOne({ _id: userId });
  }

  async deleteUserById(userId: string) {
    return await this.collection.deleteOne({ _id: userId });
  }
})();


export const taskLocks = new (class {
   private collection: Collection<TaskLock>;

    constructor() {
        initDatabaseConnection().then((db) => {
            this.collection = db.collection("taskLocks");
            console.log("✅ Collection 'taskLocks' ready");
        });
    }

    async lockTask(taskId: string, userId: string): Promise<boolean> {
       const result = await this.collection.updateOne(
          { taskId: taskId },
          {
              $set: {
                  userId: userId,
                  lockedAt: new Date()
              }
          },
          { upsert: true }
        );

        return result.modifiedCount > 0 || result.upsertedCount > 0;
    }

    async unlockTask(taskId: string, userId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ taskId: taskId, userId: userId });
        return result.deletedCount === 1;
    }

    async isTaskLockedByAnotherUser(taskId: string, userId: string): Promise<boolean> {
        const lock = await this.collection.findOne({ taskId: taskId });
        return lock && lock.userId !== userId;
    }

    async unlockAllTasksByUser(userId: string): Promise<void> {
        const result = await this.collection.deleteMany({ userId: userId });
        console.log(`Unlocked all tasks held by user ${userId}, count: ${result.deletedCount}`);
    }

    async getTasksLockedByUser(userId: string): Promise<string[]> {
        const locks = await this.collection.find({ userId: userId }).toArray();
        return locks.map(lock => lock.taskId);
    }
})()
