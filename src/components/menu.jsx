import React from 'react';
import 'framework7-icons';
import { f7, Panel, List, ListItem, Navbar } from 'framework7-react';

import SignInProfile from '../components/profile';

export default function Menu({}) {
  return (
    <Panel left cover>
      <Navbar title={f7.name} subtitle={f7.version} />
      <List>
        <SignInProfile />
        <ListItem link="/" title="Home" panelClose />
        <ListItem link="/students/" title="Students" panelClose />
        <ListItem link="/teachers/" title="Teachers" panelClose />
      </List>
    </Panel>
  );
}
