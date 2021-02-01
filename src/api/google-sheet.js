/* global gapi */
import env from '../config/env.json';
import { logger } from '../js/utils';
const { log } = logger('google');

const { ORIGIN, SPREADSHEET_ID_PROD, SPREADSHEET_ID_DEV } = env;

export const isProd = window.location.origin.includes(ORIGIN);
const SPREADSHEET_ID = isProd ? SPREADSHEET_ID_PROD : SPREADSHEET_ID_DEV;
log({ isProd, SPREADSHEET_ID });

export const saveSheetData = (rangesAndValues) => {
  const data = rangesAndValues.map(([range, value]) => ({
    range,
    values: [[value]],
    majorDimension: 'ROWS',
  }));
  const batchParams = {
    spreadsheetId: SPREADSHEET_ID,
    resource: { data, valueInputOption: 'USER_ENTERED' },
  };
  log('saveSheetData', { data });
  log('saveSheetData params', batchParams);
  return gapi.client.sheets.spreadsheets.values
    .batchUpdate(batchParams)
    .then((response) => {
      const result = response.result;
      log(
        `saveSheetData batchUpdate ${result.totalUpdatedCells} cells updated.`,
        result
      );
    });
};

export const getSheetData = async (ranges) => {
  log('>getSheetData', ranges);
  const batchParams = {
    spreadsheetId: SPREADSHEET_ID,
    ranges,
    valueRenderOption: 'UNFORMATTED_VALUE',
  };
  log('getSheetData batchParams', batchParams);

  return gapi.client.sheets.spreadsheets.values
    .batchGet(batchParams)
    .then((response) => {
      var result = response.result;
      log('getSheetData batchGet ranges retrieved: ', {
        ranges,
        result,
      });
      const values = result.valueRanges.map(({ values }) => values).flat(1);
      log('getSheetData return values', { values });
      return values;
    })
    .catch(() => []);
};

export const getSheetHeaders = async (sheet, r = 1, c = 3) => {
  const colLetter = String.fromCharCode('A'.charCodeAt(0) + c - 1);
  const result = await getSheetData([
    `${sheet}!A${r + 1}:${colLetter}`,
    `${sheet}!1:${r}`,
  ]);
  if (!result || !result.length) return [];
  const [rows, [columns]] = result;
  return { columns, rows };
};

export const appendSheetData = async (range, values) => {
  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range,
    resource: { values: [values] },
  };
  log('appendSheetData params', params);
  return gapi.client.sheets.spreadsheets.values
    .append(params)
    .then((response) => {
      log(
        `appendSheetData append updated:${response.result.totalUpdatedCells} cells.`,
        response.result
      );
    });
};
