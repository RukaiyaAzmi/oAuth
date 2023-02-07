import { GlobalModuleConfig } from '@global/index';
import { Application } from 'express';
import employeeRouter from '@employee/routes/employee.route';

export class EmployeeModule extends GlobalModuleConfig {
  constructor(app: Application) {
    super(app, 'employee');
  }

  init() {
    this.app.use(this.pathVx('/'), employeeRouter);
  }
}
