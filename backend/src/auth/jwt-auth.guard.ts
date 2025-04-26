import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('인증 헤더가 없습니다.');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('잘못된 인증 헤더 형식입니다.');
    }
    const token = parts[1];

    try {
      const jwtSecret =
        this.configService.get<string>('JWT_SECRET') || 'MY_SECRET';
      const decoded = jwt.verify(token, jwtSecret);
      request.user = decoded; // req.user 에 페이로드 저장
      return true;
    } catch (err) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}