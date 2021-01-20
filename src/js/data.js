import { logger } from '../js/utils';
const { log } = logger('data');

import * as gauth from '../api/google-auth';
import * as gsheet from '../api/google-sheet';
import { indexToLetter } from '../js/utils';

export const getHeaders = async (scoreType) => {
  log('getHeaders >', scoreType);

  if (!(await gauth.isLoggedIn())) return {};

  const { rows = [], columns: dates = [] } = await gsheet.getSheetHeaders(
    scoreType,
    1,
    3
  );
  const names = rows.map(([id, name, section]) => ({
    id,
    name,
    section,
  }));
  log('getHeaders <', scoreType, { names, dates });
  return { names, dates };
};

export const saveData = async ({ scoreType, values }) => {
  if (!scoreType) return;
  if (!(await gauth.isLoggedIn())) return;

  const rangesAndValues =
    (values &&
      values.map(({ ri, ci, value }) => {
        const col = indexToLetter(ci);
        const row = ri + 2;
        const range = `${scoreType}!${col}${row}`;
        return [range, value];
      })) ||
    [];
  log('saveData', { rangesAndValues });
  return gsheet.saveSheetData(rangesAndValues);
};

export const getData = async ({ scoreType, indices }) => {
  log('getData', { scoreType, indices });
  if (!(await gauth.isLoggedIn())) return [];

  const ranges = indices.map(([ri, ci]) => {
    const col = indexToLetter(ci);
    return `${scoreType}!${col}${2 + ri}`;
  });

  log('getData', { ranges });

  const colData = await gsheet.getSheetData(ranges);
  log('getData', { colData, indices });

  const data = indices.map(([ri], i) => ({
    index: ri,
    value: colData && colData[i] && colData[i][0][0],
  }));
  log('getData', { data });
  return data;
};
