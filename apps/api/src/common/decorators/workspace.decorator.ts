import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentWorkspace = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const workspace = request.workspace;
    return data ? workspace?.[data] : workspace;
  },
);

export const CurrentMembership = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.membership;
  },
);
