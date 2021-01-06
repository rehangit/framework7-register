import env from '../config/env.json';

const toJson = (table) => {
  if (table.length < 1) return {};

  const header = table[0];
  return table.slice(1).reduce((acc, row, r) => {
    const rowData = header.reduce((rec, key, c) => {
      rec[key] = row[c];
      return rec;
    }, {});
    if (rowData[header[0]]) acc.push(rowData);
    return acc;
  }, []);
};

const isProd = window.location.origin.includes(env.ORIGIN);
const SPREADSHEET_ID = isProd
  ? env.SPREADSHEET_ID_PROD
  : env.SPREADSHEET_ID_DEV;
console.log({ isProd, SPREADSHEET_ID });

const setMultiple = (rangesAndValues) => {
  const data = rangesAndValues.map(([range, value]) => ({
    range,
    values: [[value]],
    majorDimension: 'ROWS',
  }));
  const batchParams = {
    spreadsheetId: SPREADSHEET_ID,
    resource: { data, valueInputOption: 'USER_ENTERED' },
  };
  console.log('setMultiple', { data });
  console.log('setMultiple params', batchParams);
  return gapi.client.sheets.spreadsheets.values
    .batchUpdate(batchParams)
    .then((response) => {
      var result = response.result;
      console.log(
        `setMultiple batchUpdate ${result.totalUpdatedCells} cells updated.`,
        result
      );
    });
};

const getMultipleRanges = async (ranges) => {
  console.log('>getMultipleRanges', ranges);
  const batchParams = {
    spreadsheetId: SPREADSHEET_ID,
    ranges,
    valueRenderOption: 'UNFORMATTED_VALUE',
  };
  console.log('getMultipleRanges batchParams', batchParams);
  return gapi.client.sheets.spreadsheets.values
    .batchGet(batchParams)
    .then((response) => {
      var result = response.result;
      console.log(
        `getMultipleRanges batchGet ${result.valueRanges.length} ranges retrieved: `,
        {
          ranges,
          result,
        }
      );
      const values = result.valueRanges.map(({ values }) => values);
      console.log('getMultipleRanges return values', { values });
      return values;
    })
    .catch(() => []);
};

export { getMultipleRanges, setMultiple };
