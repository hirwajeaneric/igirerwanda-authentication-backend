import UserRepository from "../database/repository/auth.repository";
import AccessTokenRepository from "../database/repository/accessToken.repository";
import { IUserPayload } from "../dtos/auth.dto";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, ValidateSignature } from "../utils";
import configs from "../config";
import { sendEmail } from "../utils/notification.utils";
import { permission } from "process";

export default class AuthService {
    userRepository: UserRepository;
    accessTokenRepository: AccessTokenRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.accessTokenRepository = new AccessTokenRepository();
    }

    async getAllUsers() {
        try {
            const users = await this.userRepository.getAllUsers();
            if (!users) {
                throw new Error('No users found');
            }
            return users.map(user => ({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountStatus: user.accountStatus,
                apps: user.apps
            }));
        } catch (error) {
            console.error("Error occurred while fetching all users:", error);
            throw error;
        }
    }

    async getUserById(id: string) {
        try {
            const user = await this.userRepository.getUserById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountStatus: user.accountStatus,
                apps: user.apps
            };
        } catch (error) {
            console.error("Error occurred while fetching user by id:", error);
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountStatus: user.accountStatus,
                apps: user.apps
            };
        } catch (error) {
            console.error("Error occurred while fetching user by email:", error);
            throw error;
        }
    }

    async getProfile(id: string, appId: string) {
        try {
            const user = await this.userRepository.getUserById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return {
                _id: user._id,
                email: user.email,
                accountStatus: user.accountStatus,
                permission: user.apps.find((app: any) => app.appId === appId)?.permission || "",
                appId: user.apps.find((app: any) => app.appId === appId)?.appId || "",
            }
        } catch (error) {
            console.error("Error occurred while fetching user profile:", error);
            throw error;
        }
    }

    async createUser(user: any) {
        try {
            const savedUser = await this.userRepository.createUser(user);
            if (!savedUser) {
                throw new Error('Failed to create user');
            }
            return savedUser;
        } catch (error) {
            console.error("Error occurred while creating a new user:", error);
            throw error;
        }
    }

    async updateUser(id: string, updatedUser: any) {
        try {
            const user = await this.userRepository.updateUser(id, updatedUser);
            if (!user) {
                throw new Error('User not found');
            }
            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountStatus: user.accountStatus,
                apps: user.apps
            };
        } catch (error) {
            console.error("Error occurred while updating a user:", error);
            throw error;
        }
    }

    async deleteUser(id: string) {
        try {
            const user = await this.userRepository.deleteUser(id);
            if (!user) {
                throw new Error('User not found');
            }
            return { message: "User deleted"}
        } catch (error) {
            console.error("Error occurred while deleting a user:", error);
            throw error;
        }
    }

    async login(email: string, password: string, redirectUrl: string, redirectAppId: string) {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                throw new Error('Account not found');
            }
            const isPasswordValid = await ValidatePassword(password, user.password, user.salt);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            const payload: IUserPayload = {
                _id: user._id,
                email: user.email,
                accountStatus: user.accountStatus,
                apps: user.apps,
            };
            if (user.apps.some(app => app.appId === redirectAppId)) {
                const token = await GenerateSignature(payload);
                await this.accessTokenRepository.createAccessToken(token, redirectAppId, user._id);
                const redirectUrlWithToken = `${redirectUrl}?token=${token}`;
                return { token, redirectUrlWithToken };
            } else {
                throw new Error('Access denied');
            }
        } catch (err) {
            console.error("Error occurred while logging in:", err);
            throw err;
        }
    }

    async signup(user: any) {
        try {
            const existingUser = await this.userRepository.getUserByEmail(user.email);
            if (existingUser) {
                throw new Error('Account with this email already exists');
            }
            const salt = await GenerateSalt();
            const userPassword = await GeneratePassword(user.password, salt);
            const savedUser = await this.userRepository.createUser({
                ...user,
                salt,
                password: userPassword,
            });
            if (!savedUser) {
                throw new Error('Failed to create user');
            }
            return { message: "Account created successfully" };
        } catch (err) {
            console.error("Error occurred while signing up:", err);
            throw err;
        }
    }

    async createAccount (user: any, appId: string) {
        try {
            const existingUser = await this.userRepository.getUserByEmail(user.email);
            if (existingUser) {
                throw new Error('Account with this email already exists');
            }
            const salt = await GenerateSalt();
            const userPassword = await GeneratePassword(user.password, salt);
            const savedUser = await this.userRepository.createUser({
                ...user,
                salt,
                password: userPassword,
            });
            if (!savedUser) {
                throw new Error('Failed to create user');
            }
            const payload: IUserPayload = {
                _id: savedUser._id,
                email: savedUser.email,
                accountStatus: savedUser.accountStatus,
                apps: savedUser.apps,
            };
            const token = await GenerateSignature(payload, '1d');
            await this.accessTokenRepository.createAccessToken(token, savedUser._id, appId);
            const resetPasswordUrl = `${configs.CLIENT_URL}/reset-password?token=${token}`;
            await sendEmail(savedUser.email, 'Account Created', resetPasswordUrl);
            return { message: "Account created successfully" };
        } catch (err) {
            console.error("Error occurred while signing up:", err);
            throw err;
        }
    }

    async logout(appId: string, userId: string) {
        try {
            await this.accessTokenRepository.deleteAccessTokenByAppIdAndUserId(appId, userId);
            return { message: "Logged out successfully" };
        } catch (error) {
            console.error("Error occurred while logging out:", error);
            throw error;
        }
    }

    // async updatePassword(token: string, password: string) {
    //     try {
    //         const payload = await ValidateSignature(token);
    //         const user = await this.userRepository.getUserById(payload._id);
    //         if (!user) {
    //             throw new Error('User not found');
    //         }
    //         const salt = await GenerateSalt();
    //         const userPassword = await GeneratePassword(password, salt);
    //         const updatedUser = await this.userRepository.updateUser(user._id, {
    //             password: userPassword,
    //             salt,
    //         });
    //         if (!updatedUser) {
    //             throw new Error('Failed to update password');
    //         }
    //         return { message: "Password updated successfully" };
    //     } catch (err) {
    //         console.error("Error occurred while updating password:", err);
    //         throw err;
    //     }
    // }
}