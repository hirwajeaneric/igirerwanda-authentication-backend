import mongoose from "mongoose";
import { IToken } from "../../dtos/token.dto";

const accessToken = new mongoose.Schema({
    token: { 
        type: String, 
        required: true 
    },
    appId: { 
        type: String, 
        required: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true 
    }
}, {
    timestamps: true,
});

export default mongoose.model<IToken>('AccessToken', accessToken);