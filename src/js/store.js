import { createStore } from 'framework7/lite';
import { getUserProfile, getUsersProfiles } from '../api/google-auth';
import { getSheetData } from '../api/google-sheet';
import { getCached, logger, toCamelCase, toIndexed, toJson } from '../js/utils';
import { startLoading, endLoading } from '../js/loader';

const { log } = logger('store');

const getProfiles = async () => getCached('user_profiles', 24 * 3600 * 1000, getUsersProfiles);

const getStudentsInfo = async () =>
  getCached('students_info', 24 * 3600 * 1000, async () => {
    const data = await getSheetData('source!A:Z');
    if (!data || data.length < 2) return {};
    return toIndexed(toJson([data[0].map(toCamelCase), ...data.slice(1)]));
  });

const store = createStore({
  state: {
    user: null,
    studentInfo: null,
    error: null,
    userVersion: 0,
    studentInfoVersion: 0,
  },
  actions: {
    async updateUser({ state }) {
      startLoading();
      const user = await getUserProfile();
      log('store updateUser', user);
      state.user = user;
      state.userVersion += 1;
      endLoading();
      if (user) {
        const info = await getStudentsInfo();
        if (!info) return;
        state.studentInfoVersion = +1;
        state.studentInfo = info;

        const profiles = (await getProfiles()) || {};
        profiles.forEach(({ email, image }) => {
          const userId = email.split('@')[0];
          const id = userId.match(/student(\d+)/)?.[1];
          if (id && info[id]) info[id].image = image;
        });
        state.studentInfo = info;
        state.studentInfoVersion = state.studentInfoVersion + 1;
      }
    },
    setError({ state }, error) {
      state.error = error;
    },
  },
  getters: {
    user({ state }) {
      return state.user;
    },
    studentInfo({ state }) {
      return state.studentInfo;
    },
    userVersion({ state }) {
      return state.userVersion;
    },
    studentInfoVersion({ state }) {
      return state.studentInfoVersion;
    },
    error({ state }) {
      return state.error;
    },
  },
});

export default store;
