import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    // .env 를 전역으로 사용
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CoursesModule,
  ],
})
export class AppModule {}