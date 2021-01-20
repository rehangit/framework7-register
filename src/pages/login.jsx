import React, { useState, useEffect, useMemo } from 'react';

import {
  f7,
  Page,
  LoginScreenTitle,
  Button,
  BlockFooter,
  Block,
  LoginScreen,
  View,
  ListButton,
  List,
  useStore,
} from 'framework7-react';

import * as google from '../api/google-auth';
import store from '../js/store';
import { logger } from '../js/utils';
const { log } = logger('login');

export default ({}) => {
  const version = useStore('userVersion');
  const [user, signedIn] = useMemo(() => {
    const u = store.getters.user.value;
    return [u, u && u.email && u.email.length > 1];
  }, [version]);

  log('LoginScreen initial state', { user, signedIn });
  const [opened, setOpened] = useState(!signedIn);

  useEffect(() => {
    const user = store.getters.user.value;
    log('Login screen useEffect [user]', { user });
    setOpened(!user || !user.email || !user.email.length);
  }, [user]);

  const signIn = () =>
    google
      .signInWithPrompt()
      .then(() => store.dispatch('updateUser'))
      .catch((err) => store.dispatch('setError', err));

  const signOut = () =>
    google
      .signOut()
      .then(() => store.dispatch('updateUser'))
      .catch((err) => store.dispatch('setError', err));

  return (
    <LoginScreen
      opened={opened}
      id="the-login-screen"
      onLoginScreenOpen={() => {
        log('in login screen on login screen open');
        setOpened(true);
      }}
    >
      <View>
        <Page noToolbar loginScreen noNavbar>
          <LoginScreenTitle>{f7.params.name}</LoginScreenTitle>
          <List>
            <ListButton fill large raised onClick={signIn}>
              {signedIn ? 'Switch Account' : 'Sign In'}
            </ListButton>
            {signedIn ? (
              <ListButton raised onClick={() => signOut()}>
                Sign Out
              </ListButton>
            ) : null}
          </List>
          <BlockFooter>
            Please sign in using your organisation G Suite account
          </BlockFooter>
          {signedIn ? (
            <List>
              <ListButton onClick={() => setOpened(false)}>Cancel</ListButton>
            </List>
          ) : null}
        </Page>
      </View>
    </LoginScreen>
  );
};
