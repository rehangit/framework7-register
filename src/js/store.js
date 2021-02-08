import { f7 } from 'framework7-react';
import { createStore } from 'framework7/lite';
import { getUserProfile, getUsersProfiles } from '../api/google-auth';
import { getSheetData } from '../api/google-sheet';
import { getCached, logger, toCamelCase, toIndexed, toJson } from '../js/utils';
const { log } = logger('store');

const showLoader = (show) =>
  f7 && f7.preloader ? (show ? f7.preloader.show() : f7.preloader.hide()) : null;

const getProfiles = async () => getCached('user_profiles', 24 * 3600 * 1000, getUsersProfiles);

const getStudentsInfo = async () =>
  getCached('students_info', 24 * 3600 * 1000, async () => {
    const data = await getSheetData('source!A:Z');
    if (!data || data.length < 2) return [];
    return toIndexed(toJson([data[0].map(toCamelCase), ...data.slice(1)]));
  });

const store = createStore({
  state: {
    loading: 0,
    user: null,
    users: null,
    studentInfo: null,
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
      getStudentsInfo().then((info) => {
        if (!info) return;
        getProfiles().then((users = []) => {
          const nonStudentUsers = users.reduce((acc, u) => {
            const userId = u.email.split('@')[0];
            const id = userId.match(/student(\d+)/)?.[1];
            if (id) {
              if (info[id]) info[id].image = u.image;
            } else acc[userId] = u;
            return acc;
          }, {});
          state.users = nonStudentUsers;
        });
        state.studentInfo = info;
      });
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
    studentInfo({ state }) {
      return state.studentInfo;
    },
    users({ state }) {
      return state.users;
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
