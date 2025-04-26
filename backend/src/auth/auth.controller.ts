import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입: POST /auth/signup
  @Post('signup')
  async signUp(
    @Body() body: {
      studentId: string;
      password: string;
      name: string;
      department: string;
    },
  ) {
    return this.authService.signUp(
      body.studentId,
      body.password,
      body.name,
      body.department,
    );
  }

  // 로그인: POST /auth/login
  @Post('login')
  async login(@Body() body: { studentId: string; password: string }) {
    return this.authService.login(body.studentId, body.password);
  }

  // 비밀번호 변경: PATCH /auth/password (인증 필요)
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(
    @Req() request: Request,
    @Body() body: { oldpassword: string; newpassword: string },
  ) {
    const studentId = (request as any).user.studentId;
    return this.authService.changePassword(
      studentId,
      body.oldpassword,
      body.newpassword,
    );
  }

  // 회원 탈퇴: DELETE /auth/delete (인증 필요)
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteUser(
    @Req() request: Request,
    @Body() body: { password: string },
  ) {
    const studentId = (request as any).user.studentId;
    return this.authService.deleteUser(studentId, body.password);
  }

  // 내 정보 조회: GET /auth/me (인증 필요)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@Req() request: Request) {
    const studentId = (request as any).user.studentId;
    return this.authService.getMyInfo(studentId);
  }

  // 공개 사용자 조회: GET /auth/user/:studentId
  @Get('user/:studentId')
  async findUser(@Param('studentId') studentId: string) {
    return this.authService.findUser(studentId);
  }
}