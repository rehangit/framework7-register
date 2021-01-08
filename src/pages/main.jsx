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
  Popup,
  Popover,
  BlockTitle,
  View,
} from 'framework7-react';

import { SignInProfile } from '../components/profile';

import ScoreTab from './ScoreTab';
import StudentInfo from './popup';
import ErrorPage from './error';
import * as google from '../data/googleApi';

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

const indexToLetter = (n) => {
  const a = Math.floor(n / 26);
  if (a >= 0) return indexToLetter(a - 1) + String.fromCharCode(65 + (n % 26));
  else return '';
};

const serialToDate = (serial) =>
  new Date((Math.floor(serial) - 25569) * 86400 * 1000);

const getHeaders = async (scoreType) => {
  console.log('getHeaders', scoreType);

  if (!(await google.isSignedIn())) return {};

  const { rows, columns: dates } = await google.getSheetHeaders(
    scoreType,
    1,
    3
  );
  const names = rows.map(([id, name, section]) => ({
    id,
    name,
    section,
  }));
  console.log('getHeaders', scoreType, { names, dates });
  return { names, dates };
};

const saveData = async ({ scoreType, values }) => {
  if (!scoreType) return;
  if (!(await google.isSignedIn())) return;

  const rangesAndValues =
    (values &&
      values.map(({ ri, ci, value }) => {
        const col = indexToLetter(ci);
        const row = ri + 2;
        const range = `${scoreType}!${col}${row}`;
        return [range, value];
      })) ||
    [];
  console.log('saveData', { rangesAndValues });
  return google.saveData(rangesAndValues);
};

const getData = async ({ scoreType, indices }) => {
  console.log('getData', { scoreType, indices });
  if (!(await google.isSignedIn())) return [];

  const ranges = indices.map(([ri, ci]) => {
    const col = indexToLetter(ci);
    return `${scoreType}!${col}${2 + ri}`;
  });

  console.log('getData', { ranges });

  const colData = await google.getSheetData(ranges);
  console.log('getData', { colData, indices });

  const data = indices.map(([ri], i) => ({
    index: ri,
    value: colData && colData[i] && colData[i][0][0],
  }));
  console.log('getData', { data });
  return data;
};

export default ({ user, onProfile }) => {
  const [scoreHeaders, setScoreHeaders] = React.useState({});
  const [students, setStudents] = React.useState([]);
  const [dates, setDates] = React.useState([]);

  const [sections, setSections] = React.useState([]);
  const [selectedStudents, setSelectedStudents] = React.useState([]);
  const [scoreType, setScoreType] = React.useState('Attendance');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedSection, setSelectedSection] = React.useState();

  const [waiting, setWaiting] = React.useState(false);

  const [popupOpened, setPopupOpened] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState('');
  const [userData, setUserData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const onStudentInfo = (info) => {
    setPopupOpened(true);
    setSelectedStudent(students.find((s) => s.name === info.name));
  };

  React.useEffect(() => {
    setWaiting(true);
    const getAllHeaders = async () => {
      return Promise.all([
        getHeaders('Attendance'),
        getHeaders('Behaviour'),
        getHeaders('Learning'),
        getHeaders('source'),
      ]);
    };

    getAllHeaders().then(([a, b, l, s]) => {
      console.log('getAllHeaders', [a, b, l, s]);
      setScoreHeaders({ Attendance: a, Behaviour: b, Learning: l, Source: s });
      setScoreType('Attendance');
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
    if (selectedSection && sections.includes(selectedSection))
      window.localStorage.setItem('selectedSection', selectedSection);
  }, [selectedSection]);

  React.useEffect(() => {
    console.log('Getting student data again', {
      selectedDate,
      selectedSection,
      scoreType,
      students,
      dates,
    });

    if (!dates || !students || !selectedSection) return;
    setWaiting(true);

    const serial = dateToSerial(selectedDate);
    const col = dates.findIndex((d) => d === serial);
    const indices = students.reduce((acc, { section }, row) => {
      if (section === selectedSection) {
        acc.push([row, col]);
      }
      return acc;
    }, []);

    getData({ scoreType, indices })
      .then((data) => {
        const sorted = data
          .map(({ index, value }) => ({
            ...students[index],
            index,
            value,
            orig: value,
          }))
          .sort((a, b) => (a.name < b.name ? -1 : 1));
        setSelectedStudents(sorted);
        console.log('getData called', {
          input: {
            selectedDate,
            selectedSection,
            scoreType,
            students,
            dates,
          },
        });
        setWaiting(false);
      })
      .catch((err) => {
        setError(err);
        setWaiting(false);
      });
  }, [selectedDate, selectedSection, scoreType, students, dates]);

  React.useEffect(() => {
    if (!scoreHeaders || !selectedStudent) return;
    setWaiting(true);
    const rowIndex = scoreHeaders.Source.names.findIndex(
      (s) => s.id === selectedStudent.id
    );
    const ranges = scoreHeaders.Source.dates.map((_, c) => [rowIndex, c]);
    getData({ scoreType: 'source', indices: ranges }).then((data) => {
      console.log('Received student data from source', {
        rowIndex,
        ranges,
        data,
      });
      setUserData([scoreHeaders.Source.dates, data.map((d) => d.value)]);
      setWaiting(false);
    });
  }, [selectedStudent, scoreHeaders]);

  const modified = React.useMemo(() => {
    console.log('modified memo');
    const mods = selectedStudents.reduce(
      (acc, { value, orig }) => acc || value !== orig,
      false
    );
    console.log('onChange', { mods });
    return mods;
  }, [selectedStudents]);

  const onChange = React.useCallback(
    (value, name) => {
      console.log('main.jsx > onChange', value, name, selectedSection);
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
    saveData({ scoreType, values })
      .then(() => {
        setSelectedStudents(
          selectedStudents.map((s, i) => {
            s.orig = s.value;
            return s;
          })
        );
        setWaiting(false);
      })
      .catch((err) => {
        console.error(
          'Error saving data',
          { scoreType, selectedDate, values },
          err
        );
        setError(err);
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
    <View>
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
        <Tabs>
          {[
            ['Attendance', 'PLA'],
            ['Behaviour', '01234'],
            ['Learning', '01234'],
          ].map(([type, labels]) => (
            <ScoreTab
              key={type}
              type={type}
              scoreType={scoreType}
              scoreLabels={labels}
              setScoreType={setScoreType}
              onChange={onChange}
              selectedStudents={selectedStudents}
              selectedSection={selectedSection}
              waiting={waiting}
              onStudentInfo={onStudentInfo}
            />
          ))}
        </Tabs>

        <StudentInfo
          opened={popupOpened}
          onOpened={(val) => {
            if (!val) {
              console.log('closing thepop up and set user data to empty array');
              setPopupOpened(false);
              setImmediate(() => {
                setUserData([[]]);
              });
            }
          }}
          student={userData}
        />
        <Toolbar className="button-bar" hidden={!modified} bottom>
          <Button raised fill color="red" onClick={onCancel}>
            Cancel
          </Button>
          <Button raised fill color="green" onClick={onSave}>
            Save
          </Button>
        </Toolbar>
        <ErrorPage error={error} setError={setError} />
        <Preloader
          className="loader"
          style={{ display: waiting ? 'block' : 'none' }}
        />
      </Page>
    </View>
  );
};
