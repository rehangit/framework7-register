import { createStore } from 'framework7/lite';
import { getUserProfile, getUsersProfiles } from '../api/google-auth';
import { getSheetData } from '../api/google-sheet';
import { getCached, logger, toCamelCase, toIndexed, toJson } from '../js/utils';

const { log } = logger('store');

const getProfiles = async () => getCached('user_profiles', 24 * 3600 * 1000, getUsersProfiles);

const getStudentsInfo = async () =>
  getCached('students_info', 24 * 3600 * 1000, async () => {
    const data = await getSheetData('Source!A:Z');
    if (!data || data.length < 2) return {};
    return toJson([data[0].map(toCamelCase), ...data.slice(1)]);
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
      const user = await getUserProfile();
      log('store updateUser', user);
      state.user = user;
      state.userVersion += 1;
      if (user) {
        const info = await getStudentsInfo();
        if (!info) return;
        state.studentInfoVersion = +1;
        state.studentInfo = info
          .filter(({ active }) => active)
          .map(({ section: type, class: section, ...fields }) => ({ ...fields, section, type }));

        const profiles = (await getProfiles()) || [];
        profiles.forEach(({ email, image }) => {
          const userId = email.split('@')[0];
          const uid = userId.match(/student(\d+)/)?.[1];
          if (uid) {
            const si = state.studentInfo.find(({ id }) => id === uid);
            if (si) si.image = image;
          }
        });
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
