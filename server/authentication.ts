import { Request, Response, NextFunction } from 'express';
import { baseServerUrl } from './data'

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  console.log("✔️ Confirmed the current user is logged in.")
  res.redirect(`${baseServerUrl}/`);
}
