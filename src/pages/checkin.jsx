import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  f7,
  useStore,
  CardFooter,
  Button,
  Link,
} from 'framework7-react';

import store from '../js/store';
import { writeTeacherCheckIn } from '../data/sheets';

const calendarParams = {
  header: true,
  timePicker: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
  footer: true,
};

export default ({ onUpdate }) => {
  const [timeNow, setTimeNow] = useState(new Date());
  const version = useStore('userVersion');
  const user = useMemo(() => store.state.user, [version]);
  // const [auto, setAuto] = useState(true);
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
      console.log('destroying calendar');
      cal.destroy();
    };
  }, [cal]);

  const submitCheckIn = React.useCallback(
    (type) => (e) => {
      console.log('submit checkin event', e);
      var formData = f7.form.convertToData('#CheckInCard');
      writeTeacherCheckIn({
        ...formData,
        type,
        username: user.email.split('@')[0],
      }).then(onUpdate);
    },
    []
  );

  return (
    <Card className="add-checkin fab-morph-target">
      <CardHeader style={{ fontWeight: 'bold' }}>
        Add Attendance Update
        <Link href="#" className="fab-close" iconF7="xmark" />
      </CardHeader>

      <CardContent>
        <List form formStoreData inlineLabels id="CheckInCard">
          <ListItem
            link
            title="Name"
            loginScreenOpen="#the-login-screen"
            type="select"
            after={user?.name || ''}
          >
            <input hidden readOnly name="name" value={user?.name || ''} />
          </ListItem>
          <ListItem
            title="Class"
            smartSelect
            smartSelectParams={{ closeOnSelect: true }}
            name="section"
          >
            <select name="section">
              {['B1', 'B2', 'B3', 'B4', 'G1', 'G2', 'G3', 'G4', 'W1', 'W2'].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </ListItem>
          <ListItem
            link
            title="Date"
            after={timeNow.toLocaleDateString()}
            onClick={() => cal.open()}
            name="datetime"
          />
          <ListItem
            link
            title="Time"
            after={timeNow.toLocaleTimeString()}
            onClick={() => cal.open()}
            name="datetime"
          />
          <input hidden readOnly value={timeNow} name="datetime" />
        </List>
      </CardContent>
      <CardFooter>
        <Button
          raised
          fill
          iconF7="arrow_up_circle_fill"
          className="fab-close"
          onClick={submitCheckIn('Start')}
        >
          Start
        </Button>
        <Button
          raised
          fill
          iconF7="arrow_down_circle_fill"
          className="fab-close"
          onClick={submitCheckIn('End')}
        >
          End
        </Button>
      </CardFooter>
    </Card>
  );
};
