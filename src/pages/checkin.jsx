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
  ListInput,
} from 'framework7-react';

import store from '../js/store';
import { writeTeacherCheckIn } from '../data/sheets';

const defaultCalendarParams = {
  header: true,
  timePicker: false,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
  footer: true,
};

export default ({ onUpdate }) => {
  const timeNow = new Date();
  const version = useStore('userVersion');
  const user = useMemo(() => store.state.user, [version]);
  const calendarParams = {
    ...defaultCalendarParams,
    value: [timeNow],
  };

  const submitCheckIn = React.useCallback(
    (type) => (e) => {
      console.log('submit checkin event', e);
      var formData = f7.form.convertToData('#CheckInCard');
      writeTeacherCheckIn({
        ...formData,
        type,
        username: user?.email.split('@')[0],
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
          <ListInput
            label="Name"
            name="name"
            loginScreenOpen="#the-login-screen"
            readonly
            value={user?.name || ''}
          ></ListInput>
          <ListInput
            label="Class"
            type="select"
            defaultValue="B1"
            placeholder="Please select your class"
            name="section"
          >
            {['B1', 'B2', 'B3', 'B4', 'G1', 'G2', 'G3', 'G4', 'W1', 'W2'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </ListInput>
          <ListInput
            label="Date"
            type="datepicker"
            placeholder="Select date"
            readonly
            name="date"
            defaultValue={timeNow.toLocaleDateString()}
            calendarParams={calendarParams}
          />
          <ListInput
            label="Time"
            type="time"
            placeholder="Please choose..."
            name="time"
            defaultValue={timeNow.toLocaleTimeString().slice(0, 5)}
          />
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
