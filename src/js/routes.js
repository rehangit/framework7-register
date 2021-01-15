import MainPage from '../pages/main';
import TeachersPage from '../pages/teachers';

const routes = [
  {
    path: '/students/',
    component: MainPage,
  },
  {
    path: '/teachers/',
    component: TeachersPage,
  },
];

export default routes;
