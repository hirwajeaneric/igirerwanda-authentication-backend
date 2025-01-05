import { Document } from "mongoose";

export interface IToken extends Document {
    _id: string;
    userId: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
}