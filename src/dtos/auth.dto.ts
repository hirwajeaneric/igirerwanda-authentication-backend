import { Document } from "mongoose";

export interface IUserPayload {
    _id: string;
    email: string;
    accountStatus: string;
    apps: {
        appId: string;
        appLabel: string;
        appAddress: string;
        permission: string;
    }[]
}

export interface IUser extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accountStatus: string;
    salt: string;
    apps: {
        appId: string;
        appLabel: string;
        appAddress: string;
        permission: string;
    }[];
}