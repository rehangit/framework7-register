import React, { useEffect, useState } from 'react';
import 'framework7-icons';

import routes from '../js/routes';
import store from '../js/store';

import MyLoginScreen from '../pages/login';
import ErrorPage from '../pages/error';
import Menu from '../components/menu';

import { isProd } from '../api/google-sheet';
import { onGapiAvailable } from '../api/google-auth';

import '../css/app.css';

import { logger } from '../js/utils';
const { log } = logger('app');

import { App, View, f7ready, Fab } from 'framework7-react';

const app = () => {
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

  const [showA2HS, setShowA2HS] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  addEventListener('beforeinstallprompt', (e) => {
    console.log('RECEIVED beforeinstallprompt.');
    e.preventDefault();
    setDeferredPrompt(e);
    setShowA2HS(true);
  });

  const onA2HS = (e) => {
    if (!deferredPrompt) {
      console.error(
        'Error onA2HS called without deferredPrompt',
        deferredPrompt
      );
      return;
    }
    // hide our user interface that shows our A2HS button
    setShowA2HS(false);
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  // addEventListener('load', (e) => {

  useEffect(() => f7ready(() => setF7Loaded(true)), []);
  log('rendering app', { loaded, f7params });
  return (
    loaded && (
      <App {...f7params}>
        <Menu />
        <View main url="/teachers/" />
        <MyLoginScreen />
        <ErrorPage />
        {showA2HS ? (
          <Fab
            position="center-bottom"
            slot="fixed"
            text="Add To Home Screen"
            color="blue"
            className="add-button"
            onClick={onA2HS}
          />
        ) : null}
      </App>
    )
  );
};

export default app;
