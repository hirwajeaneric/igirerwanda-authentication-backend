import { IUser } from "../../dtos/auth.dto";
import userModel from "../models/user.model";

export default class UserRepository {
    /**
     * Returns all users in the database.
     * @throws {Error} if there is an error while fetching all users.
     * @returns {Promise<IUser[]>} A promise resolving to an array of all users.
     */
    async getAllUsers() {
        try {
            return await userModel.find({});
        } catch (error) {
            console.error("Error occurred while fetching all users:", error);
            throw error;
        }
    }

    /**
     * Retrieves a user from the database by their unique id.
     * @param {string} id - The unique identifier of the user to be fetched.
     * @returns {Promise<IUser | null>} A promise resolving to the user object if found, or null if not found.
     */
    async getUserById(id: string): Promise<IUser | null> {
        try {
            return await userModel.findById(id);
        } catch (error) {
            console.error("Error occurred while fetching user by id:", error);
            throw error;
        }
    }

    /**
     * Retrieves a user from the database by their email address.
     * @param {string} email - The email address of the user to be fetched.
     * @returns {Promise<IUser | null>} A promise resolving to the user object if found, or null if not found.
     */
    async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            return await userModel.findOne({ email });
        } catch (error) {
            console.error("Error occurred while fetching user by email:", error);
            throw error;
        }
    }

    /**
     * Creates a new user in the database.
     * @param {any} user - The data of the user to be created.
     * @throws {Error} if there is an error while creating a new user.
     * @returns {Promise<IUser>} A promise resolving to the newly created user.
     */
    async createUser(user: any) {
        try {
            return await userModel.create(user);
        } catch (error) {
            console.error("Error occurred while creating a new user:", error);
            throw error;
        }
    }

    /**
     * Updates a user in the database.
     * @param {string} id - The unique identifier of the user to be updated.
     * @param {any} updatedUser - The data of the user to be updated.
     * @throws {Error} if there is an error while updating a user.
     * @returns {Promise<IUser | null>} A promise resolving to the updated user if found, or null if not found.
     */
    async updateUser(id: string, updatedUser: any) {
        try {
            return await userModel.findByIdAndUpdate(id, updatedUser, { new: true });
        } catch (error) {
            console.error("Error occurred while updating a user:", error);
            throw error;
        }
    }

    /**
     * Deletes a user from the database by their unique id.
     * @param {string} id - The unique identifier of the user to be deleted.
     * @throws {Error} if there is an error while deleting a user.
     * @returns {Promise<IUser | null>} A promise resolving to the deleted user if found, or null if not found.
     */
    async deleteUser(id: string) {
        try {
            return await userModel.findByIdAndDelete(id);
        } catch (error) {
            console.error("Error occurred while deleting a user:", error);
            throw error;
        }
    }
}