import React from "react";
import "framework7-icons";

import {
  API_KEY,
  CLIENT_ID,
  DISCOVERY_DOCS,
  SCOPES,
  ORIGIN,
} from "../config/env.json";

import MainPage from "../pages/main";
import MyLoginScreen from "../pages/login";
import { getMultipleRanges, setMultiple } from "../data/googleApi";

import { App, View, Panel, Navbar, Block } from "framework7-react";

const indexToLetter = n => {
  const a = Math.floor(n / 26);
  if (a >= 0) return indexToLetter(a - 1) + String.fromCharCode(65 + (n % 26));
  else return "";
};

const serialToDate = serial =>
  new Date(Math.floor(serial - 25569) * 86400 * 1000);
const dateToSerial = date =>
  Math.floor((date - new Date("1900-01-01")) / (1000 * 3600 * 24));

const isProd = window.location.origin.includes(ORIGIN);
export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: "Register" + (isProd ? "" : " *"), // App name
        id: "com.bilalmasjid.registerapp",
      },

      user: {},
      signedIn: false,
      showLogin: true,
    };
  }

  async getHeaders(scoreType) {
    if (!this.state.signedIn) return [];
    const result = await getMultipleRanges([
      `${scoreType}!A2:C`,
      `${scoreType}!1:1`,
    ]);
    if (!result || !result.length) return [];
    const [namesRows, [dates]] = result;
    const names = namesRows.map(([id, name, section]) => ({
      id,
      name,
      section,
    }));
    console.log("getHeaders", scoreType, { names, dates });

    return { names, dates };
  }

  async getData({ scoreType, indices }) {
    if (!this.state.signedIn) return [];

    const ranges = indices.map(([ri, ci]) => {
      const col = indexToLetter(ci);
      return `${scoreType}!${col}${2 + ri}`;
    });

    console.log("getData", { ranges });

    const colData = await getMultipleRanges(ranges);
    console.log("getData", { colData, indices });

    const data = indices.map(([ri], i) => ({
      index: ri,
      value: colData && colData[i] && colData[i][0][0],
    }));
    console.log("getData", { data });
    return data;
  }

  async saveData({ scoreType, values }) {
    if (!scoreType) return;

    const rangesAndValues =
      (values &&
        values.map(({ ri, ci, value }) => {
          const col = indexToLetter(ci);
          const row = ri + 2;
          const range = `${scoreType}!${col}${row}`;
          return [range, value];
        })) ||
      [];
    console.log("saveData", { rangesAndValues });
    await setMultiple(rangesAndValues);
  }

  async updateUser() {
    try {
      const signedIn = await gapi.auth2.getAuthInstance().isSignedIn.get();
      this.setState({ signedIn });
      if (signedIn) {
        const current = await gapi.auth2.getAuthInstance().currentUser.get();
        const profile = await current.getBasicProfile();
        const [name, email, image] = [
          profile.getName(),
          profile.getEmail(),
          profile.getImageUrl(),
        ];
        const user = { name, email, image };
        this.setState({ user });
        this.setState({ showLogin: false });
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

  signOut(attempt = 0) {
    console.log(">signOut", attempt);
    gapi.auth2
      .getAuthInstance()
      .signOut()
      .then(params => {
        const signedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        console.log(">signOut > then", { signedIn, params });
        if (signedIn && attempt < 3) {
          setTimeout(() => this.signOut(++attempt), 1000);
          return;
        }
        // gapi.auth2.getAuthInstance().disconnect();
        const current = gapi.auth2.getAuthInstance().currentUser.get();
        current.reloadAuthResponse();
        this.setState({ signedIn: false });
        setTimeout(() => window.location.reload(), 100);
      });
  }

  showLogin(show) {
    this.setState({ showLogin: show });
  }

  onSignIn() {
    try {
      gapi.auth2
        .getAuthInstance()
        .signIn({ prompt: "select_account" })
        .then(() => {
          this.updateUser();
        });
    } catch (err) {
      console.log(">signIn", { err });
      window.location.reload();
    }
  }

  componentDidMount() {
    console.log("COMPONENTDIDMOUNT");
    if (window.gapi && window.gapi.auth2) {
      console.log("GAPI - already available");
      this.onGapiAvailable();
    } else {
      console.log("listening for 'gapi_available'");
      addEventListener("gapi_available", () => this.onGapiAvailable());
    }
  }

  render() {
    return (
      <App params={this.state.f7params}>
        <View>
          <MainPage
            user={this.state.user}
            onProfile={() => this.showLogin(true)}
            getData={(...args) => this.getData(...args)}
            getHeaders={(...args) => this.getHeaders(...args)}
            saveData={(...args) => this.saveData(...args)}
          />
        </View>
        <MyLoginScreen parent={this} show={this.state.showLogin} />
      </App>
    );
  }
}
