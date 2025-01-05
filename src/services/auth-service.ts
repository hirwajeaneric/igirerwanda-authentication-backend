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

    /**
     * Constructs a new instance of the AuthService
     * 
     * Creates a new instance of the UserRepository and AccessTokenRepository
     */
    constructor() {
        this.userRepository = new UserRepository();
        this.accessTokenRepository = new AccessTokenRepository();
    }

    /**
     * Retrieves all users from the database.
     * 
     * @returns {Promise<Array<{ _id: string, firstName: string, lastName: string, email: string, accountStatus: string, apps: { appId: string, permission: string }[] }>>}
     *          A promise that resolves to an array of user objects containing user details.
     * @throws {Error} If there is an error while fetching users or no users are found.
     */
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

    /**
     * Retrieves a user from the database by their unique id.
     * 
     * @param {string} id - The unique identifier of the user to be fetched.
     * @returns {Promise<{ _id: string, firstName: string, lastName: string, email: string, accountStatus: string, apps: { appId: string, permission: string }[] }>} 
     *          A promise resolving to the user object if found, or null if not found.
     * @throws {Error} If there is an error while fetching the user.
     */
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

    /**
     * Retrieves a user from the database by their email address.
     * 
     * @param {string} email - The email address of the user to be fetched.
     * @returns {Promise<{ _id: string, firstName: string, lastName: string, email: string, accountStatus: string, apps: { appId: string, permission: string }[] }>} 
     *          A promise resolving to the user object if found, or null if not found.
     * @throws {Error} If there is an error while fetching the user.
     */
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

    /**
     * Retrieves a user's profile from the database by their unique id and app id.
     * 
     * @param {string} id - The unique identifier of the user to be fetched.
     * @param {string} appId - The app id of the user to be fetched.
     * @returns {Promise<{ _id: string, email: string, accountStatus: string, permission: string, appId: string }>} 
     *          A promise resolving to the user's profile object if found, or null if not found.
     * @throws {Error} If there is an error while fetching the user's profile.
     */
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

    /**
     * Creates a new user in the database.
     * 
     * @param {any} user - The data of the user to be created.
     * @returns {Promise<IUser>} A promise that resolves to the newly created user object.
     * @throws {Error} If there is an error while creating the user or if the user creation fails.
     */
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

    /**
     * Updates a user in the database.
     * 
     * @param {string} id - The unique identifier of the user to be updated.
     * @param {any} updatedUser - The data of the user to be updated.
     * @returns {Promise<IUser>} A promise that resolves to the updated user object.
     * @throws {Error} If there is an error while updating the user or if the user is not found.
     */
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

    /**
     * Deletes a user from the database by their unique id.
     * 
     * @param {string} id - The unique identifier of the user to be deleted.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object with a message 
     *         indicating that the user was deleted.
     * @throws {Error} If there is an error while deleting the user or if the user is not found.
     */
    async deleteUser(id: string) {
        try {
            const user = await this.userRepository.deleteUser(id);
            if (!user) {
                throw new Error('User not found');
            }
            return { message: "User deleted" }
        } catch (error) {
            console.error("Error occurred while deleting a user:", error);
            throw error;
        }
    }

    /**
     * Authenticates a user using the provided email and password, and returns a
     * signed JSON Web Token that can be used to access the app specified by
     * the redirectAppId parameter.
     * 
     * The token is persisted in the database, and the redirectUrlWithToken is
     * the redirectUrl parameter with the token appended as a query parameter.
     * 
     * @param {string} email - The email of the user to log in.
     * @param {string} password - The password of the user to log in.
     * @param {string} redirectUrl - The URL to redirect the user to after a successful login.
     * @param {string} redirectAppId - The id of the app that the user should have access to.
     * @returns {Promise<{ token: string, redirectUrlWithToken: string }>} A promise that resolves
     *          to an object with the signed token and the redirectUrlWithToken.
     * @throws {Error} If there is an error while logging in, such as the user not being found,
     *          or the password being incorrect.
     */
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
            if (user.accountStatus === 'Inactive') {
                throw new Error('Access Denied. Account is not active');
            }
            const userApp = user.apps.find(app => app.appId === redirectAppId);
            if (!userApp) {
                throw new Error('App not found');
            }
            const payload: IUserPayload = {
                _id: user._id,
                email: user.email,
                accountStatus: user.accountStatus,
                app: {
                    appId: userApp?.appId || "",
                    permission: userApp?.permission || ""
                },
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

    /**
     * Creates a new user account.
     * 
     * @param {any} user - An object with the user data.
     * @returns {Promise<{ message: string }>} A promise that resolves to an
     *          object with a message indicating the success of the operation.
     * @throws {Error} If there is an error while signing up, such as the user
     *          already existing.
     */
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

    /**
     * Creates a new user account.
     * 
     * @param {any} user - An object with the user data.
     * @param {string} appId - The ID of the app in which the user is being created.
     * @returns {Promise<{ message: string }>} A promise that resolves to an
     *          object with a message indicating the success of the operation.
     * @throws {Error} If there is an error while signing up, such as the user
     *          already existing.
     */
    async createAccount(user: any, appId: string) {
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
                app: {
                    appId: savedUser.apps[0].appId || "",
                    permission: savedUser.apps[0].permission || ""
                },
            };

            const token = await GenerateSignature(payload, '1d');
            await this.accessTokenRepository.createAccessToken(token, savedUser.apps[0].appId, savedUser._id);

            const resetPasswordUrl = `${configs.CLIENT_URL}/change-password?token=${token}`;
            await sendEmail(savedUser.email, 'Account Created', resetPasswordUrl);

            return { message: "Account created successfully" };
        } catch (err) {
            console.error("Error occurred while signing up:", err);
            throw err;
        }
    }

    /**
     * Logs out a user by deleting their access token.
     * 
     * @param {string} appId - The ID of the app from which the user is logging out.
     * @param {string} userId - The ID of the user logging out.
     * @returns {Promise<{ message: string }>} A promise that resolves to an
     *          object with a message indicating the success of the operation.
     * @throws {Error} If there is an error while logging out.
     */
    async logout(appId: string, userId: string) {
        try {
            await this.accessTokenRepository.deleteAccessTokenByAppIdAndUserId(appId, userId);
            return { message: "Logged out successfully" };
        } catch (error) {
            console.error("Error occurred while logging out:", error);
            throw error;
        }
    }

    /**
     * Updates a user's profile in the database.
     * 
     * @param {string} userId - The ID of the user whose profile is to be updated.
     * @param {any} user - The data to be updated in the user's profile.
     * @returns {Promise<{ message: string }>} A promise that resolves to an
     *          object with a message indicating the success of the operation.
     * @throws {Error} If there is an error while updating the user's profile.
     */
    async updateProfile(userId: string, user: any) {
        try {
            const updatedUser = await this.userRepository.updateUser(userId, user);
            if (!updatedUser) {
                throw new Error('Failed to update profile');
            }
            return { message: "Profile updated successfully" };
        } catch (err) {
            console.error("Error occurred while updating profile:", err);
            throw err;
        }
    }

    /**
     * Updates a user's account status in the database.
     * 
     * @param {string} userId - The ID of the user whose account status is to be updated.
     * @param {string} accountStatus - The account status to be updated.
     * @returns {Promise<{ message: string }>} A promise that resolves to an
     *          object with a message indicating the success of the operation.
     * @throws {Error} If there is an error while updating the user's account status.
     */
    async changeAccountStatus(userId: string, accountStatus: string) {
        try {
            const updatedUser = await this.userRepository.updateUser(userId, { accountStatus });
            if (!updatedUser) {
                throw new Error('Failed to update account status');
            }
            return { message: "Account status updated successfully" };
        } catch (err) {
            console.error("Error occurred while updating account status:", err);
            throw err;
        }
    }

    /**
     * Adds a new app with specified permissions to a user's account.
     * 
     * @param {string} appId - The ID of the app to be added.
     * @param {string} permission - The permission level for the app.
     * @param {string} userId - The ID of the user to whom the app is to be added.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object
     *          with a message indicating the success of the operation.
     * @throws {Error} If there is an error while adding the app, such as the user
     *          not being found.
     */
    async addApp(appId: string, permission: string, userId: string) {
        try {
            const newApp = { appId, permission };
            const existingUserData = await this.userRepository.getUserById(userId);
            if (!existingUserData) {
                throw new Error('User not found');
            }
            existingUserData.apps.push(newApp);
            let updates = {
                apps: existingUserData.apps
            };
            const updatedUser = await this.userRepository.updateUser(existingUserData._id, updates);
            if (!updatedUser) {
                throw new Error('Failed to add app');
            }
            return { message: "App added successfully" };
        } catch (err) {
            console.error("Error occurred while adding app:", err);
            throw err;
        }
    }

    /**
     * Updates the permission level of an app associated with a user's account.
     * 
     * @param {string} appId - The ID of the app to be updated.
     * @param {string} permission - The permission level to be updated.
     * @param {string} userId - The ID of the user whose app is to be updated.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object
     *          with a message indicating the success of the operation.
     * @throws {Error} If there is an error while updating the app, such as the user
     *          not being found.
     */
    async updateApp(appId: string, permission: string, userId: string) {
        try {
            const existingUserData = await this.userRepository.getUserById(userId);
            if (!existingUserData) {
                throw new Error('User not found');
            }
            const updatedApps = existingUserData.apps.map((app: any) => {
                if (app.appId === appId) {
                    return { ...app, permission };
                }
                return app;
            });
            let updates = {
                apps: updatedApps
            };
            const updatedUser = await this.userRepository.updateUser(existingUserData._id, updates);
            if (!updatedUser) {
                throw new Error('Failed to update app');
            }
            return { message: "App updated successfully" };
        } catch (err) {
            console.error("Error occurred while updating app:", err);
            throw err;
        }
    }

    /**
     * Removes an app associated with a user's account.
     * 
     * @param {string} appId - The ID of the app to be removed.
     * @param {string} userId - The ID of the user whose app is to be removed.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object
     *          with a message indicating the success of the operation.
     * @throws {Error} If there is an error while removing the app, such as the user
     *          not being found.
     */
    async removeApp(appId: string, userId: string) {
        try {
            const existingUserData = await this.userRepository.getUserById(userId);
            if (!existingUserData) {
                throw new Error('User not found');
            }
            const updatedApps = existingUserData.apps.filter((app: any) => app.appId !== appId);
            let updates = {
                apps: updatedApps
            };
            const updatedUser = await this.userRepository.updateUser(existingUserData._id, updates);
            if (!updatedUser) {
                throw new Error('Failed to remove app');
            }
            return { message: "App removed successfully" };
        } catch (err) {
            console.error("Error occurred while removing app:", err);
            throw err;
        }
    }


    /**
     * Sends a password reset email to the user's email address with a reset link.
     * 
     * @param {string} email - The email of the user requesting the password reset.
     * @param {string} redirectAppId - The ID of the app to which the reset link should redirect.
     * @param {string} redirectUrl - The URL to redirect the user to after resetting the password.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object with a message
     *          indicating the success of sending the reset password email.
     * @throws {Error} If the user is not found, or if the redirect app is not found, or if an error
     *          occurs while sending the email.
     */
    async forgotPassword(email: string, redirectAppId: string, redirectUrl: string) {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.apps.some((app: any) => app.appId === redirectAppId)) {
                throw new Error('Redirect app not found');
            }
            const redirectApp = user.apps.find((app: any) => app.appId === redirectAppId);
            if (!redirectApp) {
                throw new Error('Redirect app not found');
            }
            const payload: IUserPayload = {
                _id: user._id,
                email: user.email,
                accountStatus: user.accountStatus,
                app: {
                    appId: redirectApp.appId,
                    permission: redirectApp.permission
                },
            };
            const token = await GenerateSignature(payload, '1d');
            const resetPasswordUrl = `${configs.CLIENT_URL}/reset-password?token=${token}&redirectUrl=${redirectUrl}`;
            await sendEmail(email, 'Reset Password', resetPasswordUrl);
            return { message: "Reset password email sent successfully" };
        } catch (err) {
            console.error("Error occurred while sending reset password email:", err);
            throw err;
        }
    }

    /**
     * Resets the password for a user.
     * 
     * @param {string} password - The new password to set for the user.
     * @param {IUserPayload} userPayload - The payload containing user information, including the user's unique ID.
     * @returns {Promise<boolean>} A promise that resolves to true if the password update is successful.
     * @throws {Error} If there is any error during the password reset process, such as failing to update the user.
     */
    async resetPassword(password: string, userPayload: IUserPayload) {
        try {
            const salt = await GenerateSalt();
            const userPassword = await GeneratePassword(password, salt);
            const updatedUser = await this.userRepository.updateUser(userPayload._id, {
                password: userPassword,
                salt,
            });
            if (!updatedUser) {
                throw new Error('Failed to update password');
            }
            return true;
        } catch (err) {
            console.error("Error occurred while resetting password:", err);
            throw err;
        }
    }
}