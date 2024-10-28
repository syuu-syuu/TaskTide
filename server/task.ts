import express, { Router, Request, Response } from 'express';
import { isLoggedIn } from './authentication';
import { tasks } from './db'
const router: Router = express.Router();


router.get('/:projectId', isLoggedIn, async (req: Request, res: Response) => {
    if (req.user) {
        const { projectId } = req.params;
        const retrievedTasks = await tasks.getTasksByProjectId(projectId);
        console.log(`🔗 Returning project tasks: ${JSON.stringify(retrievedTasks, null, 2)}`)
        res.json(retrievedTasks);
    } else {
        res.status(404).send('Failed to retrieve tasks');
    }
});


router.post('/upsert', isLoggedIn, async (req: Request, res: Response) => {
    if (req.user && req.body) {
        const { _id } = req.user as any; 
        const newTask = {
            ...req.body,
            creatorId: _id
        };
        console.log(`🔗 Going to upsert task data: ${JSON.stringify(newTask, null, 2)}`)
        const result = await tasks.upsertTask(req.body);
        if (result.upsertedCount > 0) {
            res.status(201).json({ message: 'Task created successfully', result });
        } else if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Task updated successfully', result });
        } else {
            res.status(304).send('No changes made to the task.');
        }
    } else {
        res.status(400).send('Failed to upsert task data');
    }
});


router.delete('/delete/:taskId', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId;
        const result = await tasks.deleteTask(taskId);
        if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Task deleted successfully' });
        } else {
        res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});


export default router;