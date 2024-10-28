import passport from 'passport';
import { Issuer, Strategy, generators } from 'openid-client';
import { Express } from 'express';
import { User, ADVANCED_GROUP_ID, ADVANCED_GROUP_NAME, REDIRECT_URI } from './data'; 
import { users, projects } from './db'; 
// import { client_id, client_secret } from "./secrets"
// import { gitlab } from "./secrets"
import { Strategy as CustomStrategy } from "passport-custom";


export async function setupDisableSecurity() {
    passport.use("disable-security", new CustomStrategy((req, done) => {
        const DISABLE_SECURITY = process.env.DISABLE_SECURITY; 
        if (req.query.key !== DISABLE_SECURITY) {
            console.log("you must supply ?key=" + DISABLE_SECURITY + " to log in via DISABLE_SECURITY");
            done(null, false);
        } else {
            done(null, { _id:req.query.sub, email:req.query.email, name: req.query.user, preferred_username: req.query.user, role: (req.query.role) });
        }
    }));
}

async function verify (
    tokenSet: any,
    userInfo: any,
    done: (error: any, user: any) => void
  ) {
    const user = {
        _id: userInfo.sub,  
        email: userInfo.email,
        name: userInfo.name,
        preferred_username: userInfo.preferred_username,
        picture: userInfo.picture,
        groups: userInfo.groups,
        role: userInfo.groups.includes(ADVANCED_GROUP_NAME)? "advanced" : "basic"
    };
    console.log("📌 Received userInfo from GitLab", userInfo)
    console.log("📌 Received tokenSet from GitLab", tokenSet)
    
    await users.upsertUser(user)
    await projects.createDefaultProject(user._id);
    return done(null, user)
  }

export async function setupPassport(app: Express) {
    const issuer = await Issuer.discover("https://coursework.cs.duke.edu/"); 
    // const client = new issuer.Client(gitlab);
    const client = new issuer.Client({
        client_id: process.env.GITLAB_CLIENT_ID || "97f75fe0af9ca973c3e40392a94c97ac7f1ba505960c365e4b83bffb9375834f",
        client_secret: process.env.GITLAB_CLIENT_SECRET || "gloas-fd3562d80f73299defb8e8bc18c1f7423dd285736e0087e8c0d99a4e3b6ddcb9"
    });
    const params = {
        scope: "openid profile email",
        nonce: generators.nonce(),
        redirect_uri: REDIRECT_URI,
        state: generators.state(),
  }

    passport.use("oidc", new Strategy({ client, params }, verify))
    app.use(passport.initialize())
    app.use(passport.session())
    passport.serializeUser((user, done) => {
        console.log("serializeUser", user)
        done(null, user)
    })
    
    passport.deserializeUser((user, done) => {
        console.log("deserializeUser", user)
        done(null, user)
    })
}