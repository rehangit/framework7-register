import env from '../config/env.json';
import { logger } from '../js/utils';
const { log } = logger('google');

const {
  API_KEY,
  CLIENT_ID,
  DISCOVERY_DOCS,
  SCOPES,
  ORIGIN,
  SPREADSHEET_ID_PROD,
  SPREADSHEET_ID_DEV,
} = env;

export const isProd = window.location.origin.includes(ORIGIN);
const SPREADSHEET_ID = isProd ? SPREADSHEET_ID_PROD : SPREADSHEET_ID_DEV;
log({ isProd, SPREADSHEET_ID });

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
  log('setMultiple', { data });
  log('setMultiple params', batchParams);
  return gapi.client.sheets.spreadsheets.values
    .batchUpdate(batchParams)
    .then((response) => {
      var result = response.result;
      log(
        `setMultiple batchUpdate ${result.totalUpdatedCells} cells updated.`,
        result
      );
    });
};

const getMultipleRanges = async (ranges) => {
  log('>getMultipleRanges', ranges);
  const batchParams = {
    spreadsheetId: SPREADSHEET_ID,
    ranges,
    valueRenderOption: 'UNFORMATTED_VALUE',
  };
  log('getMultipleRanges batchParams', batchParams);

  return gapi.client.sheets.spreadsheets.values
    .batchGet(batchParams)
    .then((response) => {
      var result = response.result;
      log(
        `getMultipleRanges batchGet ${result.valueRanges.length} ranges retrieved: `,
        {
          ranges,
          result,
        }
      );
      const values = result.valueRanges.map(({ values }) => values);
      log('getMultipleRanges return values', { values });
      return values;
    })
    .catch(() => []);
};

export const getSheetHeaders = async (sheet, r = 1, c = 3) => {
  const colLetter = String.fromCharCode('A'.charCodeAt(0) + c - 1);
  const result = await getMultipleRanges([
    `${sheet}!A${r + 1}:${colLetter}`,
    `${sheet}!1:${r}`,
  ]);
  if (!result || !result.length) return [];
  const [rows, [columns]] = result;
  return { columns, rows };
};

export const getSheetData = async (ranges) => getMultipleRanges(ranges);

export const saveData = async (rangesAndValues) => setMultiple(rangesAndValues);

export const getUserProfile = async () => {
  try {
    const signedIn = await gapi.auth2.getAuthInstance().isSignedIn.get();
    if (signedIn) {
      const current = await gapi.auth2.getAuthInstance().currentUser.get();
      const profile = await current.getBasicProfile();
      const name = profile.getName();
      const email = profile.getEmail();
      const image = profile.getImageUrl();
      return { name, email, image };
    }
    log('not signedIn yet or the status unknown', gapi);
  } catch (err) {
    log('Update User error:', { err });
  }
};

export const onGapiAvailable = async () => {
  const g = gapi || window.gapi;
  log('ONGAPIAVALABLE', g, g && g.client);
  if (g && g.client && g.client.init)
    return g.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
};

export const signOut = async (attempt = 0) => {
  log('>signOut', attempt);
  const g = gapi || window.gapi;
  const params = await g.auth2.getAuthInstance().signOut();
  const signedIn = await g.auth2.getAuthInstance().isSignedIn.get();
  log('>signOut', { signedIn, params });
  if (signedIn && attempt < 3) {
    setTimeout(() => signOut(++attempt), 1000);
    return;
  }
  // g.auth2.getAuthInstance().disconnect();
  const current = g.auth2.getAuthInstance().currentUser.get();
  current.reloadAuthResponse();
};

export const signInWithPrompt = async () =>
  gapi.auth2.getAuthInstance() &&
  gapi.auth2.getAuthInstance().signIn({ prompt: 'consent' });

export const isLoggedIn = async () =>
  !!gapi &&
  !!gapi.auth2 &&
  gapi.auth2.getAuthInstance() &&
  gapi.auth2.getAuthInstance().isSignedIn.get();
