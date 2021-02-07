import React from 'react';
import 'framework7-icons';

import '../css/main.css';

import { BlockHeader, BlockTitle, Page } from 'framework7-react';
import Nav from '../components/navbar';
import ClassNumbersChartJs from '../components/class-numbers-chartjs';
export default function MainPage() {
  return (
    <Page name="home" className="home">
      <Nav />
      <BlockTitle>Dashboard</BlockTitle>
      <ClassNumbersChartJs />
    </Page>
  );
}
