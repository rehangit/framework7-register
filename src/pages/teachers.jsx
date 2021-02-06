import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Navbar,
  NavLeft,
  NavTitle,
  Page,
  Link,
  List,
  ListItem,
  useStore,
  BlockTitle,
  Icon,
  Badge,
  Fab,
  f7,
} from 'framework7-react';

import '../css/teachers.css';

import { getCached, logger } from '../js/utils';
const { log } = logger('teachers');

import store from '../js/store';
import { getTeachersCheckins } from '../data/sheets';
import Checkin from './checkin';

export default function TeachersCheckins() {
  const version = useStore('userVersion');
  const user = useMemo(() => store.state.user, [version]);

  const [checkins, setCheckins] = useState([]);
  const [update, setUpdate] = useState(0);
  const startLoading = () => store.dispatch('startLoading');
  const endLoading = () => store.dispatch('endLoading');

  useEffect(() => {
    startLoading();
    getCached('teachers_checkin', 1 * 60 * 1000, getTeachersCheckins)
      .then((array) => {
        log('checkins data received', array);
        if (array) setCheckins(array);
      })
      .finally(endLoading);
  }, [update]);

  return (
    <Page>
      <Navbar innerClass="navbar-inner-spacing">
        <NavLeft>
          <Link iconF7="bars" panelOpen="left" />
          <NavTitle>Teachers Attendance</NavTitle>
        </NavLeft>
      </Navbar>
      <Fab
        position="right-top"
        text="Start / End"
        color="theme"
        onClick={() =>
          f7.input.scrollIntoView('#top-of-the-list', 200, false, true)
        }
        morphTo=".add-checkin"
      >
        <Icon f7="plus"></Icon>
      </Fab>
      <BlockTitle id="top-of-the-list">Today</BlockTitle>
      <List mediaList>
        <Checkin onUpdate={() => setUpdate(new Date())} />
        {checkins
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((ci, i) => {
            const color =
              user && user.email.includes(ci.user) ? 'theme' : 'gray';
            const icon =
              ci.type === 'Start'
                ? 'arrow_up_circle_fill'
                : 'arrow_down_circle_fill';

            return (
              <ListItem
                key={i}
                badgeColor={color}
                title={ci.name}
                subtitle={`${
                  ci.type === 'Start' ? 'Started' : 'Finished'
                } class: ${ci.section}`}
                text={ci.timestamp.toLocaleString()}
              >
                <Icon f7={icon} slot="media" size="48" color={color} />
                <div
                  slot="after"
                  style={{ position: 'absolute', right: 0, top: 0 }}
                >
                  <Badge color={color}>{ci.time.slice(0, 5)}</Badge>
                </div>
              </ListItem>
            );
          })}
      </List>
    </Page>
  );
}
