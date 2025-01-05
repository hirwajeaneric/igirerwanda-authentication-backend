const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { Request } from "express";
import { IUserPayload } from "../dtos/auth.dto";
import configs from "../config";

declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload
        }
    }
};

/**
 * Generates a salt value to be used for hashing passwords.
 * @returns A promise that resolves to the generated salt value
 */
export const GenerateSalt = async () => {
    return await bcrypt.genSalt();
};

/**
 * Generates a password hash using the given password and salt.
 * @param password The password to hash
 * @param salt The salt to use when generating the hash
 * @returns A promise that resolves to the hashed password
 */
export const GeneratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
};

/**
 * Compares a given password with a saved password by generating a hash
 * of the given password using the same salt used to generate the saved
 * password, and comparing the two hashes.
 * @param enteredPassword The password to be validated
 * @param savedPassword The saved password to compare the entered password with
 * @param salt The salt used to generate the saved password
 * @returns A boolean indicating whether the entered password matches the saved password
 */
export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {
    return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

/**
 * Generates a JWT signature for the given payload. The signature
 * will expire after the given time period, or the default value
 * of configs.MAX_TOKEN_DURATION if none is provided.
 * @param payload The payload to be signed
 * @param expiry Optional expiry time for the signature
 * @returns The generated signature
 */
export const GenerateSignature = async (payload: any, expiry: string = configs.MAX_TOKEN_DURATION as string) => {
    try {
        return await jwt.sign(payload, configs.APP_SECRET, { expiresIn: expiry });
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * Verifies the JWT signature present in the Authorization header of the request.
 * If the signature is valid, the payload is stored in req.user and the function
 * returns true. If the signature is invalid or missing, the function returns false.
 * @param req The request object
 * @returns Whether the signature is valid
 */
export const ValidateSignature = async (req: Request) => {
    try {
        const signature = req.get("Authorization");
        if (!signature) {
            return false;
        }
        const payload = await jwt.verify(signature.split(" ")[1], configs.APP_SECRET);

        req.user = payload;

        if (!payload) {
            return false;
        }
        // JWT token expiration check
        if (payload.exp < Date.now() / 1000) {
            return false;
        }

        // Check if user has access to the app
        if (payload.app.appId !== 'a0') {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};