import accessTokenModel from "../models/token.model";

export default class AccessTokenRepository {
    async createAccessToken(token: string, appId: string, userId: string) {
        try {
            return await accessTokenModel.create({ token, appId, userId });
        } catch (error) {
            console.error("Error occurred while creating an access token:", error);
            throw error;
        }
    }

    async findAccessTokenByToken(token: string) {
        try {
            return await accessTokenModel.findOne({ token });
        } catch (error) {
            console.error("Error occurred while finding access token by token:", error);
            throw error;
        }
    }

    async deleteAccessTokenByToken(token: string) {
        try {
            return await accessTokenModel.deleteOne({ token });
        } catch (error) {
            console.error("Error occurred while deleting access token by token:", error);
            throw error;
        }
    }

    async deleteAccessTokenByAppIdAndUserId(appId: string, userId: string) {
        try {
            return await accessTokenModel.deleteOne({ appId, userId });
        } catch (error) {
            console.error("Error occurred while deleting access token by appId and userId:", error);
            throw error;
        }
    }
} 