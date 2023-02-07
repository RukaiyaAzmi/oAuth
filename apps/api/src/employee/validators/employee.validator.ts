import EmployeeService from '@employee/services/employee.service';
import { body } from 'express-validator';
import Container from 'typedi';
//import { param } from 'express-validator';

export const CreateEmployeeValidations = [
  body('name').isString().isLength({ min: 3, max: 30 }),
  body('employeeId')
    .isString()
    .isLength({ min: 6, max: 30 })
    .custom(async (value) => {
      const employeeService: EmployeeService = Container.get(EmployeeService);
      const res = await employeeService.checkUnique(value);
      if (res) {
        throw new Error('Employee ID is exist');
      }
    }),
  body('image').isString().isBase64(),
  body('mobileNo').isString().isLength({ min: 11, max: 11 }),
];

export const CreateFalseMatchingValidations = [
  body('name').isString().isLength({ min: 3, max: 30 }),
  body('employeeId').isString().isLength({ min: 6, max: 30 }),
  body('image').isString().isBase64(),
];

export const CreateVerificationValidations = [body('image').isString().isBase64()];

export const CreateSearchValidations = [body('employeeId').isString().isLength({ min: 6, max: 30 })];

// export const UpdateUserValidations = [
//   param('id').isNumeric().toInt(),
//   body('name').isLength({ min: 3, max: 30 }).optional(),
//   body('email').isEmail().optional(),
//   body('mobile').isMobilePhone('bn-BD').optional(),
//   body('gender').isIn(['M', 'F', 'T']).optional(),
// ];

// export const DeleteUserValidations = [param('id').isNumeric().toInt()];
