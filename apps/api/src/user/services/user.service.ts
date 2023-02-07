import User from '@database/entity/user/user.entity';
import AppDataSource from '@database/index';
import bcrypt from 'bcryptjs';
import { ICreateUser, IUserDuplicateCheck, IUserName } from '@user/types/user.interface';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

@Service()
export default class UserService {
  // Create Admin
  async create(data: ICreateUser): Promise<User> {
    const manager: EntityManager = AppDataSource.manager;
    const newUser: User = await manager.getRepository(User).create({
      ...data,
    });
    return await manager.getRepository(User).save(newUser);
  }

  // user login
  async getByUserName(userName: string): Promise<User | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).findOne({
      where: {
        userName: userName,
      },
      select: ['id', 'password'],
    });
  }

  // Admin Duplication Check
  async adminDuplicationCheck(data: IUserDuplicateCheck): Promise<User | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).findOne({
      where: {
        [data.key]: data.value,
      },
    });
  }

  // get single admin
  async getAdmin(): Promise<User[]> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).find({
      order: {
        createDate: 'DESC',
      },
    });
  }

  // get single admin
  async getSingleAdmin(id: number): Promise<User | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).findOne({
      where: {
        id: id,
      },
    });
  }

  async getSingleUser(id: number): Promise<User | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).findOne({
      where: {
        id: id,
      },
    });
  }

  async getSingleUserPassword(id: number): Promise<User | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).findOne({
      where: {
        id: id,
      },
      select: ['password'],
    });
  }

  // search
  async search(data: IUserName): Promise<any[]> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(User).find({
      where: {
        userName: data.userName,
      },
    });
  }

  async updateAdmin(id: number, data: ICreateUser): Promise<User> {
    const manager: EntityManager = AppDataSource.manager;
    const user: User | null = await manager.getRepository(User).findOne({
      where: {
        id: id,
      },
    });
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return await manager.getRepository(User).save({
      ...user,
      ...data,
    });
  }

  //delete admin
  async deleteAdmin(userName: string, tem?: EntityManager): Promise<string> {
    const manager: EntityManager = tem || AppDataSource.manager;
    await manager.getRepository(User).delete({ userName });
    return userName;
  }
}
