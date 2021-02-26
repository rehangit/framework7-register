import React from 'react';
import 'framework7-icons';

import { f7, Link, div, NavLeft, NavRight, NavTitle, Searchbar } from 'framework7-react';

export function LeftNav({ title = f7.name }) {
  return (
    <NavLeft>
      <Link iconF7="bars" panelOpen="left" />
      <NavTitle>{title}</NavTitle>
    </NavLeft>
  );
}

export function RightNav() {
  const [visible, setVisible] = React.useState(false);
  return (
    <NavRight>
      <Link
        searchbarEnable=".searchbar"
        iconF7="search"
        onClick={() => setVisible(true)}
        style={{ display: visible ? 'none' : 'block' }}
        iconSize="large"
      />
      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title, .item-subtitle, .item-text, .item-after"
        clearButton
        disableButton
        inline
        style={{ width: '90%', display: visible ? 'inline' : 'none', fontSize: '7pt' }}
        onClickDisable={() => {
          setVisible(false);
        }}
      />
    </NavRight>
  );
}
