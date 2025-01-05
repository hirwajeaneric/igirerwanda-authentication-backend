import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

// Type the handler explicitly
export const handleValidationErrors: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array()[0].msg });
        return;
    }
    next();
};
export const validateUserSignIn: RequestHandler[] = [
    body('email')
        .not()
        .isEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email')
        .normalizeEmail(),
    body('password')
        .not()
        .isEmpty()
        .withMessage('Password is required')
        .isStrongPassword()
        .withMessage('Password must be at least 6 characters with an Upper case character, lower case character, symbol and digit.'),
    body('redirectUrl')
        .not()
        .isEmpty()
        .withMessage('Redirect URL is required'),
    body('redirectAppId')
        .not()
        .isEmpty()
        .withMessage('Redirect App ID is required'),
    handleValidationErrors
];

export const validateUserSignUp: RequestHandler[] = [
    body('firstName')
        .isString()
        .withMessage('First name must be a string')
        .isLength({ min: 2 })
        .withMessage('First name is required'),
    body('lastName')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 2 })
        .withMessage('Last name is required'),
    body('email')
        .not()
        .isEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email')
        .normalizeEmail(),
    body('password')
        .not()
        .isEmpty()
        .withMessage('Password is required')
        .isStrongPassword()
        .withMessage('Password must be at least 6 characters with an Upper case character, lower case character, symbol and digit.'),
    handleValidationErrors
];

export const validateUpdateUserInfo: RequestHandler[] = [
    body('firstName')
        .isString()
        .withMessage('First name must be a string')
        .isLength({ min: 2 })
        .withMessage('First name is required'),
    body('lastName')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 2 })
        .withMessage('Last name is required'),
    body('email')
        .not()
        .isEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email')
        .normalizeEmail(),
    body('accountStatus')
        .not()
        .isEmpty()
        .withMessage('Account status is required'),
    handleValidationErrors
];

export const validateEmail: RequestHandler[] = [
    body('email')
        .not()
        .isEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email'),
    handleValidationErrors
];

export const validatePasswordReset: RequestHandler[] = [
    body('password')
        .not()
        .isEmpty()
        .withMessage('Password must be provided')
        .isStrongPassword()
        .withMessage('Password must be at least 6 characters with an Upper case character, lower case character, symbol and digit.'),
    handleValidationErrors
];