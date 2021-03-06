import { f7 } from 'framework7-react';

let loading = 0;
const showLoader = (show) => {
  if (!!f7 && f7.preloader) {
    if (show) f7.preloader.show();
    else f7.preloader.hide();
  }
};

export const startLoading = (comments) => {
  loading++;
  console.log('[loader++]', comments, loading);
  if (loading > 0) {
    showLoader(true);
  }
};
export const endLoading = (comments) => {
  loading--;
  console.log('[loader--]', comments, loading);
  if (loading <= 0) {
    showLoader(false);
  }
};
