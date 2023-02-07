import {
  ICreateEmployee,
  ICreateFalseMatch,
  ICreateVerificationLog,
  IDuplicateCheck,
  IEmployeeId,
  IFaceCount,
  IHrEnroll,
  IUpdateEmployee,
  IUpdateEmployeeId,
} from '@employee/types/employee.interface';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import { format } from 'date-fns';
import AppDataSource from '@database/index';
import Employee from '@database/entity/employee/employee.entity';
import appConfig from '@config/app.config';
import Verification from '@database/entity/employee/verification.entity';
import FalseVerification from '@database/entity/employee/false-verification.entity';
import { getPaginationDetails } from '@employee/utils/employee.utils';

@Service()
export default class EmployeeService {
  constructor() {}
  // create a new employee
  async create(data: ICreateEmployee): Promise<Employee> {
    const manager: EntityManager = AppDataSource.manager;
    const newEmployee: Employee = await manager.getRepository(Employee).create({
      ...data,
    });
    return await manager.getRepository(Employee).save(newEmployee);
  }

  // create new verification
  async createVerify(data: ICreateVerificationLog): Promise<Verification> {
    const manager: EntityManager = AppDataSource.manager;
    const verifyEmployee: Verification = await manager.getRepository(Verification).create({ ...data });
    return await manager.getRepository(Verification).save(verifyEmployee);
  }

  //create false matching
  async createFalseMatch(data: ICreateFalseMatch): Promise<FalseVerification> {
    const manager: EntityManager = AppDataSource.manager;
    const falseVerification: FalseVerification = await manager.getRepository(FalseVerification).create({ ...data });
    return await manager.getRepository(FalseVerification).save(falseVerification);
  }

  // face enroll
  async faceEnrollApi(data: ICreateEmployee): Promise<any> {
    const enroll = {
      customerNumber: data.employeeId,
      payload: {
        name: data.name,
        mobileNo: data.mobileNo,
      },
      faceImage: data.image,
    };
    try {
      const res = await axios.post(appConfig.faceEnroll, enroll);
      return res;
    } catch (error) {
      return error;
    }
  }

  // face verification
  async faceVerifyApi(data: ICreateVerificationLog): Promise<any> {
    const verifyImage = {
      faceImage: data.image,
    };

    try {
      const res = await axios.post(appConfig.faceVerification, verifyImage);
      return res;
    } catch (error: any) {
      console.log(error);
    }
  }

