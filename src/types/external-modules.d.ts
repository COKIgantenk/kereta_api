declare module 'bcrypt' {
  export function hash(
    data: string | Buffer,
    saltOrRounds: string | number,
  ): Promise<string>;
  export function compare(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean>;
}

declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>;
}

declare module 'passport-jwt' {
  import { Request } from 'express';
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface StrategyOptions {
    jwtFromRequest: (request: Request) => string | null;
    secretOrKey: string | Buffer;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify?: (...args: unknown[]) => unknown,
    );
  }

  export class ExtractJwt {
    static fromAuthHeaderAsBearerToken(): (request: Request) => string | null;
  }
}
