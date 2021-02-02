import { dateToSerial, logger, toCamelCase } from '../js/utils';
const { log } = logger('sheet');

import {
  getSheetData,
  saveSheetData,
  appendSheetData,
} from '../api/google-sheet';
import { toJson, timestampToSerial } from '../js/utils';

export const readStudentRegister = async ({ date, section }) => {
  await saveSheetData([
    ['STUDENT_REGISTER_QUERY_CLASS', section],
    ['STUDENT_REGISTER_QUERY_DATE', dateToSerial(date)],
  ]);
  const data = await getSheetData('STUDENT_REGISTER_QUERY_RESULT');
  return toJson([data[0].map(toCamelCase), ...data.slice(1)]);
};

export const writeStudentRegister = async ({
  students,
  date,
  section,
  type,
  user,
}) => {
  if (!students.length) return;
  const values = students.map(({ id, [type]: { value } }) => [
    timestampToSerial(new Date()),
    dateToSerial(date),
    section,
    id,
    type,
    value,
    user,
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
