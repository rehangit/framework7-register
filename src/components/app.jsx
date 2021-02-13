import React, { useEffect, useState } from 'react';
import 'framework7-icons';
import { App, View, f7ready } from 'framework7-react';

import { logger } from '../js/utils';
const { log } = logger('app');

import routes from '../js/routes';
import store from '../js/store';

import MyLoginScreen from '../pages/login';
import ErrorPage from '../pages/error';
import Menu from '../components/menu';

import { isProd } from '../api/google-sheet';
import { onGapiAvailable } from '../api/google-auth';

import A2HS from './a2hs';

import '../css/app.css';

const VERSION = '1.0.4';

const app = () => {
  const f7params = {
    name: 'Register' + (isProd ? '' : ' *'), // App name
    version: VERSION,
    routes,
    store,
    serviceWorker: { path: '../sw.js', scope: '/' },
  };

  const [loaded, setLoaded] = useState(false);
  const [f7loaded, setF7Loaded] = useState(false);
  useEffect(() => {
    const loadSignIn = () =>
      setTimeout(() => {
        onGapiAvailable()
          .then((response) => {
            log('gapi init response', response);
            store.dispatch('updateUser');
            setLoaded(true);
          })
          .catch((err) => store.dispatch('setError', err));
      }, 1000);

    loadSignIn();
    addEventListener('gapi_available', loadSignIn);
  }, [f7loaded]);

  useEffect(() => f7ready(() => setF7Loaded(true)), []);

  log('rendering app', { loaded, f7params, path: window.location.pathname });

  return (
    loaded && (
      <App {...f7params}>
        <Menu />
        <View main url={'/'} />
        <MyLoginScreen />
        <ErrorPage />
        <A2HS />
      </App>
    )
  );
};

export default app;
