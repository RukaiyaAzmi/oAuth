import { body } from 'express-validator';

export const CreateUserValidations = [
  body('userName').isString().isLength({ min: 3, max: 30 }),
  body('password').isString().isLength({ min: 6, max: 30 }),
  body('mobile').isString(),
  body('email').isString(),
];

export const UserLoginValidations = [
  body('userName').isString().isLength({ min: 3, max: 30 }).withMessage('Invalid Credential'),
  body('password').isString().isLength({ min: 6, max: 30 }).withMessage('Invalid Credential'),
];

export const PasswordChangeValidations = [
  body('password').isString().isLength({ min: 6, max: 30 }).withMessage('Invalid Credential'),
];

export const UpdateUserValidations = [
  body('userName').isString().isLength({ min: 3, max: 30 }),
  body('mobile').isString().isLength({ min: 11, max: 11 }),
  body('email').isString(),
];
