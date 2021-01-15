import React from 'react';

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
} from 'framework7-react';

export default ({ name, signIn, signOut, signedIn, show, setShow }) => {
  return (
    <LoginScreen opened={show} className="the-login-screen">
      <View>
        <Page noToolbar loginScreen noNavbar>
          <LoginScreenTitle>{name}</LoginScreenTitle>
          <List>
            <ListButton fill large raised onClick={() => signIn()}>
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
              <ListButton onClick={() => setShow(false)}>Cancel</ListButton>
            </List>
          ) : null}
        </Page>
      </View>
    </LoginScreen>
  );
};
