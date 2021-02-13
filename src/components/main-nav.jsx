import React from 'react';
import 'framework7-icons';

import { f7, Link, NavLeft, NavTitle } from 'framework7-react';

export default function MainNav({ title = f7.name }) {
  return (
    <div>
      <NavLeft>
        <Link iconF7="bars" panelOpen="left" />
        <NavTitle>{title}</NavTitle>
      </NavLeft>
    </div>
  );
}
