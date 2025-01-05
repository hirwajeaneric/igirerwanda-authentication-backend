const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { Request, Response } from "express";
import { IUserPayload } from "../dtos/auth.dto";

declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload
        }
    }
};

const { APP_SECRET } = require("../config");

//Utility functions
export const GenerateSalt = async () => {
    return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {
    return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: any, expiry: string = "30d") => {
    try {
        return await jwt.sign(payload, APP_SECRET, { expiresIn: expiry });
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const ValidateSignature = async (req: Request) => {
    try {
        const signature = req.get("Authorization");
        if (!signature) {
            return false;
        }
        const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
        req.user = payload;
        return true;
    } catch (error) {
        return false;
    }
};