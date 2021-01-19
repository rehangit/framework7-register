import React, { useEffect, useMemo, useState } from 'react';
import {
  Navbar,
  NavLeft,
  NavTitle,
  Page,
  Link,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListInput,
  f7,
  useStore,
  CardFooter,
  Button,
  Input,
  Block,
} from 'framework7-react';

import store from '../js/store';

const calendarParams = {
  header: true,
  timePicker: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
  footer: true,
};

export default () => {
  const [timeNow, setTimeNow] = useState(new Date());
  const version = useStore('userVersion');
  const user = useMemo(() => store.state.user, [version]);
  const [auto, setAuto] = useState(true);
  const cal = useMemo(() => {
    const calendar = f7.calendar.create({
      ...calendarParams,
      value: [timeNow],
    });
    calendar.on('closed', () => setTimeNow(calendar.value[0]));
    return calendar;
  }, [calendarParams]);

  useEffect(() => {
    return () => {
      console.log('destrying calendar');
      cal.destroy();
    };
  }, [cal]);
  return (
    <Page>
      <Navbar innerClass="navbar-inner-spacing">
        <NavLeft>
          <Link iconF7="bars" panelOpen="left" />
          <NavTitle>Teacher Checkin</NavTitle>
        </NavLeft>
      </Navbar>
      <Card>
        <CardHeader style={{ fontWeight: 'bold' }}>Check In Details</CardHeader>
        <CardContent>
          <List inlineLabels>
            <ListItem
              link
              title="Name"
              after={user?.name || ''}
              loginScreenOpen="#the-login-screen"
            />
            <ListItem
              title="Class"
              smartSelect
              smartSelectParams={{ closeOnSelect: true }}
            >
              <select name="section">
                {[
                  'B1',
                  'B2',
                  'B3',
                  'B4',
                  'G1',
                  'G2',
                  'G3',
                  'G4',
                  'W1',
                  'W2',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </ListItem>
            <ListItem
              link
              title="Date"
              after={timeNow.toLocaleDateString()}
              onClick={() => cal.open()}
            />
            <ListItem
              link
              title="Time"
              after={timeNow.toLocaleTimeString()}
              onClick={() => cal.open()}
            />
          </List>
        </CardContent>
        <CardFooter>
          <Button raised fill>
            Check In
          </Button>
          <Button raised fill disabled>
            Check Out
          </Button>
        </CardFooter>
      </Card>
    </Page>
  );
};
