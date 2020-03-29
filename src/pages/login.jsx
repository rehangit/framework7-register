import React from "react";

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
} from "framework7-react";
import { SignInProfile } from "../components/profile";

export default ({ parent, show }) => {
  const { f7params, signedIn, user } = parent.state;
  return (
    <LoginScreen opened={show} className="the-login-screen">
      <View>
        <Page noToolbar loginScreen noNavbar>
          <LoginScreenTitle>{f7params.name}</LoginScreenTitle>
          <List>
            <ListButton fill large raised onClick={() => parent.onSignIn()}>
              {signedIn ? "Switch Account" : "Sign In"}
            </ListButton>
            {signedIn ? (
              <ListButton raised onClick={() => parent.signOut()}>
                Sign Out
              </ListButton>
            ) : null}
          </List>
          <BlockFooter>Please sign in using your organisation G Suite account</BlockFooter>
          {signedIn ? (
            <List>
              <ListButton onClick={() => parent.showLogin(false)}>Cancel</ListButton>
            </List>
          ) : null}
        </Page>
      </View>
    </LoginScreen>
  );
};
