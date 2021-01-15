import React, { useEffect } from 'react';
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

import {
  App,
  View,
  Panel,
  Navbar,
  Block,
  Page,
  Preloader,
  List,
  ListItem,
  useStore,
} from 'framework7-react';

export default ({}) => {
  const [signedIn, setSignedIn] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(true);

  const f7params = {
    name: 'Register' + (google.isProd ? '' : ' *'), // App name
    routes,
    store,
  };

  //  const loading = store ? store.getters.loading.value : true;

  const updateUser = async () => {
    if (!google) return;
    try {
      console.log('updateUser - retrieving user profile');
      const profile = await google.getUserProfile();
      console.log('updateuser - user profile retrieved', profile);
      store.dispatch('updateUser');
      if (profile && profile.email) {
        setSignedIn(true);
        console.log('updateUser - signed in');
      }
    } catch (err) {
      console.log('Update User error:', { err });
      store.dispatch('setError', err);
    }
  };

  const signOut = async (attempt = 0) => {
    console.log('>signOut', attempt);
    return google.signOut().then(() => {
      setSignedIn(false);
      setShowLogin(true);
      setTimeout(() => window.location.reload(), 100);
    });
  };

  const signIn = async () => {
    console.log('signIn got called');
    return google
      .signIn()
      .then(() => {
        setSignedIn(true);
        setShowLogin(false);
        updateUser();
      })
      .catch((err) => {
        console.log('>signIn', { err });
        setError(err);
        // window.location.reload();
      });
  };

  useEffect(() => {
    const loadSignIn = () =>
      google &&
      google
        .onGapiAvailable()
        .then(() => google.isSignedIn())
        .then((signedInStatus) => {
          console.log('On load the signin status is', { signedInStatus });
          setSignedIn(signedInStatus);
          setShowLogin(!signedInStatus);
          if (signedInStatus) {
            updateUser();
          }
        });

    if (gapi || (window.gapi && window.gapi.auth2)) {
      console.log('GAPI - already available');
      loadSignIn();
    } else {
      console.log("listening for 'gapi_available'");
      addEventListener('gapi_available', loadSignIn);
    }
  }, []);

  return (
    <App {...f7params}>
      <Panel left cover>
        <Navbar title={f7params.name} subtitle={f7params.version} />
        {/* <SignInProfile
          user={user}
          onClick={() => {
            console.log('trying to open login screen');
            onProfile(true);
          }}
        /> */}
        <List>
          <ListItem link="/students/" title="Students" panelClose />
          <ListItem
            link="/teachers/"
            title="Teacher's Checkin"
            panelClose
          ></ListItem>
        </List>
      </Panel>

      <View main url="/students/" />
      <MyLoginScreen
        signIn={signIn}
        signOut={signOut}
        signedIn={signedIn}
        show={showLogin}
        setShow={setShowLogin}
        name={f7params.name}
      />
      <ErrorPage />
    </App>
  );
};
