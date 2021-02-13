import React from 'react';
import 'framework7-icons';

import '../css/main.css';

import { List, ListItem, Navbar, Page } from 'framework7-react';
import ClassNumbersChartJs from '../components/class-numbers-chartjs';
import TeachersAttendanceChart from '../components/teachers-attendance-chartjs';
import MainNav from '../components/main-nav';
export default function MainPage() {
  return (
    <Page name="home" className="home">
      <Navbar>
        <MainNav title="Dashboard" />
      </Navbar>
      <List>
        <ListItem>
          <ClassNumbersChartJs />
        </ListItem>
        <ListItem>
          <TeachersAttendanceChart />
        </ListItem>
      </List>
    </Page>
  );
}
