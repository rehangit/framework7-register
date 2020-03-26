import React from "react";
import "framework7-icons";

import { API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES } from "../config/vars.json";

import MainPage from "../pages/main";
import LoginScreen from "../pages/login";
import getSheetData from "../data/googleApi";

import {
  App,
  View,
  Page,
  Navbar,
  Block,
  BlockTitle,
  ListItem,
  List,
  ListView,
  ListInput,
  Icon,
  Button,
  Input,
  Row,
  Col,
  Toolbar,
  Link,
} from "framework7-react";

import { SignInProfile } from "./profile";

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: "Register", // App name
        theme: "auto", // Automatic theme detection
      },

      attendance: [],
      user: {},
      signedIn: false,
    };
  }

  async fetchData() {
    const data = await getSheetData("Attendance");
    const attendance = data.map(({ name, section, ...dateRecs }) => ({
      name,
      section,
      ...dateRecs,
    }));
    console.log({ attendance });
    this.setState({ attendance });
  }

  async updateUser() {
    try {
      const signedIn = await gapi.auth2.getAuthInstance().isSignedIn.get();
      this.setState({ signedIn });
      console.log({ signedIn });
      if (signedIn) {
        const current = await gapi.auth2.getAuthInstance().currentUser.get();
        const profile = await current.getBasicProfile();
        const [name, email, image] = [profile.getName(), profile.getEmail(), profile.getImageUrl()];
        const user = { name, email, image };
        this.setState({ user });
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
          Promise.all([this.updateUser(), this.fetchData()]);
        })
        .catch(console.log);
  }

  async signOut() {
    await gapi.auth2.getAuthInstance().signOut();
    this.setState({ signedIn: await gapi.auth2.getAuthInstance().isSignedIn.get() });
  }

  async onSignIn() {
    await gapi.auth2.getAuthInstance().signIn({ prompt: "select_account" });
    return this.updateUser();
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
      <App>
        {this.state.signedIn ? (
          <View main>
            <Navbar title={this.state.f7params.name} sliding innerClass="navbar-inner-spacing">
              <SignInProfile
                signedIn={this.state.signedIn}
                user={this.state.user}
                onClick={() => this.signOut()}
              />
            </Navbar>
            <MainPage data={this.state.attendance} />
          </View>
        ) : (
          <LoginScreen name={this.state.f7params.name} onSignIn={() => this.onSignIn()} />
        )}
      </App>
    );
  }
}
