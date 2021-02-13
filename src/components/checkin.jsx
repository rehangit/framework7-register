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

const calendarParams = {
  header: true,
  dateFormat: 'dd/mm/yyyy',
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
  footer: true,
};

export default function CheckinForm({ onUpdate, checkin }) {
  const submitCheckIn = (type) => (e) => {
    console.log('submit checkin event', e);
    const formData = f7.form.convertToData('#CheckInCard');
    return onUpdate({ ...formData, type });
  };

  const [values, setValues] = React.useState(checkin);
  const [storedSection, setStoredSection] = React.useState('');

  React.useEffect(() => {
    const section = localStorage.getItem('selectedSection');
    setStoredSection(section);
  }, []);

  React.useEffect(() => {
    setValues(checkin);
  }, [checkin]);

  log('checkin form props', { checkin, values });
  const bgcolor = values && values.type && values.type.length > 0 ? '#eef' : 'white';

  return (
    <Card
      className={`add-checkin fab-morph-target`}
      outline
      backdrop
      borderColor="blue"
      style={{ backgroundColor: bgcolor }}
    >
      <CardHeader style={{ fontWeight: 'bold' }}>
        {`${values.type ? 'Edit' : 'Add'} Attendance Update`}
        <Link href="#" className="fab-close" iconF7="xmark" />
      </CardHeader>

      <CardContent>
        <List form inlineLabels id="CheckInCard">
          <ListInput
            label="Name"
            name="name"
            loginScreenOpen="#the-login-screen"
            readonly
            value={values.name || ''}
          />
          <ListInput
            label="Class"
            type="select"
            placeholder="Please select your class"
            name="section"
            value={values.section || storedSection || ''}
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
            value={[values.date || new Date()]}
            calendarParams={calendarParams}
          />
          <ListInput
            label="Time:"
            type="time"
            placeholder="Please choose..."
            name="time"
            value={values.time || ''}
            onChange={(e) => {
              log('onChange called', { values });
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
          disabled={values.type && !values.type.includes('Start')}
        >
          Start
        </Button>
        <Button
          fill
          iconF7="arrow_down_circle_fill"
          className="fab-close"
          onClick={submitCheckIn('End')}
          disabled={values.type && !values.type.includes('End')}
        >
          End
        </Button>
      </CardFooter>
    </Card>
  );
}
