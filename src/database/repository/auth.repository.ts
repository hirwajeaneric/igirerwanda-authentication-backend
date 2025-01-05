import userModel from "../models/user.model";

export default class UserRepository {
    async getAllUsers() {
        try {
            return await userModel.find({});
        } catch (error) {
            console.error("Error occurred while fetching all users:", error);
            throw error;
        }
    }

    async getUserById(id: string) {
        try {
            return await userModel.findById(id);
        } catch (error) {
            console.error("Error occurred while fetching user by id:", error);
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            return await userModel.findOne({ email });
        } catch (error) {
            console.error("Error occurred while fetching user by email:", error);
            throw error;
        }
    }

    async createUser(user: any) {
        try {
            return await userModel.create(user);
        } catch (error) {
            console.error("Error occurred while creating a new user:", error);
            throw error;
        }
    }

    async updateUser(id: string, updatedUser: any) {
        try {
            return await userModel.findByIdAndUpdate(id, updatedUser, { new: true });
        } catch (error) {
            console.error("Error occurred while updating a user:", error);
            throw error;
        }
    }

    async deleteUser(id: string) {
        try {
            return await userModel.findByIdAndDelete(id);
        } catch (error) {
            console.error("Error occurred while deleting a user:", error);
            throw error;
        }
    }
}