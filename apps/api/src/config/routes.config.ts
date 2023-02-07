import { EmployeeModule } from '@employee/index';
import { UserModule } from '@user/index';
import { GlobalModuleConfig } from '@global/index';
import { Application } from 'express';

export default function configureRoutes(app: Application): GlobalModuleConfig[] {
  const modules: GlobalModuleConfig[] = [];

  modules.push(new EmployeeModule(app));
  modules.push(new UserModule(app));
  return modules;
}
