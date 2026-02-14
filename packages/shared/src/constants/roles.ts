export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.OWNER]: 4,
  [MemberRole.ADMIN]: 3,
  [MemberRole.EDITOR]: 2,
  [MemberRole.VIEWER]: 1,
};
