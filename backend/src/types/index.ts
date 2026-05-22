import { Request } from 'express';

export interface ITokenPayload {
  id: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Worker';
}

export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}
