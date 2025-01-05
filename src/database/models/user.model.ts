import mongoose from "mongoose";
import { IUser } from "../../dtos/auth.dto";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountStatus: {
        type: String,
        default: 'Active',
        enum: { 
            values: ['Active', 'Inactive'],
            message: '{VALUE} is not supported'
        }
    },
    salt: {
        type: String,
        required: true,
    },
    apps: {
        type: [
            {
                appId: {
                    type: String,
                    required: true,
                },
                appLabel: { 
                    type: String,
                    required: true,
                },
                appAddress: {
                    type: String,
                    required: true,
                },
                permission: {
                    type: String,
                    enum: { 
                        values: ['READ', 'WRITE', 'ADMIN'],
                        message: '{VALUE} is not supported'
                    },
                    required: true,
                }
            }
        ],
        default: []
    },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        }
    }
});

export default mongoose.model<IUser>('User', UserSchema);