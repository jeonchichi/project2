import { Controller, Get, Query } from '@nestjs/common';
import { CoursesService, CourseWithTime } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly svc: CoursesService) {}
  
  @Get()
  async byRoom(
    @Query('room') room: string,
  ): Promise<CourseWithTime[]> {
    return this.svc.findCoursesByRoom(room);
  }
}