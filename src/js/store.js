import { f7 } from 'framework7-react';
import { createStore } from 'framework7/lite';
import * as google from '../api/google';
import { logger } from '../js/utils';
const { log } = logger('store');

const store = createStore({
  state: {
    loading: 0,
    user: null,
    error: null,
    userVersion: 0,
  },
  actions: {
    async updateUser({ state }) {
      f7.preloader.show();
      const user = await google.getUserProfile();
      log('store updateUser', user);
      state.user = user;
      state.userVersion += 1;
      f7.preloader.hide();
    },
    setError({ state }, error) {
      state.error = error;
    },
    startLoading({ state }) {
      state.loading++;
      f7.preloader.show();
    },
    endLoading({ state }) {
      if (--state.loading <= 0) f7.preloader.hide();
    },
  },
  getters: {
    loading({ state }) {
      return state.loading;
    },
    user({ state }) {
      return state.user;
    },
    userVersion({ state }) {
      return state.userVersion;
    },
    error({ state }) {
      return state.error;
    },
  },
});

export default store;
