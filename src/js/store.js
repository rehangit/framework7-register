import { f7 } from 'framework7-react';
import { createStore } from 'framework7/lite';
import { getUserProfile } from '../api/google-auth';
import { logger } from '../js/utils';
const { log } = logger('store');

const showLoader = (show) =>
  f7 && f7.preloader
    ? show
      ? f7.preloader.show()
      : f7.preloader.hide()
    : null;

const store = createStore({
  state: {
    loading: 0,
    user: null,
    error: null,
    userVersion: 0,
  },
  actions: {
    async updateUser({ state }) {
      showLoader(true);
      const user = await getUserProfile();
      log('store updateUser', user);
      state.user = user;
      state.userVersion += 1;
      showLoader(false);
    },
    setError({ state }, error) {
      state.error = error;
    },
    startLoading({ state }) {
      state.loading++;
      showLoader(true);
    },
    endLoading({ state }) {
      if (--state.loading <= 0) showLoader(false);
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
