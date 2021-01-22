import React from 'react';
import 'framework7-icons';

import '../css/main.css';

import { Block, BlockHeader, Page } from 'framework7-react';
import Nav from '../components/navbar';
import Graphs from '../components/embeds';
export default ({}) => {
  return (
    <Page name="home" className="home">
      <Nav />
      <BlockHeader>Dashboard</BlockHeader>
    </Page>
  );
};
