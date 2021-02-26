import {
  dateToSerial,
  serialToDate,
  serialToTimestamp,
  toCamelCase,
  toJson,
  timestampToSerial,
} from '../js/utils';
import { getSheetData, saveSheetData, appendSheetData } from '../api/google-sheet';

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

const generateId = (name, timestamp) => {
  const [a, b] = name.toString().toLowerCase().split('');
  const t = new Date(timestamp).valueOf().toString(36);
  return [a, b, t].join('');
};

export const writeTeacherCheckIn = async ({ name, date, time, section, type, username, id }) => {
  const _timestamp = new Date();
  const timestamp = timestampToSerial(_timestamp);
  const uid = id || generateId(username, _timestamp);
  const row = [timestamp, name, date, section, type, time, username, uid];
  return appendSheetData('TEACHER_ATTENDANCE_DATA', [row]);
};

export const getTeachersCheckins = async () => {
  const data = await getSheetData('TEACHER_ATTENDANCE_DATA_QUERY');
  if (!data || data.length < 2) return [];
  const headers = data[0].map(toCamelCase);
  const jsonArray = toJson([headers, ...data.slice(1)], {
    timestamp: (x) => serialToTimestamp(x),
    date: (x) => serialToDate(x).toISOString().slice(0, 10),
    time: (x) => serialToTimestamp(x).toLocaleTimeString(),
  });
  return jsonArray.filter((r) => r.type !== 'Deleted');
};
