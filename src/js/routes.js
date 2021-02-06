import MainPage from '../pages/main';
import StudentsPage from '../pages/students';
import TeachersPage from '../pages/teachers';

const routes = [
  { path: '/', component: MainPage },
  { path: '/students/', component: StudentsPage },
  { path: '/teachers/', component: TeachersPage },
];

export default routes;
