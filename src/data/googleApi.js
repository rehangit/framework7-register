import env from "../config/env.json";

const toJson = table => {
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
const SPREADSHEET_ID = isProd ? env.SPREADSHEET_ID_PROD : env.SPREADSHEET_ID_DEV;
console.log({ isProd, SPREADSHEET_ID });

const setMultiple = rangesAndValues => {
  const data = rangesAndValues.map(([range, value]) => ({
    range,
    values: [[value]],
    majorDimension: "ROWS",
  }));
  console.log("setMultiple", { data });
  console.log("setMultiple params", {
    spreadsheetId: SPREADSHEET_ID,
    resource: { data, valueInputOption: "USER_ENTERED" },
  });
  return gapi.client.sheets.spreadsheets.values
    .batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { data, valueInputOption: "USER_ENTERED" },
    })
    .then(response => {
      var result = response.result;
      console.log(`${result.totalUpdatedCells} cells updated.`, result);
    });
};

const getMultipleRanges = async ranges => {
  console.log(">getMultipleRanges", ranges);
  try {
    return gapi.client.sheets.spreadsheets.values
      .batchGet({ spreadsheetId: SPREADSHEET_ID, ranges, valueRenderOption: "UNFORMATTED_VALUE" })
      .then(response => {
        var result = response.result;
        console.log(`${result.valueRanges.length} ranges retrieved: `, { ranges, result });
        const values = result.valueRanges.map(({ values }) => values);
        console.log({ values });
        return values;
      });
  } catch (err) {
    console.log({ err });
    return [];
  }
};

const getSheet = sheetName =>
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
      valueRenderOption: "UNFORMATTED_VALUE",
    })
    .then(response => {
      var range = response.result;
      if (range.values.length > 0) {
        const values = toJson(range.values);
        return values;
      }
      return [];
    });

export { getSheet, getMultipleRanges, setMultiple };