  // get all employee
  async get(): Promise<Employee[]> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(Employee).find({
      order: {
        createDate: 'DESC',
      },
    });
  }

  // get single employee
  async getSingleEmployee(id: number): Promise<Employee | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(Employee).findOne({
      where: {
        id: id,
      },
    });
  }

  // employee ID unique check
  async checkUnique(data: string): Promise<Employee | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(Employee).findOne({
      where: {
        employeeId: data,
      },
    });
  }

  // search employee Id for false verification log
  async search(data: IEmployeeId): Promise<any[]> {
    const manager: EntityManager = AppDataSource.manager;

    // return await manager.query(`SELECT fvl.id,fvl.name,fvl."employeeId",fvl.image,fvl."createDate",e."mobileNo" FROM false_verification_log as fvl
    // LEFT JOIN employee as e ON fvl."employeeId" = e."employeeId" WHERE fvl."employeeId" = ${data.employeeId}`)

    return await manager.getRepository(FalseVerification).find({
      where: {
        employeeId: data.employeeId,
      },
    });
  }

  // get all false verification log

  async getFalseVerificationLog(): Promise<any[]> {
    const manager: EntityManager = AppDataSource.manager;
    // return await manager
    //   .getRepository(FalseVerification)
    //   .createQueryBuilder('false_verificaiton_log')
    //   .leftJoinAndSelect(Employee, 'employee', 'false_verificaiton_log.employeeId = employee.employeeId')
    //   .getRawMany();
    return manager.query(`SELECT fvl.id, fvl.name, fvl."employeeId", fvl.image, fvl."createDate", e.image as eimage,e."mobileNo"  
                          FROM false_verification_log as fvl LEFT JOIN employee as e
                          ON e."employeeId" = fvl."employeeId"`);
  }

  // count of all employee
  async getEmployee(page: number): Promise<any> {
    const manager: EntityManager = AppDataSource.manager;
    const count: number = await manager.getRepository(Employee).count();
    const paginationDetails = getPaginationDetails(page, count);
    //console.log('paginationDetails', paginationDetails);
    const res = await manager.getRepository(Employee).find({
      order: { createDate: 'DESC' },
      skip: paginationDetails?.skip,
      take: paginationDetails?.limit,
    });

    //console.log('pagination res', res);

    return {
      totalPage: paginationDetails?.total,
      totalUser: count,
      limit: paginationDetails?.limit,
      currentPage: page,
      employee: res,
    };
  }

  // count all verification
  async getVerification(page: number): Promise<any> {
    const manager: EntityManager = AppDataSource.manager;
    const count: number = await manager.getRepository(Verification).count();
    const paginationDetails = getPaginationDetails(page, count);
    const res = await manager.getRepository(Verification).find({
      order: { createDate: 'DESC' },
      skip: paginationDetails?.skip,
      take: paginationDetails?.limit,
    });
    return {
      totalPage: paginationDetails?.total,
      totalUser: count,
      limit: paginationDetails?.limit,
      currentPage: page,
      verification: res,
    };
  }

  // count all false verification
  async getAllFalseVerification(page: number): Promise<any> {
    const manager: EntityManager = AppDataSource.manager;
    const count: number = await manager.getRepository(FalseVerification).count();
    const paginationDetails = getPaginationDetails(page, count);
    if (paginationDetails === undefined) {
      return {
        totalUser: 0,
        currentPage: page,
        falseVerificaiton: [],
      };
    }
    const res =
      await manager.query(`SELECT fvl.id, fvl.name, fvl."employeeId", fvl.image, fvl."createDate", e.image as eimage,e."mobileNo"  
                          FROM false_verification_log as fvl LEFT JOIN employee as e
                          ON e."employeeId" = fvl."employeeId" LIMIT ${paginationDetails?.limit} OFFSET ${paginationDetails?.skip}`);

    // const res = manager.getRepository(FalseVerification).find({
    //   order: { createDate: 'DESC' },
    //   skip: paginationDetails?.skip,
    //   take: paginationDetails?.limit,
    // });

    return {
      totalPage: paginationDetails?.total,
      totalUser: count,
      limit: paginationDetails?.limit,
      currentPage: page,
      falseVerificaiton: res,
    };
  }

  // employee id updated
  async updateEmployeeId(data: IUpdateEmployeeId): Promise<Verification | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager
      .getRepository(Verification)
      .createQueryBuilder()
      .update(Verification)
      .set({ employeeId: data.employeeId })
      .where('id = :id', { id: data.id })
      .returning('*')
      .execute()
      .then((response) => {
        return response.raw[0];
      });
  }

  // verificaiton details
  async verificationDetails(data: IEmployeeId): Promise<Verification[] | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(Verification).find({
      where: {
        employeeId: data.employeeId,
      },
    });
  }

  // Duplication Check

  async duplicationCheck(data: IDuplicateCheck): Promise<Employee | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(Employee).findOne({
      where: {
        [data.key]: data.value,
      },
    });
  }

  //Delete

  async deleteEmployee(employeeId: number): Promise<any> {
    try {
      const manager: EntityManager = AppDataSource.manager;
      return await manager
        .getRepository(Employee)
        .createQueryBuilder()
        .delete()
        .from(Employee)
        .where('employeeId = :employeeId', { employeeId })
        .execute();
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  async FaceDeleteApi(customerNumber: number): Promise<any> {
    try {
      return await axios.delete(`${appConfig.faceDelete}`, {
        data: {
          customerNumber: customerNumber,
        },
      });
    } catch (error: any) {
      console.log('face delete error', error);
      return null;
    }
  }
  // face Count
  async faceCountApi(data: IFaceCount): Promise<any> {
    const imageCount = {
      image: data.image,
    };
    try {
      const res = await axios.post(appConfig.faceCount, imageCount);
      return res;
    } catch (error: any) {
      console.log(error);
    }
  }

  // face update api
  async faceUpdateApi(id: number, data: IUpdateEmployee): Promise<any> {
    const manager: EntityManager = AppDataSource.manager;
    const employee: Employee | null = await manager.getRepository(Employee).findOne({
      where: {
        id: id,
      },
    });
    const updateEmployee: any = {
      customerNumber: employee?.employeeId,
      updatable: {
        payload: {},
      },
    };

    if (data.name) updateEmployee.updatable.payload['name'] = data.name;
    if (data.mobileNo) updateEmployee.updatable.payload['mobileNo'] = data.mobileNo;
    if (data.image) updateEmployee.updatable['faceImage'] = data.image;
    if (data.employeeId) updateEmployee.updatable['customerNumber'] = data.employeeId;

    try {
      const res = await axios.put(`${appConfig.empUpdate}`, updateEmployee);
      return res;
    } catch (error: any) {
      console.log(error);
    }
  }

  // employe update with partial update
  async updateEmployee(id: number, data: IUpdateEmployee): Promise<Employee> {
    const manager: EntityManager = AppDataSource.manager;
    const employee: Employee | null = await manager.getRepository(Employee).findOne({
      where: {
        id: id,
      },
    });
    return await manager.getRepository(Employee).save({
      ...employee,
      ...data,
    });
  }

  // employee search

  async employeeSearch(data: IEmployeeId): Promise<Employee[] | null> {
    const manager: EntityManager = AppDataSource.manager;
    return await manager.getRepository(Employee).find({
      where: {
        employeeId: data.employeeId,
      },
    });
  }

  // hr enroll

  async hrEnroll(data: IHrEnroll): Promise<any> {
    const enroll = {
      empcode: data.employeeId,
      logtime: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
      terminal: data.terminal,
    };
    //console.log('enroll', enroll);

    try {
      const res = await axios.post(appConfig.hrEnroll, enroll);
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}
