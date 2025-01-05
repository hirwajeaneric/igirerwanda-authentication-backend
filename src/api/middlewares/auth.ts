const { ValidateSignature } = require('../../utils');
import { NextFunction, Request, Response } from "express";
import asyncWrapper from "./AsyncWrapper";

export const Authorize = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const isAuthorized = await ValidateSignature(req);

    if (isAuthorized) {
        return next();
    }
    return res.status(403).json({ message: 'Access Denied' })
})

export const AuthorizeAdmin = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.app.permission === 'ADMIN' || user?.app.permission === 'WRITE' || user?.app.permission === 'READ') {
        return next();
    }
    return res.status(403).json({ message: 'Access Denied' })
})

export const AuthorizeRead = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.app.permission === 'READ') {
        return next();
    }
    return res.status(403).json({ message: 'Access Denied' })
})

export const AuthorizeWrite = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.app.permission === 'WRITE' || user?.app.permission === 'READ') {
        return next();
    }
    return res.status(403).json({ message: 'Access Denied' })
})