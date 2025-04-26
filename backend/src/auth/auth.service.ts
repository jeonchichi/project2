import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

interface User {
  studentId: string;
  password: string;
  name: string;
  department: string;
}

@Injectable()
export class AuthService {
  private readonly db: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly jwtSecret: string;

  constructor(private configService: ConfigService) {
    const region =
      this.configService.get<string>('AWS_REGION') || 'ap-northeast-2';
    this.tableName = this.configService.get<string>('USERS_TABLE') || 'Users';
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'MY_SECRET';

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID')!;
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    )!;

    const client = new DynamoDBClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    this.db = DynamoDBDocumentClient.from(client);
  }

  private validateStudentId(studentId: string): boolean {
    const regex = /^\d{8}$/;
    return regex.test(studentId);
  }

  private validatePassword(password: string): boolean {
    // 영어, 숫자, 특수문자만 허용하고, 특수문자는 반드시 포함
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const validCharsOnly = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>]+$/.test(password);

    return hasSpecialChar && validCharsOnly;
  }

  async signUp(
    studentId: string,
    password: string,
    name: string,
    department: string,
  ) {
    if (!this.validateStudentId(studentId)) {
      throw new BadRequestException('학번은 8자리 숫자여야 합니다.');
    }

    if (!this.validatePassword(password)) {
      throw new BadRequestException(
        '비밀번호는 영어, 숫자, 특수문자만 사용 가능하며, 특수문자를 반드시 포함해야 합니다.',
      );
    }

    if (await this.getUser(studentId)) {
      throw new ConflictException('이미 등록된 학번입니다.');
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser: User = {
      studentId,
      password: hashed,
      name,
      department,
    };

    await this.db.send(
      new PutCommand({
        TableName: this.tableName,
        Item: newUser,
      }),
    );

    return { message: '회원가입 성공' };
  }

  async login(studentId: string, password: string) {
    const user = await this.getUser(studentId);
    if (!user) {
      throw new UnauthorizedException(
        '학번 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException(
        '학번 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    const token = jwt.sign({ studentId, name: user.name }, this.jwtSecret, {
      expiresIn: '3h',
    });
    return {
      message: '로그인 성공',
      accessToken: token,
      user: {
        studentId: user.studentId,
        name: user.name,
        department: user.department,
      },
    };
  }

  async changePassword(
    studentId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.getUser(studentId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new UnauthorizedException('기존 비밀번호가 일치하지 않습니다.');
    }

    if (!this.validatePassword(newPassword)) {
      throw new BadRequestException(
        '비밀번호는 영어, 숫자, 특수문자만 사용 가능하며, 특수문자를 반드시 포함해야 합니다.',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.db.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { studentId },
        UpdateExpression: 'SET password = :p',
        ExpressionAttributeValues: { ':p': hashed },
      }),
    );
    return { message: '비밀번호 변경 성공' };
  }

  async deleteUser(studentId: string, password: string) {
    const user = await this.getUser(studentId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }
    await this.db.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { studentId },
      }),
    );
    return { message: '회원 탈퇴 성공' };
  }

  async getMyInfo(studentId: string) {
    const user = await this.getUser(studentId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    const { password, ...profile } = user;
    return { message: '내 정보 조회 성공', user: profile };
  }

  async findUser(studentId: string) {
    const user = await this.getUser(studentId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    const { password, ...profile } = user;
    return { message: '사용자 조회 성공', user: profile };
  }

  private async getUser(studentId: string): Promise<User | null> {
    const { Item } = await this.db.send(
      new GetCommand({ TableName: this.tableName, Key: { studentId } }),
    );
    return (Item as User) || null;
  }
}
