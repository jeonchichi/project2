import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

interface RawCourse {
  courseId: string;
  department: string;
  courseName: string;
  time: string;
  room: string;
}

interface ScheduleItem {
  day: string;
  period: string;
  room: string;
}

export interface CourseWithTime {
  courseId: string;
  department: string;
  courseName: string;
  time: string; // e.g. "월3" or "화5/6"
  room: string;
}

@Injectable()
export class CoursesService {
  private readonly db: DynamoDBDocumentClient;
  private readonly TABLE = 'Courses';

  private readonly DAY_MAP_KR: Record<string, string> = {
    Mon: '월',
    Tue: '화',
    Wed: '수',
    Thu: '목',
    Fri: '금',
  };
  private readonly DAY_MAP_EN: Record<string, string> = {
    월: 'Mon',
    화: 'Tue',
    수: 'Wed',
    목: 'Thu',
    금: 'Fri',
  };

  constructor() {
    const client = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.db = DynamoDBDocumentClient.from(client);
  }

  private parseSchedule(row: RawCourse): ScheduleItem[] {
    const timeParts = row.time.split('/');
    const roomParts = row.room.split('/');
    const schedule: ScheduleItem[] = [];
    let prevDayKr: string | null = null;
    let roomIdx = 0;

    for (const tp of timeParts) {
      const m = tp.match(/^([월화수목금])(\d+)$/);
      if (m) {
        const [, dayKr, period] = m;
        if (prevDayKr !== null && dayKr !== prevDayKr) {
          roomIdx = Math.min(roomIdx + 1, roomParts.length - 1);
        }
        prevDayKr = dayKr;
        schedule.push({
          day: this.DAY_MAP_EN[dayKr],
          period,
          room: roomParts[roomIdx],
        });
      } else {
        const last = schedule[schedule.length - 1];
        if (last) {
          schedule.push({
            day: last.day,
            period: tp,
            room: roomParts[roomIdx],
          });
        }
      }
    }

    return schedule;
  }

  async findCoursesByRoom(room: string): Promise<CourseWithTime[]> {
    const { Items } = await this.db.send(new ScanCommand({ TableName: this.TABLE }));
    const raw = Items as RawCourse[];
    const withSched = raw.map(r => ({ ...r, schedule: this.parseSchedule(r) }));
    const filtered = withSched.filter(r => r.schedule.some(s => s.room === room));

    const result: CourseWithTime[] = [];
    for (const r of filtered) {
      const sched = r.schedule.filter(s => s.room === room);
      const dayGroups: Record<string, string[]> = {};
      sched.forEach(s => {
        (dayGroups[s.day] ||= []).push(s.period);
      });
      for (const [dayEn, periods] of Object.entries(dayGroups)) {
        result.push({
          courseId: r.courseId,
          department: r.department,
          courseName: r.courseName,
          time: `${this.DAY_MAP_KR[dayEn]}${periods.join('/')}`,
          room,
        });
      }
    }
    return result;
  }
}