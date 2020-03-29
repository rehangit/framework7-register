import React from "react";
import "framework7-icons";

import { API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES } from "../config/vars.json";

import MainPage from "../pages/main";
import MyLoginScreen from "../pages/login";
import getSheetData from "../data/googleApi";

import { App, View } from "framework7-react";

import { SignInProfile } from "./profile";

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: "Register", // App name
        id: "com.rehan.register",
      },

      attendance: [],
      user: {},
      signedIn: false,
      showLogin: true,
    };
  }

  async fetchData() {
    try {
      const data = await getSheetData("Attendance");
      const attendance = data.map(({ name, section, ...dateRecs }) => ({
        name,
        section,
        ...dateRecs,
      }));
      this.setState({ attendance });
    } catch (err) {
      console.log([err]);
      this.setState({ attendance: [], signedIn: false, showLogin: true });
    }
  }

  async updateUser() {
    try {
      const signedIn = await gapi.auth2.getAuthInstance().isSignedIn.get();
      this.setState({ signedIn });
      if (signedIn) {
        const current = await gapi.auth2.getAuthInstance().currentUser.get();
        const profile = await current.getBasicProfile();
        const [name, email, image] = [profile.getName(), profile.getEmail(), profile.getImageUrl()];
        const user = { name, email, image };
        this.setState({ user });
        this.setState({ showLogin: false });
        this.fetchData();
      } else {
        this.setState({ user: {} });
      }
    } catch (err) {
      console.log("Update User error:", { err });
    }
  }

  onGapiAvailable() {
    console.log("ONGAPIAVALABLE", gapi, gapi.client);
    if (gapi && gapi.client && gapi.client.init)
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          this.updateUser();
        })
        .catch(console.log);
  }

  async signOut() {
    await gapi.auth2.getAuthInstance().signOut();
    this.setState({ signedIn: await gapi.auth2.getAuthInstance().isSignedIn.get() });
  }

  showLogin(show) {
    this.setState({ showLogin: show });
  }

  async onSignIn() {
    await gapi.auth2.getAuthInstance().signIn({ prompt: "select_account" });
    this.updateUser();
  }

  componentDidMount() {
    console.log("COMPONENTDIDMOUNT");
    if (window.gapi) {
      console.log("GAPI - already available");
      this.onGapiAvailable();
    } else {
      addEventListener("gapi_available", () => this.onGapiAvailable());
    }
  }

  render() {
    return (
      <App params={this.state.f7params}>
        <View>
          <MainPage
            data={this.state.attendance}
            user={this.state.user}
            onProfile={() => this.showLogin(true)}
          />
        </View>
        <MyLoginScreen parent={this} show={this.state.showLogin} />
      </App>
    );
  }
}
