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