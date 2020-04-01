import React from "react";
import "framework7-icons";

import { API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES } from "../config/vars.json";

import MainPage from "../pages/main";
import MyLoginScreen from "../pages/login";
import { getSheet, getMultipleRanges, setMultiple } from "../data/googleApi";

import { App, View } from "framework7-react";

import { SignInProfile } from "./profile";

const indexToLetter = n => {
  const a = Math.floor(n / 26);
  if (a >= 0) return indexToLetter(a - 1) + String.fromCharCode(65 + (n % 26));
  else return "";
};

const serialToDate = serial => new Date(Math.floor(serial - 25569) * 86400 * 1000);
const dateToSerial = date => Math.floor((date - new Date("1900-01-01")) / (1000 * 3600 * 24));

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: "Register", // App name
        id: "com.rehan.register",
      },

      data: [],
      user: {},
      signedIn: false,
      showLogin: true,
    };
  }

  async fetchData() {
    console.log(">fetchData");
    try {
      const data = await getSheet("Attendance");
      this.setState({ data });
    } catch (err) {
      console.log([err]);
      this.setState({ data: [], signedIn: false, showLogin: true });
    }
  }

  async getData({ scoreType, date }) {
    if (!this.state.signedIn) return [];
    const serial = dateToSerial(date);
    const result = await getMultipleRanges([`${scoreType}!A2:C`, `${scoreType}!1:1`]);
    if (!result || !result.length) return [];
    const [studentInfo, [dates]] = result;
    const dateIndex = 3 + dates.findIndex(d => d === serial);
    console.log("getData", { dates, serial, dateIndex });
    const col = indexToLetter(dateIndex);
    console.log("getData", { col });
    const [colData] = await getMultipleRanges([`${scoreType}!${col}2:${col}`]);
    console.log("getData", { colData });
    console.log("getData", { studentInfo });
    const data = studentInfo.map(([id, name, section], i) => ({
      id,
      name,
      section,
      value: colData && colData[i] && colData[i][0],
    }));
    console.log("getData", { data });
    return data;
  }

  async saveData({ scoreType, date, values }) {
    if (!date || !scoreType) return;
    const serial = dateToSerial(date);
    const result = await getMultipleRanges([`${scoreType}!A:A`, `${scoreType}!1:1`]);
    if (!result || !result.length) return [];
    const [ids, [dates]] = result;
    const dateIndex = 3 + dates.findIndex(d => d === serial);
    console.log("saveData", { ids, dates, serial, dateIndex });
    const col = indexToLetter(dateIndex);
    console.log("saveData", { col });

    const rangesAndValues =
      (values &&
        values.map(({ id, value }) => {
          const row = 1 + ids.findIndex(([i]) => i === id);
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
        const [name, email, image] = [profile.getName(), profile.getEmail(), profile.getImageUrl()];
        const user = { name, email, image };
        this.setState({ user });
        this.setState({ showLogin: false });
        // this.fetchData();
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
            getData={(...args) => this.getData(...args)}
            user={this.state.user}
            onProfile={() => this.showLogin(true)}
            saveData={(...args) => this.saveData(...args)}
          />
        </View>
        <MyLoginScreen parent={this} show={this.state.showLogin} />
      </App>
    );
  }
}
