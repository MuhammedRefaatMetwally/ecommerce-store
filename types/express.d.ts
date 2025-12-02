import { IUserDocument } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}