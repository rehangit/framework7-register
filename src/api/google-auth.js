/* global gapi */
import env from '../config/env.json';
import { logger } from '../js/utils';
const { log } = logger('google');

const { API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES } = env;

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
export const getUsersProfiles = async () => {
  try {
    const signedIn = await gapi.auth2.getAuthInstance().isSignedIn.get();
    log('Calling People API getUsersProfiles', { signedIn });
    if (signedIn) {
      const response = await gapi.client.people.people.listDirectoryPeople({
        pageSize: 200,
        readMask: 'names,emailAddresses,photos',
        sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
      });
      log('People API Response', response);

      const profiles = response.result.people.map(
        ({ names, emailAddresses, photos }) => ({
          name: names[0].displayName,
          email: emailAddresses[0].value,
          image: (photos && photos[0].url) || '',
        })
      );
      log('getUserProfiles returning profiles', profiles);
      return profiles;
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
