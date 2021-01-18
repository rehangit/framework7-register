import React from 'react';
import { Navbar, NavLeft, NavTitle, Page, Link } from 'framework7-react';

export default () => {
  return (
    <Page>
      <Navbar innerClass="navbar-inner-spacing">
        <NavLeft>
          <Link iconF7="bars" panelOpen="left" />
          <NavTitle>Teacher Checkin</NavTitle>
        </NavLeft>
      </Navbar>
    </Page>
  );
};
