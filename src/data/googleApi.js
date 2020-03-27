import { SPREADSHEET_ID } from "../config/vars.json";

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

export default sheetName =>
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
