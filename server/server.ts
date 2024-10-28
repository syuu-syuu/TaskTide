import express from "express"
import "socket.io";
import { initDatabaseConnection, projects, tasks, users } from "./db";
import { Server } from "socket.io"
import { createServer } from "http"
import { setupMiddleware, sessionMiddleware } from "./setupMiddleware"
import { setupPassport, setupDisableSecurity } from "./setupPassport"
import { SocketManager } from "./socket"
import { setupRoutes } from "./setupRoutes"

const HOST = process.env.HOST || "localhost"
// export const baseServerUrl = process.env.BASE_SERVER_URL || 'http://localhost:31001';
// const baseUIUrl = process.env.BASE_UI_URL || 'http://localhost:31000';

export const baseServerUrl = process.env.BASE_SERVER_URL || 'http://localhost:8171';
const baseUIUrl = process.env.BASE_UI_URL || 'http://localhost:8170';


async function startServer() {
    const app = express();
    const port = 8171;
    // const port = parseInt(process.env.SERVER_PORT || "8171")


    setupMiddleware(app);
    await setupPassport(app); 
    setupDisableSecurity(); 
    await initDatabaseConnection();

    const server = createServer(app);
     server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    const io = new Server(server);
    const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware));
    const socketManager = new SocketManager(io)
    socketManager.initialize().then(() => {
        console.log('Socket server initialized and ready');
    }).catch(err => {
        console.error('Socket server initialization failed:', err);
    });

    setupRoutes(app);
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
});
