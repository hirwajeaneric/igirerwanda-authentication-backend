import AuthService from "../services/auth-service";
import { validateUserSignUp, validateUserSignIn, validatePasswordReset } from "../utils/auth.validation";
import asyncWrapper from "./middlewares/AsyncWrapper";
import { Authorize } from "./middlewares/auth";
import { Request, Response, NextFunction, Application } from "express";

export default (app: Application) => {
    const authService = new AuthService();

    app.get('/health', asyncWrapper(async (req: Request, res: Response) => {
        res.status(200).json({ message: "Health is good" });
    }));

    app.get('/list', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const users = await authService.getAllUsers();
        res.status(200).json({ users });
    }));

    app.get('/findById', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const user = await authService.getUserById(req.query.id as string);
        res.status(200).json({ user });
    }));

    app.get('/findByEmail', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const user = await authService.getUserByEmail(req.query.email as string);
        res.status(200).json({ user });
    }));

    app.get('/profile', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const result = await authService.getProfile(req.query.id as string, req.query.appId as string);
        res.status(200).json({ user: result});
    }));

    app.post('/signup', validateUserSignUp, asyncWrapper(async (req: Request, res: Response) => {
        const result = await authService.signup(req.body);
        res.status(201).json(result);
    }));

    app.post('/signin', validateUserSignIn, asyncWrapper(async (req: Request, res: Response) => {
        const { email, password, redirectUrl, redirectAppId } = req.body;
        const { token, redirectUrlWithToken } = await authService.login(email, password, redirectUrl, redirectAppId);
        res.send({ token, redirectUrlWithToken });
    }));

    app.delete('/delete', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const result = await authService.deleteUser(req.query.id as string);
        res.send(result);
    }));

    app.post('/logout', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const result = await authService.logout(req.body.appId, req.body.userId);
        res.status(200).json({ result});
    }));

    app.post('/createAccount', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        const result = await authService.createAccount(req.body, req.query.appId as string);
        res.send(result);
    }));
}