// Setup Middlewares
import { Express } from 'express';
import bodyParser from 'body-parser';
import pino from "pino"
import expressPinoLogger from "express-pino-logger"
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { mongodbUrl, baseUIUrl, baseServerUrl } from './data';

export const sessionMiddleware = session({
    secret: "a just so-so secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Need to be set true in production environment for https
    store: MongoStore.create({
      mongoUrl: mongodbUrl,
      ttl: 14 * 24 * 60 * 60 // 14 days
    })
});
export function setupMiddleware(app: Express) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }))
    const logger = pino({
        transport: {
            target: 'pino-pretty'
        }
    });
    app.use(expressPinoLogger({ logger }));
    app.use(cors({ origin: [baseServerUrl, baseUIUrl], credentials: true }));
    app.use(sessionMiddleware);
}