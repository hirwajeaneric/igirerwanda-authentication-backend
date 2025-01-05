import { IUser, IUserPayload } from "../dtos/auth.dto";
import AuthService from "../services/auth-service";
import { validateUserSignUp, validateUserSignIn, validatePasswordReset } from "../utils/auth.validation";
import asyncWrapper from "./middlewares/AsyncWrapper";
import { Authorize, AuthorizeAdmin, AuthorizeRead, AuthorizeWrite } from "./middlewares/auth";
import { Request, Response, NextFunction, Application } from "express";

export default (app: Application) => {
    const authService = new AuthService();

    app.get('/health', asyncWrapper(async (req: Request, res: Response) => {
        res.status(200).json({ message: "Health is good" });
    }));

    app.get('/list', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        const users = await authService.getAllUsers();
        res.status(200).json({ users });
    }));

    app.get('/findById', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: id as query parameter
        const user = await authService.getUserById(req.query.id as string);
        res.status(200).json({ user });
    }));

    app.get('/findByEmail', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: email as query parameter
        const user = await authService.getUserByEmail(req.query.email as string);
        res.status(200).json({ user });
    }));

    app.get('/profile', Authorize, AuthorizeWrite, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: id, appId as query parameters
        const result = await authService.getProfile(req.query.id as string, req.query.appId as string);
        res.status(200).json({ user: result});
    }));

    app.post('/signup', validateUserSignUp, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: firstName, lastName, email, password, appId
        const result = await authService.signup(req.body);
        res.status(201).json(result);
    }));

    app.post('/signin', validateUserSignIn, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: email, password, redirectUrl, redirectAppId
        const { email, password, redirectUrl, redirectAppId } = req.body;
        const { token, redirectUrlWithToken } = await authService.login(email, password, redirectUrl, redirectAppId);
        res.cookie('access-token', token, { httpOnly: true });
        res.status(200).json({ token, redirectUrlWithToken });
    }));

    app.delete('/delete', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: id
        const result = await authService.deleteUser(req.query.id as string);
        res.send(result);
    }));

    app.post('/logout', Authorize, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: appId, userId
        const result = await authService.logout(req.body.appId, req.body.userId);
        res.status(200).json({ result});
    }));

    app.post('/createAccount', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: firstName, lastName, email, password
        const result = await authService.createAccount(req.body, req.query.appId as string);
        res.status(201).json(result);
    }));

    app.put('/updateProfile', Authorize, AuthorizeRead, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: firstName, lastName, email
        const { firstName, lastName, email } = req.body;
        const result = await authService.updateProfile(req.query.id as string, { firstName, lastName, email });
        res.status(200).json(result);
    }));

    app.put('/updateUser', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: firstName, lastName, email, accountStatus
        const result = await authService.updateUser(req.query.id as string, req.body);
        res.status(200).json(result);
    }));

    app.put('/changeAccountStatus', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: id as query parameter, accountStatus as body.
        const result = await authService.changeAccountStatus(req.query.id as string, req.body.accountStatus);
        res.status(200).json(result);
    }));

    app.put('/addApp', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: appId, userId, permission
        const result = await authService.addApp(req.body.appId, req.body.permission, req.body.userId);
        res.status(200).json(result);
    }));

    app.put('/updateApp', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: appId, userId, permission
        const result = await authService.updateApp(req.body.appId, req.body.permission, req.body.userId);
        res.status(200).json(result);
    }));

    app.put('/removeApp', Authorize, AuthorizeAdmin, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: appId, userId
        const result = await authService.removeApp(req.body.appId, req.body.userId);
        res.status(200).json(result);
    }));

    app.post('/forgotPassword', validateUserSignIn, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: email, redirectAppId, redirectUrl
        const { email, redirectUrl, redirectAppId } = req.body;
        await authService.forgotPassword(email, redirectAppId, redirectUrl);
        res.status(200).json({ message: "Password reset link sent" });
    }));

    app.put('/updatePassword', Authorize, AuthorizeRead, asyncWrapper(async (req: Request, res: Response) => {
        // Inputs are: password, redirectAppId, redirectUrl
        const user = req.user;
        let passwordUpdated = await authService.resetPassword(req.body.password, user as IUserPayload);
        if (passwordUpdated) {
            res.status(200).json({ message: "Password updated successfully", redirectAppId: req.body.redirectAppId, redirectUrl: req.body.redirectUrl });
        } else {
            res.status(400).json({ message: "Password update failed" });   
        }
    }));

}