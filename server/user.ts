import express, { Router, Request, Response } from 'express';
import { isLoggedIn } from './authentication';
import {getGitlabUsers} from "./gitlab";

const router: Router = express.Router();

router.get('/profile', isLoggedIn, (req: Request, res: Response) => {
    if (req.user) {
        const { _id, email, name, role, picture } = req.user as any; 
        const userInfo = { _id, email,name,role, picture };
        console.log("🔗 Returning user information:", userInfo)
        res.json(userInfo);
    } else {
        res.status(404).send('User not found');
    }
});

//拿到gitlab的所有用户信息，分页返的 page and per_page
router.get("/users", async (req, res) => {
    //页码
    const pageNum = req.query.pageNum as string;
    //一页显示多少条
    const pageSize = req.query.pageSize as string;
    console.log(pageNum, pageSize);
    const gitlabUsers = await getGitlabUsers(pageNum, pageSize);
    res.json(gitlabUsers);
});


export default router;