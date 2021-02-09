import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  f7,
  CardFooter,
  Button,
  Link,
  ListInput,
} from 'framework7-react';

import { logger } from '../js/utils';
const { log } = logger('checkin');

const defaultCalendarParams = {
  header: true,
  timePicker: false,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
  footer: true,
};

export default ({ onUpdate, ...props }) => {
  const submitCheckIn = (type) => (e) => {
    console.log('submit checkin event', e);
    const formData = f7.form.convertToData('#CheckInCard');
    return onUpdate({ ...formData, type });
  };

  const [values, setValues] = React.useState({ date: new Date(), ...props });

  const [currentTime, setCurrentTime] = React.useState('timer not working');
  const [timer, setTimer] = React.useState(null);
  React.useEffect(() => {
    if (values && values.time) return;
    const t = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    setTimer(t);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card className="add-checkin fab-morph-target" outline backdrop borderColor="blue">
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
            value={values?.name || ''}
          />
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
            defaultValue={values.date}
            calendarParams={{ ...defaultCalendarParams, value: [values.date] }}
          />
          <ListInput
            label="Time:"
            type="time"
            placeholder="Please choose..."
            name="time"
            value={(values && values.time) || currentTime}
            onChange={(e) => {
              log('onChange called', { values });
              if (timer) clearTimeout(timer);
              setValues({ ...values, time: e.target.value });
            }}
          />
        </List>
      </CardContent>
      <CardFooter>
        <Button
          fill
          iconF7="arrow_up_circle_fill"
          className="fab-close"
          onClick={submitCheckIn('Start')}
        >
          Start
        </Button>
        <Button
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
