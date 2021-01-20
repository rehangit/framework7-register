import React from 'react';
import 'framework7-icons';

import { f7, Link, Navbar, NavLeft, NavTitle } from 'framework7-react';

export default ({ title = f7.name }) => {
  return (
    <Navbar innerClass="navbar-inner-spacing">
      <NavLeft>
        <Link iconF7="bars" panelOpen="left" />
        <NavTitle>{title}</NavTitle>
      </NavLeft>
    </Navbar>
  );
};
