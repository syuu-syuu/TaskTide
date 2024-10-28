import express, { Router, Request, Response } from 'express';
import { isLoggedIn } from './authentication';
import { projects } from './db'
import {ProjectMember} from "./data";
import {addMembertoGroup} from "./gitlab";

const router: Router = express.Router();

router.get('/type/:projectType', isLoggedIn, async (req: Request, res: Response) => {
    if (req.user) {
        const { _id } = req.user as any; 
        const { projectType } = req.params;
        const retrievedProjects = await projects.getProjectsByOwnerIdAndType(_id, projectType);
        console.log(`🔗 Returning current user's ${projectType} projects:`, retrievedProjects)
        res.json(retrievedProjects);
    } else {
        res.status(404).send('Failed to retrieve projects');
    }
});

router.get('/id/:projectId', isLoggedIn, async (req: Request, res: Response) => {
    if (req.user) {
        const { projectId } = req.params;
        const retrievedProject = await projects.getProjectByProjectId(projectId);
        console.log(`🔗 Returning project (${projectId}): ${JSON.stringify(retrievedProject, null, 2)}`)
        res.json(retrievedProject);
    } else {
        res.status(404).send('Failed to retrieve projects');
    }
});



router.post('/upsert', isLoggedIn, async (req: Request, res: Response) => {
    if (req.user && req.body) {
        console.log(`🔗 Received project data: ${JSON.stringify(req.body, null, 2)}`)
        const result = await projects.upsertProject(req.body);
        if (result.upsertedCount > 0) {
            res.status(201).json({ message: 'Project created successfully', result });
            console.log("Newly created projectId:", result.upsertedId);
        } else if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Project updated successfully', result });
        } else {
            res.status(304).send('No changes made to the project.');
        }
    } else {
        res.status(400).send('Failed to upsert project data');
    }
});

router.delete('/delete/:projectId', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId;
        console.log(`🔗 Received projectId to be deleted: ${req.body}`)
        const result = await projects.deleteProject(projectId);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

//加成员到gitlab组里面
router.post("/members", async (req, res) => {
    const members: ProjectMember[] = req.body.members
    const projectId: string = req.body.projectId

    const project = await projects.getProjectByProjectId(projectId)

    members.forEach(user => {
        addMembertoGroup(project.gitlabGroupId, user.id)
    })

    await projects.editMemberIds(projectId, members)

    res.json({
        success: true
    });
});


export default router;