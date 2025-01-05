import express, { Application } from "express";
import cors from "cors";
import { auth } from './api';
import ErrorHandlerMiddleware from "./api/middlewares/ErrorHandler";
import config from "./config";

export default async (app: Application) => {
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({
        origin: ['*', config.CLIENT_URL as string],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    }));
    app.use(express.static(__dirname + '/public'));

    // APIS
    auth(app);

    // Error handling middleware
    app.use(ErrorHandlerMiddleware as unknown as express.ErrorRequestHandler);
}