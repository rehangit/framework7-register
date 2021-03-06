import React from 'react';
import 'framework7-icons';

import '../css/main.css';

import { Navbar, Page } from 'framework7-react';
import ClassNumbersChartJs from '../components/class-numbers-chartjs';
import TeachersAttendanceChart from '../components/teachers-attendance-chartjs';
import { LeftNav } from '../components/main-nav';
export default function MainPage() {
  return (
    <Page name="home" className="home">
      <Navbar>
        <LeftNav title="Dashboard" />
      </Navbar>
      <ClassNumbersChartJs />
      <TeachersAttendanceChart />
    </Page>
  );
}
