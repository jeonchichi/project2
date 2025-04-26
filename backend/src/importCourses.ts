import 'dotenv/config';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const tableName = 'Courses';

// 1) AWS SDK v3 클라이언트 생성
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// 2) DocumentClient 스타일 래퍼 생성
const db = DynamoDBDocumentClient.from(client);

const itemsMap = new Map<string, any>();

fs.createReadStream(__dirname + '/courses.csv')
  .pipe(
    csv({
      headers: ['courseId', 'department', 'courseName', 'time', 'room'],
      strict: true,
    }),
  )
  .on('data', (row) => {
    if (!row.courseId) return;
    itemsMap.set(row.courseId, {
      courseId: row.courseId,
      department: row.department,
      courseName: row.courseName,
      time: row.time,
      room: row.room,
    });
  })
  .on('end', async () => {
    console.log('CSV 읽기 완료. 최종 항목 수 (중복 제거 후):', itemsMap.size);

    // PutRequest 배열 생성
    const items = Array.from(itemsMap.values()).map((item) => ({
      PutRequest: { Item: item },
    }));

    // 25개씩 배치 업로드
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      try {
        await db.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: batch,
            },
          }),
        );
        console.log(`Batch Write 성공 (항목 ${i + 1}~${i + batch.length})`);
      } catch (err) {
        console.error('Batch Write 오류:', err);
      }
    }

    console.log('모든 데이터 업로드 완료');
  })
  .on('error', (err) => {
    console.error('CSV 읽기 중 오류:', err);
  });