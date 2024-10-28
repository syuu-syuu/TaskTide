import express from 'express'
import {buildSchema} from "graphql";
import {createHandler} from "graphql-http/lib/use/express";
import {projects, tasks} from "./db";
const router = express.Router()

const schema = buildSchema(`
schema {
    query: Query
}

scalar User
scalar QuickTask

type Query {
    user: User,
    quickTask: [QuickTask]
}
`)

const root = {
  user(args: any, context: any) {
    return context.user
  },
  async quickTask(args: any, context: any) {
    const quickProjects = await projects.getProjectsByOwnerIdAndType((context.user as any)._id, 'Quick');
    const project = quickProjects[0]
    return tasks.getTasksByProjectId(project._id.toString());
  }
}

router.all(
  "/",
  (req, res, next) => {
    createHandler({
      schema,
      rootValue: root,
      context() {
        return {
          user: req.user || {}
        }
      }
    })(req, res, next)
  }
)

export default router;