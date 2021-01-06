import React from 'react';
import 'framework7-icons';

import '../css/main.css';

import {
  Page,
  Navbar,
  ListItem,
  List,
  ListInput,
  Icon,
  Button,
  Toolbar,
  Link,
  f7,
  Block,
  Preloader,
  Tab,
  Tabs,
} from 'framework7-react';

import { SignInProfile } from '../components/profile';

import ScoreTab from './ScroreTab';

const calendarParams = {
  header: true,
  dateFormat: 'DD dd MM yyyy',
  closeOnSelect: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
};

const dateToSerial = (date) => {
  const startOfDay = new Date(new Date(date).toISOString().slice(0, 10));
  const serial = Math.floor(
    (startOfDay - new Date('1899-12-30')) / (1000 * 3600 * 24)
  );
  console.log('Converting date to serial', { date, serial });
  return serial;
};

export default ({ getData, getHeaders, user, onProfile, saveData }) => {
  const [scoreHeaders, setScoreHeaders] = React.useState({});
  const [students, setStudents] = React.useState([]);
  const [dates, setDates] = React.useState([]);

  const [sections, setSections] = React.useState([]);
  const [selectedStudents, setSelectedStudents] = React.useState([]);
  const [scoreType, setScoreType] = React.useState('Attendance');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedSection, setSelectedSection] = React.useState();

  const [waiting, setWaiting] = React.useState(false);

  const modified = React.useMemo(() => {
    console.log('modified memo');
    const mods = selectedStudents.reduce(
      (acc, { value, orig }) => acc || value !== orig,
      false
    );
    console.log('onChange', { mods });
    return mods;
  }, [selectedStudents]);

  React.useEffect(() => {
    if (selectedSection && sections.includes(selectedSection))
      window.localStorage.setItem('selectedSection', selectedSection);
  }, [selectedSection]);

  React.useEffect(() => {
    setWaiting(true);
    const getAllHeaders = async () => {
      return Promise.all([
        getHeaders('Attendance'),
        getHeaders('Behaviour'),
        getHeaders('Learning'),
      ]);
    };

    getAllHeaders().then(([a, b, l]) => {
      setScoreHeaders({ Attendance: a, Behaviour: b, Learning: l });
      setScoreType('Attendance');
      console.log('All headers received', [a, b, l]);
      setWaiting(false);
    });
  }, [user]);

  React.useEffect(() => {
    setWaiting(true);

    if (scoreHeaders && scoreHeaders[scoreType]) {
      setStudents(scoreHeaders[scoreType].names);
      setDates(scoreHeaders[scoreType].dates);
    }
    setWaiting(false);
  }, [scoreType, scoreHeaders]);

  React.useEffect(() => {
    if (!students || !students.length) return;
    const sectionsSet = students.reduce((acc, { section }) => {
      acc.add(section);
      return acc;
    }, new Set());

    const newSections = Array.from(sectionsSet).filter(Boolean).sort();
    console.log('React.useEffect [students]', { selectedSection, newSections });
    setSections(newSections);

    if (!selectedSection) {
      const storedSelectedSection = window.localStorage.getItem(
        'selectedSection'
      );
      console.log({ storedSelectedSection });
      if (storedSelectedSection && newSections.includes(storedSelectedSection))
        setSelectedSection(storedSelectedSection);
      else {
        setSelectedSection(newSections[0]);
      }
    }

    console.log('React.useEffect [students]', { students, newSections });
  }, [students]);

  React.useEffect(() => {
    setWaiting(true);

    if (!students || !students.length || !dates || !dates.length) return;

    const serial = dateToSerial(selectedDate);
    const col = dates.findIndex((d) => d === serial);
    const indices = students.reduce((acc, { section }, row) => {
      if (section === selectedSection) {
        acc.push([row, col]);
      }
      return acc;
    }, []);

    getData({ scoreType, indices }).then((data) => {
      console.log('getData for scoreType', scoreType, 'indices', indices, {
        data,
      });
      const sdata = data
        .map(({ index, value }) => ({
          ...students[index],
          index,
          value,
          orig: value,
        }))
        .sort((a, b) => (a.name < b.name ? -1 : 1));
      setSelectedStudents(sdata);

      setWaiting(false);
      console.log({ sdata });
    });
  }, [selectedDate, selectedSection, scoreType, students, dates]);

  const onChange = React.useCallback(
    (value, name) => {
      console.log('onChange', value, name, selectedSection);
      if (name) {
        const index = selectedStudents.findIndex((s) => s.name === name);
        selectedStudents[index].value = value;
      } else {
        selectedStudents.forEach((s, i) => {
          if (s.section === selectedSection) {
            selectedStudents[i].value = value;
          }
        });
      }
      setSelectedStudents(selectedStudents.slice());
    },
    [selectedStudents, selectedSection]
  );

  const onSave = React.useCallback(() => {
    if (!modified) return;
    setWaiting(true);
    const serial = dateToSerial(selectedDate);
    const colIndex = dates.findIndex((d) => d === serial);
    const values = selectedStudents.reduce((acc, { index, value, orig }) => {
      if (value != orig) {
        acc.push({ ri: index, ci: colIndex, value });
      }
      return acc;
    }, []);
    console.log('saving data:', { scoreType, date: selectedDate, values });
    saveData({ scoreType, values }).then(() => {
      setSelectedStudents(
        selectedStudents.map((s, i) => {
          s.orig = s.value;
          return s;
        })
      );
      setWaiting(false);
    });
  }, [selectedDate, selectedStudents, modified]);

  const onCancel = React.useCallback(() => {
    selectedStudents.forEach((s, i) => {
      selectedStudents[i].value = s.orig;
    });
    setSelectedStudents(selectedStudents.slice());
  }, [selectedStudents]);

  const name = (f7 && f7.params.name) || '';

  return (
    <Page>
      <Navbar title={name} innerClass="navbar-inner-spacing">
        <SignInProfile
          user={user}
          onClick={() => {
            console.log('trying to open login screen');
            onProfile(true);
          }}
        />
      </Navbar>
      <List inlineLabels className="settings">
        <ListInput
          type="datepicker"
          label="Date"
          value={[selectedDate]}
          calendarParams={calendarParams}
          outline
          disabled={modified}
          onCalendarChange={([newDate]) => setSelectedDate(newDate)}
        />
        <ListInput
          type="select"
          label="Class"
          value={selectedSection}
          outline
          onChange={(e) => setSelectedSection(e.target.value)}
          disabled={modified}
        >
          {sections.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </ListInput>
      </List>
      <Toolbar hidden={modified} tabbar bottom>
        <Link tabLink="#Attendance">Attendance</Link>
        <Link tabLink="#Behaviour">Behaviour</Link>
        <Link tabLink="#Learning">Learning</Link>
      </Toolbar>
      <Tabs animated swipeable className="tabs">
        {[
          ['Attendance', 'PLA'],
          ['Behaviour', '01234'],
          ['Learning', '01234'],
        ].map(([type, labels]) => (
          <ScoreTab
            scoreType={type}
            scoreLabels={labels}
            setScoreType={setScoreType}
            onChange={onChange}
            selectedStudents={selectedStudents}
            selectedSection={selectedSection}
            waiting={waiting}
          />
        ))}
      </Tabs>
      <Toolbar className="button-bar" hidden={!modified} bottom>
        <Button raised fill color="red" onClick={onCancel}>
          Cancel
        </Button>
        <Button raised fill color="green" onClick={onSave}>
          Save
        </Button>
      </Toolbar>
      <Preloader
        className="loader"
        style={{ display: waiting ? 'block' : 'none' }}
      />
    </Page>
  );
};
