import * as google from '../api/google';
import { indexToLetter } from '../js/utils';

export const getHeaders = async (scoreType) => {
  console.log('getHeaders', scoreType);

  if (!(await google.isSignedIn())) return {};

  const { rows = [], columns: dates = [] } = await google.getSheetHeaders(
    scoreType,
    1,
    3
  );
  const names = rows.map(([id, name, section]) => ({
    id,
    name,
    section,
  }));
  console.log('getHeaders', scoreType, { names, dates });
  return { names, dates };
};

export const saveData = async ({ scoreType, values }) => {
  if (!scoreType) return;
  if (!(await google.isSignedIn())) return;

  const rangesAndValues =
    (values &&
      values.map(({ ri, ci, value }) => {
        const col = indexToLetter(ci);
        const row = ri + 2;
        const range = `${scoreType}!${col}${row}`;
        return [range, value];
      })) ||
    [];
  console.log('saveData', { rangesAndValues });
  return google.saveData(rangesAndValues);
};

export const getData = async ({ scoreType, indices }) => {
  console.log('getData', { scoreType, indices });
  if (!(await google.isSignedIn())) return [];

  const ranges = indices.map(([ri, ci]) => {
    const col = indexToLetter(ci);
    return `${scoreType}!${col}${2 + ri}`;
  });

  console.log('getData', { ranges });

  const colData = await google.getSheetData(ranges);
  console.log('getData', { colData, indices });

  const data = indices.map(([ri], i) => ({
    index: ri,
    value: colData && colData[i] && colData[i][0][0],
  }));
  console.log('getData', { data });
  return data;
};
