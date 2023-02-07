import express, { Router, Request, Response } from 'express';
import Container from 'typedi';
import bcrypt from 'bcryptjs';
import { SearchKeys } from '@user/types/user.interface';
import {
  CreateUserValidations,
  PasswordChangeValidations,
  // UpdateUserValidations,
  UserLoginValidations,
} from '@user/validators/user.validator';
import { validates } from '@global/middlewares/express-validation.middle';
import { wrap } from '@global/middlewares/wraps.middle';
import BadRequestError from '@global/errors/bad-request.error';
import User from '@database/entity/user/user.entity';
import UserService from '@user/services/user.service';
import { getLongLivedToken } from '@global/utils/jwt.utils';
import { auth } from '@global/middlewares/auth.middle';

const router: Router = express.Router();

router.post(
  '/',
  [auth()],
  [validates(CreateUserValidations)],
  wrap(async (req: Request, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const newUser: User = await userService.create({ ...req.body });
    return res.status(201).json({
      message: 'Request Successfull',
      data: newUser,
    });
  }),
);

router.post(
  '/login',
  [validates(UserLoginValidations)],
  wrap(async (req: Request, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const user: User | null = await userService.getByUserName(req.body.userName);
    if (!user) throw new BadRequestError('Invalid Credential');
    const isPassMatched: boolean = await bcrypt.compare(req.body.password, user.password);
    if (!isPassMatched) throw new BadRequestError('Invalid Credential');

    const token: string = await getLongLivedToken({ id: user.id }, '12h');
    return res.status(200).json({
      message: 'Request Successfull',
      data: {
        accessToken: token,
      },
    });
  }),
);

router.post(
  '/duplication',
  [auth()],
  wrap(async (req: Request, res: Response) => {
    const bodyKey: SearchKeys = Object.keys(req.body)[0] as any;
    const userService: UserService = Container.get(UserService);
    const user: User | null = await userService.adminDuplicationCheck({
      key: bodyKey,
      value: req.body[bodyKey],
    });
    return res.status(200).json({
      message: 'Request Successfull',
      data: user,
    });
  }),
);

/**
 *  Admin
 */

router.post(
  '/admin',

  wrap(async (req: Request, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const allAdmin: User[] = await userService.getAdmin();

    return res.status(200).json({
      message: 'Request Successfull',
      data: allAdmin,
    });
  }),
);

/**
 *  Single admin
 */

router.post(
  '/admin/:id',

  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const singleAdmin: User | null = await userService.getSingleAdmin(req.params.id);
    return res.status(200).json({
      message: 'Request Successfull',
      data: singleAdmin,
    });
  }),
);

router.post(
  '/search',

  wrap(async (req: Request, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const user: any[] = await userService.search({ ...req.body });

    return res.status(200).json({
      message: 'Request Successfull',
      data: user,
    });
  }),
);

/**
 *  update admin
 */

router.put(
  '/',
  [auth()],
  // [validates(UpdateUserValidations)],
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const userService: UserService = Container.get(UserService);

    const user: User = await userService.updateAdmin(req.user.id, req.body);
    return res.status(200).json({
      message: 'Successfully Updated',
      data: user,
    });
  }),
);

router.put(
  '/:id',
  [auth()],
  // [validates(UpdateUserValidations)],
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const user: User = await userService.updateAdmin(req.params.id, req.body);
    return res.status(200).json({
      message: 'Successfully Updated',
      data: user,
    });
  }),
);

/**
 *  delete admin
 */

router.delete(
  '/:userName',
  wrap(async (req: Request<{ userName: string }>, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const user: string = await userService.deleteAdmin(req.params.userName);
    return res.status(200).json({
      message: 'Successfully Deleted',
      data: user,
    });
  }),
);

/**
 *  get user
 */

router.get(
  '/:id',
  [auth()],
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const singleAdmin: User | null = await userService.getSingleUser(req.params.id);
    return res.status(200).json({
      message: 'Request Successfull',
      data: singleAdmin,
    });
  }),
);

/**
 *  get user
 */

router.post(
  '/password',
  [auth()],
  [validates(PasswordChangeValidations)],
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const user: User | null = await userService.getSingleUserPassword(req.user.id);
    if (!user) throw new BadRequestError('Invalid Credential');
    const isPassMatched: boolean = await bcrypt.compare(req.body.password, user.password);
    //if (!isPassMatched) throw new BadRequestError('Invalid Credential');
    return res.status(200).json({
      message: isPassMatched,
    });
  }),
);

router.post(
  '/userName',
  [auth()],
  // [validates(PasswordChangeValidations)],
  wrap(async (req: Request<{ id: number }>, res: Response) => {
    const userService: UserService = Container.get(UserService);
    const user: User | null = await userService.getSingleUserPassword(req.user.id);
    if (!user) throw new BadRequestError('Invalid Credential');
    const isPassMatched: boolean = await bcrypt.compare(req.body.userName, user.password);
    //if (!isPassMatched) throw new BadRequestError('Invalid Credential');
    return res.status(200).json({
      message: isPassMatched,
    });
  }),
);

export default router;
