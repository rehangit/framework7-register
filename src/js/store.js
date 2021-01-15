import { f7 } from 'framework7-react';
import { createStore } from 'framework7/lite';
import * as google from '../api/google';

const store = createStore({
  state: {
    loading: false,
    user: {},
    error: null,
  },
  actions: {
    updateUser({ state }) {
      state.loading = true;
      google.getUserProfile().then((user) => {
        console.log('store updateUser', user);
        state.user = user;
        state.loading = false;
      });
    },
    setError({ state }, error) {
      state.error = error;
    },
    startLoading({ state }) {
      state.loading = true;
      f7.preloader.show();
    },
    endLoading({ state }) {
      state.loading = false;
      f7.preloader.hide();
    },
  },
  getters: {
    loading({ state }) {
      return state.loading;
    },
    user({ state }) {
      return state.user;
    },
    error({ state }) {
      return state.error;
    },
  },
});

export default store;
