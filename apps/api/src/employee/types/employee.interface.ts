export interface ICreateEmployee {
  name: string;
  employeeId: string;
  image: string;
  mobileNo: string;
}

export interface ICreateFalseMatch {
  name: string;
  employeeId: string;
  image: string;
}

export interface ICreateVerificationLog {
  image: string;
  employeeId: string;
}

export interface ICreateFalseVerificationLog {
  name: string;
  employeeId: string;
  captureImage: string;
}

export type SearchKeys = 'mobileNo' | 'employeeId';

export interface IDuplicateCheck {
  key: SearchKeys;
  value: string;
}

export interface IEmployeeId {
  employeeId: string;
}

export interface IUpdateEmployeeId {
  id: number;
  employeeId: string;
}

export interface IFaceCount {
  image: string;
}

export interface IUpdateEmployee {
  employeeId?: string;
  name?: string;
  mobileNo?: string;
  image?: string;
}

export interface IFaceDelete {
  employeeId?: string;
}

export interface IUpdateEmployee {
  employeeId?: string;
  name?: string;
  mobileNo?: string;
  image?: string;
}

export interface IHrEnroll {
  employeeId: string;
  terminal: string;
}
