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
  useStore,
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
    const validityResponse = f7.el.querySelector('#CheckInCard').checkValidity();
    console.log('submit checkin event', { e, validityResponse });
    if (!validityResponse) return;

    const formData = f7.form.convertToData('#CheckInCard');
    onUpdate({ ...values, ...formData, type });
    f7.fab.close('.add-start-end');
  };

  const [values, setValues] = React.useState(checkin);
  const sections = useStore('sections');
  const [storedSection, setStoredSection] = React.useState('');

  React.useEffect(() => {
    const section = localStorage.getItem('selectedSection');
    setStoredSection(section);
    if (!values.section) {
      setValues({ ...values, section });
    }
  }, []);

  React.useEffect(() => {
    log('useEffect on [checkin]', checkin);
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
            required
            validate
            pattern={sections.join('|')}
            onChange={(e) => {
              log('checkin form list input for Class onChange called', {
                values,
                new: e.target.value,
              });
              setValues({ ...values, section: e.target.value });
            }}
          >
            {[...sections].map((c) => (
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
            value={(values.time || '').toString().slice(0, 5)}
            onChange={(e) => {
              log('checkin form list input for Time onChange called', {
                values,
                new: e.target.value,
              });
              setValues({ ...values, time: e.target.value });
            }}
          />
        </List>
      </CardContent>
      <CardFooter>
        <Button fill iconF7="arrow_up_circle_fill" onClick={submitCheckIn('Start')} type="submit">
          Start
        </Button>
        <Button fill iconF7="arrow_down_circle_fill" onClick={submitCheckIn('End')} type="submit">
          End
        </Button>
      </CardFooter>
    </Card>
  );
}
