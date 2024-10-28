import { Express } from 'express';
import passport from 'passport';
import userRoutes from './user';
import projectRoutes from './project';
import taskRoutes from './task';
import gitlabRoutes from './gitlab';
import graphqlRoutes from './graphql';

export function setupRoutes(app: Express) {
    const passportStrategies = [
        ...(process.env.DISABLE_SECURITY ? ["disable-security"] : []),
        "oidc",
    ]

    app.use('/api/user', userRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/gitlab', gitlabRoutes);
    app.use('/api/graphql', graphqlRoutes);

    // app.get("/api/login", passport.authenticate("oidc", {
    //     successReturnToOrRedirect: `/home`,
    // }));

    app.get('/api/login', passport.authenticate(passportStrategies, {
        successReturnToOrRedirect: "/home"
    }))


    // Handle the OIDC authentication response// Handle the OIDC authentication response
    // app.get("/api/login-callback", passport.authenticate("oidc", {
    //     successReturnToOrRedirect: `/home`,
    //     failureRedirect: `/`,
    // }));

    app.get('/api/login-callback', passport.authenticate(passportStrategies, {
        successReturnToOrRedirect: '/home',
        failureRedirect: '/',
    }))


    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) { 
                return next(err); 
            }
            // req.session.destroy(err => {
            //     if (err) {
            //         console.error('Failed to destroy the session:', err);
            //     }
            //     res.redirect('/');
            // });
        });
    });
}
