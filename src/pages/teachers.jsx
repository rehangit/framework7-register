import React, { useCallback, useEffect, useState } from 'react';
import { Navbar, Page, Tabs, Toolbar, Link, Tab, Fab, Icon, f7 } from 'framework7-react';

import '../css/teachers.css';

import MainNav from '../components/main-nav';
import TeachersUpdates from '../components/teachers-updates';
import TeachersAttendanceTable from '../components/teachers-attendance-table';
import { endLoading, startLoading } from '../js/loader';
import { getCached } from '../js/utils';
import { getTeachersCheckins, writeTeacherCheckIn } from '../data/sheets';

import { logger } from '../js/utils';
const { log } = logger('teachers');

export default function TeachersCheckins() {
  const [newUpdate, setNewUpdate] = useState(0);
  const [checkins, setCheckins] = useState([]);

  const populate = useCallback((quick) => {
    startLoading('teachers populate');
    getCached('teachers_checkin', quick ? 0 : 1 * 60 * 1000, getTeachersCheckins)
      .then(setCheckins)
      .finally(() => endLoading('teachers populate'));
  }, []);

  useEffect(() => {
    populate(false);
  }, []);

  const onUpdate = useCallback(({ name, date, time, section, type, username }) => {
    startLoading('teachers on update');
    const data = {
      name,
      date,
      time,
      section,
      type,
      username,
    };
    log('onUpdate submitting checkin', data);
    writeTeacherCheckIn(data)
      .then(() => {
        populate(true);
      })
      .finally(() => endLoading('teachers on update'));
  }, []);

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
        onClick={() => {
          setNewUpdate(newUpdate + 1);
          f7.tab.show('#Updates');
        }}
        morphTo=".add-checkin"
      >
        <Icon f7="plus"></Icon>
      </Fab>

      <Toolbar tabbar bottom>
        <Link tabLink="#Updates">Updates</Link>
        <Link tabLink="#Overview">Overview</Link>
      </Toolbar>
      <Tabs>
        <TeachersUpdates newUpdate={newUpdate} checkins={checkins} onUpdate={onUpdate} />
        <Tab id="Overview">
          <TeachersAttendanceTable checkins={checkins} />
        </Tab>
      </Tabs>
    </Page>
  );
}
