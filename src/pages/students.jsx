import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createRef,
} from 'react';
import 'framework7-icons';

import '../css/main.css';

import {
  Block,
  BlockTitle,
  Button,
  f7,
  Icon,
  Link,
  List,
  ListInput,
  ListItem,
  Navbar,
  NavLeft,
  NavTitle,
  Page,
  Popover,
  Popup,
  Tab,
  Tabs,
  Toolbar,
  View,
} from 'framework7-react';
import { useStore } from 'framework7-react';

import store from '../js/store';
import ScoreTab from '../components/score-tab.jsx';
import StudentInfo from './popup';
import * as google from '../api/google-auth';

const calendarParams = {
  header: true,
  dateFormat: 'DD dd MM yyyy',
  closeOnSelect: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
};

import { dateToSerial, indexToLetter } from '../js/utils';
import { getHeaders, getData, saveData } from '../js/data';
import { logger } from '../js/utils';
const { log } = logger('main');

export default ({}) => {
  const [scoreHeaders, setScoreHeaders] = useState({});
  const [students, setStudents] = useState([]);
  const [dates, setDates] = useState([]);

  const [sections, setSections] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scoreType, setScoreType] = useState('Attendance');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSection, setSelectedSection] = useState();

  const setLoading = (value) =>
    value ? store.dispatch('startLoading') : store.dispatch('endLoading');

  const [selectedStudent, setSelectedStudent] = useState('');
  const [userData, setUserData] = useState([]);

  const userVersion = useStore('userVersion');
  const user = useMemo(() => store.getters.user.value, [userVersion]);

  const onStudentInfo = (info) => {
    setSelectedStudent(students.find((s) => s.name === info.name));
  };

  useEffect(() => {
    log('useEffect [] user', user);
    setLoading(true);
    const getAllHeaders = async () => {
      return Promise.all([
        getHeaders('Attendance'),
        getHeaders('Behaviour'),
        getHeaders('Learning'),
        getHeaders('source'),
      ]);
    };

    getAllHeaders().then(([a, b, l, s]) => {
      log('getAllHeaders', [a, b, l, s]);
      setScoreHeaders({
        Attendance: a,
        Behaviour: b,
        Learning: l,
        Source: s,
      });
      setScoreType('Attendance');
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    setLoading(true);

    if (scoreHeaders && scoreHeaders[scoreType]) {
      setStudents(scoreHeaders[scoreType].names);
      setDates(scoreHeaders[scoreType].dates);
    }
    setLoading(false);
  }, [scoreType, scoreHeaders]);

  useEffect(() => {
    if (!students || !students.length) return;
    const sectionsSet = students.reduce((acc, { section }) => {
      acc.add(section);
      return acc;
    }, new Set());

    const newSections = Array.from(sectionsSet).filter(Boolean).sort();
    log('useEffect [students]', { selectedSection, newSections });
    setSections(newSections);

    if (!selectedSection) {
      const storedSelectedSection = window.localStorage.getItem(
        'selectedSection'
      );
      log({ storedSelectedSection });
      if (storedSelectedSection && newSections.includes(storedSelectedSection))
        setSelectedSection(storedSelectedSection);
      else {
        setSelectedSection(newSections[0]);
      }
    }

    log('useEffect [students]', { students, newSections });
  }, [students]);

  useEffect(() => {
    if (selectedSection && sections.includes(selectedSection))
      window.localStorage.setItem('selectedSection', selectedSection);
  }, [selectedSection]);

  useEffect(() => {
    log('Getting student data again', {
      selectedDate,
      selectedSection,
      scoreType,
      students,
      dates,
    });

    if (!dates || !students || !selectedSection) return;
    setLoading(true);

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
        log('getData called', {
          input: {
            selectedDate,
            selectedSection,
            scoreType,
            students,
            dates,
          },
        });
        setLoading(false);
      })
      .catch((err) => {
        store.dispatch('setError', err);
        setLoading(false);
      });
  }, [selectedDate, selectedSection, scoreType, students, dates]);

  useEffect(() => {
    if (!scoreHeaders || !selectedStudent) return;
    setLoading(true);
    const rowIndex = scoreHeaders.Source.names.findIndex(
      (s) => s.id === selectedStudent.id
    );
    const ranges = scoreHeaders.Source.dates.map((_, c) => [rowIndex, c]);
    getData({ scoreType: 'source', indices: ranges }).then((data) => {
      log('Received student data from source', {
        rowIndex,
        ranges,
        data,
      });
      setUserData([scoreHeaders.Source.dates, data.map((d) => d.value)]);
      setLoading(false);
    });
  }, [selectedStudent, scoreHeaders]);

  const modified = useMemo(() => {
    log('useMemo called for calculating modified', {
      selectedStudents,
    });
    const mods = selectedStudents.reduce(
      (acc, { value, orig }) => acc || value !== orig,
      false
    );
    log('useMemo calculated mods:', mods);
    return mods;
  }, [selectedStudents]);

  const onChange = useCallback(
    (value, name) => {
      log('main.jsx > onChange', value, name, selectedSection);
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

  const onSave = useCallback(() => {
    if (!modified) return;
    setLoading(true);
    const serial = dateToSerial(selectedDate);
    const colIndex = dates.findIndex((d) => d === serial);
    const values = selectedStudents.reduce((acc, { index, value, orig }) => {
      if (value != orig) {
        acc.push({ ri: index, ci: colIndex, value });
      }
      return acc;
    }, []);
    log('saving data:', { scoreType, date: selectedDate, values });
    saveData({ scoreType, values })
      .then(() => {
        setSelectedStudents(
          selectedStudents.map((s, i) => {
            s.orig = s.value;
            return s;
          })
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          'Error saving data',
          { scoreType, selectedDate, values },
          err
        );
        store.dispatch('setError', err);
        setLoading(false);
      });
  }, [selectedDate, selectedStudents, modified]);

  const onCancel = useCallback(() => {
    selectedStudents.forEach((s, i) => {
      selectedStudents[i].value = s.orig;
    });
    setSelectedStudents(selectedStudents.slice());
  }, [selectedStudents]);

  return (
    <Page name="students">
      <Navbar innerClass="navbar-inner-spacing">
        <NavLeft>
          <Link iconF7="bars" panelOpen="left" />
          <NavTitle>Students</NavTitle>
        </NavLeft>
      </Navbar>
      <Toolbar hidden={modified} tabbar bottom>
        <Link tabLink="#Attendance">Attendance</Link>
        <Link tabLink="#Behaviour">Behaviour</Link>
        <Link tabLink="#Learning">Learning</Link>
      </Toolbar>
      <Toolbar className="button-bar" tabbar hidden={!modified} bottom>
        <Button raised fill color="red" onClick={onCancel}>
          Cancel
        </Button>
        <Button raised fill color="green" onClick={onSave}>
          Save
        </Button>
      </Toolbar>
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
            onStudentInfo={onStudentInfo}
          />
        ))}
      </Tabs>

      <StudentInfo
        onClosed={() => {
          log('closing the pop up and set user data to empty array');
          setSelectedStudent('');
        }}
        student={userData}
      />
    </Page>
  );
};
