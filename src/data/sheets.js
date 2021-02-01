import { logger } from '../js/utils';
const { log } = logger('sheet');

import {
  getSheetData,
  saveSheetData,
  appendSheetData,
} from '../api/google-sheet';
import { toJson } from '../js/utils';

export const readStudentRegister = async ({ date, section }) => {
  await saveSheetData([
    ['STUDENT_REGISTER_QUERY_CLASS', section],
    ['STUDENT_REGISTER_QUERY_DATE', date.toISOString().slice(0, 10)],
  ]);
  const data = await getSheetData('STUDENT_REGISTER_QUERY_RESULT');
  return toJson([['id', 'type', 'value', 'timestamp'], ...data.slice(1)]);
};

export const writeStudentRegister = async (registerRecords) => {
  if (!registerRecords.length) return;
  const values = registerRecords.map(({ date, section, id, type, value }) => [
    new Date(),
    date,
    section,
    id,
    type,
    value,
    navigator.userAgent,
  ]);
  await appendSheetData('STUDENT_REGISTER_DATA', values);
};

export const getActiveStudents = async () => {
  const data = await getSheetData('student-registrations!A2:F');
  log('getActiveStudents result', { data });
  const headers = ['id', 'name', 'section', 'term1', 'term2', 'term3'];
  const students = toJson([headers, ...data]);
  log('jsonisfied data', students);
  return students;
};
