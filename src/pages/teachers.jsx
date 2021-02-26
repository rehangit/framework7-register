import React, { useCallback, useEffect, useState } from 'react';
import { Navbar, Page, Tabs, Toolbar, Link, Tab, Fab, Icon, f7 } from 'framework7-react';

import '../css/teachers.css';

import { LeftNav, RightNav } from '../components/main-nav';
import TeachersUpdates from '../components/teachers-updates';
import TeachersAttendanceTable from '../components/teachers-attendance-table';
import { endLoading, startLoading } from '../js/loader';
import { getCached, purgeCache } from '../js/utils';
import { getTeachersCheckins, writeTeacherCheckIn } from '../data/sheets';

import { logger } from '../js/utils';
import TeachersUpdatesPerClass from '../components/teachers-updates-per-class';
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

  const onUpdate = useCallback(({ name, date, time, section, type, username, id }) => {
    startLoading('teachers on update');
    const data = {
      name,
      date,
      time,
      section,
      type,
      username,
      id,
    };
    log('onUpdate submitting checkin', data);
    writeTeacherCheckIn(data)
      .then(() => {
        purgeCache('teachers_checkin');
        populate(true);
      })
      .finally(() => endLoading('teachers on update'));
  }, []);

  return (
    <Page name="teachers">
      <Navbar>
        <LeftNav title="Teachers" />
        <RightNav />
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
        <Link tabLink="#PerClass">Classes</Link>
        <Link tabLink="#Updates">Updates</Link>
        <Link tabLink="#Overview">Overview</Link>
      </Toolbar>
      <Tabs>
        <Tab id="PerClass" tabActive>
          <TeachersUpdatesPerClass checkins={checkins} />
        </Tab>
        <Tab id="Updates">
          <TeachersUpdates
            newUpdate={newUpdate}
            checkins={checkins}
            onUpdate={onUpdate}
            onDelete={(data) => onUpdate({ ...data, type: 'Deleted' })}
          />
        </Tab>
        <Tab id="Overview">
          <TeachersAttendanceTable checkins={checkins} />
        </Tab>
      </Tabs>
    </Page>
  );
}
