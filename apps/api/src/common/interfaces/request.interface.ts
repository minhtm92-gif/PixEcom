import { Request } from 'express';
import { User, Workspace, Membership } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
  workspace: Workspace;
  membership: Membership | null;
}
