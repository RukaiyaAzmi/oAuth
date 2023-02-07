import Employee from '@database/entity/employee/employee.entity';
import FalseVerification from '@database/entity/employee/false-verification.entity';
import Verification from '@database/entity/employee/verification.entity';
import EmployeeService from '@employee/services/employee.service';
import { SearchKeys } from '@employee/types/employee.interface';
import {
  CreateEmployeeValidations,
  CreateFalseMatchingValidations,
  CreateVerificationValidations,
} from '@employee/validators/employee.validator';
import BadRequestError from '@global/errors/bad-request.error';
import { auth } from '@global/middlewares/auth.middle';
import { validates } from '@global/middlewares/express-validation.middle';
import { wrap } from '@global/middlewares/wraps.middle';
import express, { Router, Request, Response } from 'express';
import Container from 'typedi';

// router instance
const router: Router = express.Router();

/**
 * Create Employee
 */

router.post(
  '/',
  [validates(CreateEmployeeValidations)],
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);

    const response = await employeeService.faceEnrollApi({ ...req.body });
    if (response.status !== 201) throw new BadRequestError('Something goes Wrong');

    const employee: Employee = await employeeService.create({
      ...req.body,
    });

    return res.status(201).json({
      message: 'Request Successfull',
      data: employee,
    });
  }),
);

/**
 * Verify and multiple checking  Employee
 */

router.post(
  '/verify',
  [validates(CreateVerificationValidations)],
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const faceCount = await employeeService.faceCountApi({ ...req.body });
    const verify = await employeeService.faceVerifyApi({ ...req.body });
    //console.log('verify', verify);
    // await employeeService.createVerify({
    //   ...req.body,
    //   employeeId: verify.data.data.details.customerNumber,
    //   // count: faceCount.data.data.count,
    // });

    await employeeService.createVerify({ ...req.body, employeeId: verify.data.data.details.customerNumber });
    if (verify.data.data.found === 'YES') {
      const enrollData: any = {
        employeeId: verify.data.data.details.customerNumber,
        terminal: 'FACE_TERMINAL',
      };
      await employeeService.hrEnroll(enrollData);
      const employee: Employee | null = await employeeService.checkUnique(verify.data.data.details.customerNumber);
      if (employee === null) {
        return res.status(200).json({
          message: 'Request Successfull',
          data: {
            ...verify.data.data,
            count: faceCount.data.data,
            foundStatus: false,
          },
        });
      }
    }
    return res.status(200).json({
      message: 'Request Successfull',
      data: {
        ...verify.data.data,
        count: faceCount.data.data,
      },
    });
  }),
);

/**
 * Create False Matching
 */

router.post(
  '/false-match',
  [validates(CreateFalseMatchingValidations)],
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const falseMatch: FalseVerification = await employeeService.createFalseMatch({ ...req.body });

    return res.status(201).json({
      message: 'Request Successfull',
      data: falseMatch,
    });
  }),
);

/**
 * pagination for employee
 */

router.post(
  '/get/:page',
  [auth()],
  wrap(async (req: Request<{ page: number }>, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const response = await employeeService.getEmployee(req.params.page);

    return res.status(200).json({
      message: 'Request Successfull',
      data: response,
    });
  }),
);

/**
 * pagination for verification
 */

router.post(
  '/verification/:page',
  wrap(async (req: Request<{ page: number }>, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const response = await employeeService.getVerification(req.params.page);

    return res.status(200).json({
      message: 'Request Successfull',
      data: response,
    });
  }),
);

/**
 * pagination for false verification
 */

router.post(
  '/false/verification/:page',
  wrap(async (req: Request<{ page: number }>, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const response = await employeeService.getAllFalseVerification(req.params.page);
    return res.status(200).json({
      message: 'Request Successfull',
      data: response,
    });
  }),
);

/**
 * Get All Employee
 */

router.get(
  '/',
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const allEmployee: Employee[] = await employeeService.get();

    return res.status(200).json({
      message: 'Request Successfull',
      data: allEmployee,
    });
  }),
);

/**
 *  Single Employee
 */

router.get(
  '/:id',
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const singleEmployee: Employee | null = await employeeService.getSingleEmployee(req.params.id);
    return res.status(200).json({
      message: 'Request Successfull',
      data: singleEmployee,
    });
  }),
);

/**
 *  Search Employee with employee ID
 */

router.post(
  '/search',
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const employee: any[] = await employeeService.search({ ...req.body });

    return res.status(200).json({
      message: 'Request Successfull',
      data: employee,
    });
  }),
);

/**
 *  Verification log report
 */

router.get(
  '/verification/false-log',
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const verificationLog: any[] = await employeeService.getFalseVerificationLog();

    return res.status(200).json({
      message: 'Request Successful',
      data: verificationLog,
    });
  }),
);

/**
 *  Verification Log Details
 */

router.post(
  '/verification-log',
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const verification: Verification[] | null = await employeeService.verificationDetails({ ...req.body });
    return res.status(200).json({
      Message: 'Request Successfull',
      data: verification,
    });
  }),
);

/**
 *  Duplication Check for employee table
 */

router.post(
  '/duplication',
  wrap(async (req: Request, res: Response) => {
    const bodyKey: SearchKeys = Object.keys(req.body)[0] as any;
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const employee: Employee | null = await employeeService.duplicationCheck({
      key: bodyKey,
      value: req.body[bodyKey],
    });
    return res.status(200).json({
      message: 'Request Successfull',
      data: employee,
    });
  }),
);

router.delete(
  '/:employeeId',
  wrap(async (req: Request<{ employeeId: number }>, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const response = await employeeService.FaceDeleteApi(req.params.employeeId);
    if (response && response.status !== 200) throw new BadRequestError('something gose wrong');
    await employeeService.deleteEmployee(req.params.employeeId);
    return res.status(200).json({
      message: 'Delete Successfull',
      data: {
        id: response.data.data.employeeId,
      },
    });
  }),
);

router.patch(
  '/:id',
  [auth()],
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const response: any = await employeeService.faceUpdateApi(req.params.id, req.body);
    if (response.status !== 200) throw new BadRequestError('something gose wrong');
    const employee: Employee = await employeeService.updateEmployee(req.params.id, req.body);
    return res.status(200).json({
      message: 'Successfully Updated',
      data: employee,
    });
  }),
);

/**
 *  Employee Search
 */

router.post(
  '/employee-search',
  [auth()],
  wrap(async (req: Request, res: Response) => {
    const employeeService: EmployeeService = Container.get(EmployeeService);
    const employee: Employee[] | null = await employeeService.employeeSearch({ ...req.body });

    return res.status(200).json({
      message: 'Request Successfull',
      data: employee,
    });
  }),
);

// router.post(
//   '/hr-enroll',
//   wrap(async (req: Request, res: Response) => {
//     const employeeService: EmployeeService = Container.get(EmployeeService);
//     await employeeService.hrEnroll({ ...req.body });

//     return res.status(200).json({
//       message: 'Request Successfull',
//     });
//   }),
// );

export default router;
