import React from 'react';
import 'framework7-icons';

import MainPage from '../pages/main';
import MyLoginScreen from '../pages/login';
import * as google from '../data/googleApi';

import '../css/app.css';

import { App, View, Panel, Navbar, Block } from 'framework7-react';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: 'Register' + (google.isProd ? '' : ' *'), // App name
        id: 'com.bilalmasjid.registerapp',
      },

      user: {},
      signedIn: false,
      showLogin: true,
    };
  }

  async updateUser() {
    try {
      console.log('updateUser - retrieving user profile');
      const user = await google.getUserProfile();
      console.log('updateuser - user profile retrieved', user);
      this.setState({ user: { ...user } });
      if (user && user.email) {
        this.setState({ signedIn: true });
        this.setState({ showLogin: false });
        console.log('updateUser - signed in');
      }
    } catch (err) {
      console.log('Update User error:', { err });
    }
  }

  signOut(attempt = 0) {
    console.log('>signOut', attempt);
    google.signOut().then(() => {
      this.setState({ signedIn: false });
      setTimeout(() => window.location.reload(), 100);
    });
  }

  showLogin(show) {
    this.setState({ showLogin: show });
  }

  signIn() {
    google
      .signIn()
      .then(() => {
        this.updateUser();
        this.setState({ signedIn: true });
      })
      .catch((err) => {
        console.log('>signIn', { err });
        window.location.reload();
      });
  }

  componentDidMount() {
    console.log('COMPONENTDIDMOUNT');
    if (window.gapi && window.gapi.auth2) {
      console.log('GAPI - already available');
      google.onGapiAvailable();
    } else {
      console.log("listening for 'gapi_available'");
      addEventListener('gapi_available', () => google.onGapiAvailable());
    }
  }

  render() {
    return (
      <App params={this.state.f7params}>
        <MainPage
          user={this.state.user}
          onProfile={() => this.showLogin(true)}
        />
        <MyLoginScreen
          show={this.state.showLogin}
          signIn={() => this.signIn()}
          signOut={() => this.signOut()}
          signedIn={this.state.signedIn}
          name={this.state.name}
        />
      </App>
    );
  }
}
