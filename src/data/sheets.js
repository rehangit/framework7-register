import { dateToSerial, serialToDate, serialToTimestamp, toCamelCase, logger } from '../js/utils';
const { log = console.log } = logger('sheet');

import { getSheetData, saveSheetData, appendSheetData } from '../api/google-sheet';
import { toJson, timestampToSerial } from '../js/utils';

export const readStudentRegister = async ({ date, section }) => {
  await saveSheetData([
    ['STUDENT_REGISTER_QUERY_SECTION', section],
    ['STUDENT_REGISTER_QUERY_DATE', dateToSerial(date)],
  ]);
  const data = await getSheetData('STUDENT_REGISTER_QUERY_RESULT');
  return data && data.length > 1 ? toJson([data[0].map(toCamelCase), ...data.slice(1)]) : [];
};

export const writeStudentRegister = async ({ students, date, section, type, user }) => {
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
  const data = await getSheetData('STUDENT_REGISTRATIONS');
  const headers = ['id', 'name', 'section', 'term1', 'term2', 'term3'];
  const students = toJson([headers, ...data.slice(1)]);
  return students;
};

export const writeTeacherCheckIn = async ({ name, datetime, section, type, username }) => {
  const serial = timestampToSerial(datetime);
  const date = Math.floor(serial);
  const time = serial % 1;
  const timestamp = timestampToSerial(new Date());
  const row = [timestamp, date, section, name, type, time, username];
  return appendSheetData('TEACHER_ATTENDANCE_DATA', [row]);
};

export const getTeachersCheckins = async () => {
  const data = await getSheetData('TEACHER_ATTENDANCE_DATA');
  if (!data || data.length < 2) return [];
  const headers = data[0].map(toCamelCase);
  return toJson([headers, ...data.slice(1)], {
    timestamp: (x) => serialToTimestamp(x),
    date: (x) => serialToDate(x),
    time: (x) => serialToTimestamp(x).toLocaleTimeString(),
  });
};

export const getStudentsPerClass = async () => {
  const data = await getSheetData('');
};
