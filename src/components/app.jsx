import React, { useEffect, useState } from 'react';
import 'framework7-icons';

import routes from '../js/routes';
import store from '../js/store';

import MainPage from '../pages/main';
import TeachersCheckin from '../pages/teachers';
import MyLoginScreen from '../pages/login';
import ErrorPage from '../pages/error';

import { SignInProfile } from '../components/profile';

import * as google from '../api/google';

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
    name: 'Register' + (google.isProd ? '' : ' *'), // App name
    routes,
    store,
  };

  const [loaded, setLoaded] = useState(false);
  const [f7loaded, setF7Loaded] = useState(false);
  useEffect(() => {
    const loadSignIn = () =>
      setTimeout(() => {
        google
          .onGapiAvailable()
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

  return (
    loaded && (
      <App {...f7params}>
        <Panel left cover>
          <Navbar title={f7params.name} subtitle={f7params.version} />
          <List>
            <SignInProfile />
            <ListItem link="/students/" title="Students" panelClose />
            <ListItem link="/teachers/" title="Teacher's Checkin" panelClose />
          </List>
        </Panel>

        <View main url="/teachers/" />
        <MyLoginScreen />
        <ErrorPage />
      </App>
    )
  );
};
