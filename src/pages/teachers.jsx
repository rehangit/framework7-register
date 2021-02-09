import React, { useEffect, useMemo, useState } from 'react';
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

import { startLoading, endLoading } from '../js/loader';
import { getCached, logger } from '../js/utils';
const { log } = logger('teachers');

import store from '../js/store';
import { getTeachersCheckins, writeTeacherCheckIn } from '../data/sheets';

import Checkin from './checkin';

export default function TeachersCheckins() {
  const version = useStore('userVersion');
  const user = useMemo(() => store.state.user, [version]);

  const [checkins, setCheckins] = useState([]);
  const [checkin, setCheckin] = useState(null);

  const populate = (quick) => {
    startLoading();
    getCached('teachers_checkin', quick ? 0 : 1 * 60 * 1000, getTeachersCheckins)
      .then(setCheckins)
      .finally(endLoading);
  };

  useEffect(() => {
    populate(false);
  }, []);

  const onUpdate = async ({ name, date, time, section, type }) => {
    startLoading();
    await writeTeacherCheckIn({
      name,
      date,
      time,
      section,
      type,
      username: user?.email.split('@')[0],
    });
    await populate(true);
    endLoading();
  };

  // const onEditUpdate = (index) => {
  //   setCheckin(checkins[index]);
  // };

  const CheckinCard = React.useMemo(
    () => () => <Checkin onUpdate={onUpdate} name={checkin?.name || user.name}></Checkin>,
    [checkin]
  );

  const isCurrentUser = (email) => user && user.email.includes(email);

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
        onClick={() => {
          setCheckin(null);
          f7.input.scrollIntoView('#top-of-the-list', 200, false, true);
        }}
        morphTo=".add-checkin"
      >
        <Icon f7="plus"></Icon>
      </Fab>
      <BlockTitle id="top-of-the-list">Recent updates</BlockTitle>
      <List mediaList>
        {<CheckinCard />}
        {checkins
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((ci, i) => {
            const color = isCurrentUser(ci.username) ? 'theme' : 'gray';
            const icon = ci.type === 'Start' ? 'arrow_up_circle_fill' : 'arrow_down_circle_fill';

            return (
              <ListItem
                link={isCurrentUser(ci.username)}
                key={i}
                badgeColor={color}
                title={ci.name}
                subtitle={`${ci.type === 'Start' ? 'Started' : 'Finished'} class: ${ci.section}`}
                text={ci.timestamp.toLocaleString()}
                onClick={isCurrentUser(ci.username) ? () => setCheckin(ci) : null}
              >
                <Icon f7={icon} slot="media" size="48" color={color} />
                <div slot="after" style={{ position: 'absolute', right: 0, top: 0 }}>
                  <Badge color={color}>{ci.time.slice(0, 5)}</Badge>
                </div>
              </ListItem>
            );
          })}
      </List>
    </Page>
  );
}
