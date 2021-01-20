import React, { useEffect, useState } from 'react';
import 'framework7-icons';

import routes from '../js/routes';
import store from '../js/store';

import MainPage from '../pages/main';
import TeachersCheckin from '../pages/teachers';
import MyLoginScreen from '../pages/login';
import ErrorPage from '../pages/error';
import Menu from '../components/menu';

import { isProd } from '../api/google-sheet';
import { onGapiAvailable } from '../api/google-auth';

import { version } from '../../package.json';

import '../css/app.css';

import { logger } from '../js/utils';
const { log } = logger('app');

import {
  App,
  View,
  Panel,
  Navbar,
  Block,
  Page,
  List,
  ListItem,
  useStore,
  f7ready,
} from 'framework7-react';

export default ({}) => {
  const f7params = {
    name: 'Register' + (isProd ? '' : ' *'), // App name
    routes,
    store,
  };

  const [loaded, setLoaded] = useState(false);
  const [f7loaded, setF7Loaded] = useState(false);
  useEffect(() => {
    const loadSignIn = () =>
      setTimeout(() => {
        onGapiAvailable()
          .then(() => {
            store.dispatch('updateUser');
            setLoaded(true);
          })
          .catch((err) => store.dispatch('setError', err));
      }, 1000);

    loadSignIn();
    addEventListener('gapi_available', loadSignIn);
  }, [f7loaded]);

  useEffect(() => f7ready(() => setF7Loaded(true)), []);
  log('rendering app', { loaded, f7params });
  return (
    loaded && (
      <App {...f7params}>
        <Menu />
        <View main url="/students/" />
        <MyLoginScreen />
        <ErrorPage />
      </App>
    )
  );
};
