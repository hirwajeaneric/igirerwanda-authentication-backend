import accessTokenModel from "../models/token.model";

export default class AccessTokenRepository {
    /**
     * Creates an access token for a given user in a given app.
     * @param token The value of the access token.
     * @param appId The ID of the app for which the access token is being created.
     * @param userId The ID of the user for which the access token is being created.
     * @returns The newly created access token document.
     * @throws Error If there is an error while creating the access token.
     */
    async createAccessToken(token: string, appId: string, userId: string) {
        try {
            return await accessTokenModel.create({ token, appId, userId });
        } catch (error) {
            console.error("Error occurred while creating an access token:", error);
            throw error;
        }
    }

    /**
     * Finds an access token document by its value.
     * @param token The value of the access token to find.
     * @returns The access token document if found, or null if not found.
     * @throws Error If there is an error while finding the access token.
     */
    async findAccessTokenByToken(token: string) {
        try {
            return await accessTokenModel.findOne({ token });
        } catch (error) {
            console.error("Error occurred while finding access token by token:", error);
            throw error;
        }
    }

    /**
     * Deletes an access token document by its value.
     * 
     * @param token The value of the access token to delete.
     * @returns The result of the deletion operation.
     * @throws Error If there is an error while deleting the access token.
     */
    async deleteAccessTokenByToken(token: string) {
        try {
            return await accessTokenModel.deleteOne({ token });
        } catch (error) {
            console.error("Error occurred while deleting access token by token:", error);
            throw error;
        }
    }

    /**
     * Deletes an access token document by its app ID and user ID.
     * 
     * @param appId The ID of the app for which the access token is to be deleted.
     * @param userId The ID of the user for which the access token is to be deleted.
     * @returns The result of the deletion operation.
     * @throws Error If there is an error while deleting the access token.
     */
    async deleteAccessTokenByAppIdAndUserId(appId: string, userId: string) {
        try {
            return await accessTokenModel.deleteOne({ appId, userId });
        } catch (error) {
            console.error("Error occurred while deleting access token by appId and userId:", error);
            throw error;
        }
    }
} 