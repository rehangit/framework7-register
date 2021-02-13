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

import { getTeachersCheckins, writeTeacherCheckIn } from '../data/sheets';

import Checkin from '../components/checkin';
import MainNav from '../components/main-nav';

export default function TeachersCheckins() {
  const user = useStore('user');

  const defaultCheckin = React.useCallback(
    () => ({
      name: user?.name,
      date: new Date().toISOString().slice(0, 10),
      type: '',
      time: new Date().toLocaleTimeString(),
    }),
    [user]
  );

  const [checkins, setCheckins] = useState([]);
  const [checkin, setCheckin] = useState(defaultCheckin());

  const populate = React.useCallback((quick) => {
    startLoading('teachers populate');
    getCached('teachers_checkin', quick ? 0 : 1 * 60 * 1000, getTeachersCheckins)
      .then(setCheckins)
      .finally(() => endLoading('teachers populate'));
  }, []);

  useEffect(() => {
    populate(false);
  }, []);

  const onUpdate = React.useCallback(({ name, date, time, section, type }) => {
    startLoading('teachers on update');
    const data = {
      name,
      date,
      time,
      section,
      type,
      username: user?.email.split('@')[0],
    };
    log('onUpdate submitting checkin', data);
    writeTeacherCheckIn(data)
      .then(() => {
        populate(true);
      })
      .finally(() => endLoading('teachers on update'));
  }, []);

  const onEditUpdate = (ci) => {
    log('onEditUpdate', ci);
    setCheckin(ci);
    f7.input.scrollIntoView('#top-of-the-list', 200, false, true);
    if (ci.type) setTimeout(() => f7.fab.open('.add-start-end'), 500);
  };

  const isCurrentUser = (email) => user && user.email.includes(email);

  return (
    <Page name="teachers">
      <Navbar>
        <MainNav title="Teachers" />
      </Navbar>
      <Fab
        className="add-start-end"
        position="right-top"
        text="Start / End"
        color="theme"
        onClick={() => onEditUpdate(defaultCheckin())}
        morphTo=".add-checkin"
      >
        <Icon f7="plus"></Icon>
      </Fab>
      <BlockTitle id="top-of-the-list">Recent updates</BlockTitle>
      <List mediaList>
        <Checkin onUpdate={onUpdate || console.log('onUpdate is not defined')} checkin={checkin} />
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
                onClick={isCurrentUser(ci.username) ? () => onEditUpdate(ci) : null}
              >
                <Icon f7={icon} slot="media" size="48" color={color} />
                <div slot="after" style={{ position: 'absolute', right: 0, top: 0 }}>
                  <Badge color={color}>{ci.time.slice(0, 5)}</Badge>
                  <div>{new Date(ci.date).toLocaleDateString()}</div>
                </div>
              </ListItem>
            );
          })}
      </List>
    </Page>
  );
}
