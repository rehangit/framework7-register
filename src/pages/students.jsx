import React, { useState, useEffect, useMemo, useCallback } from 'react';
import 'framework7-icons';

import '../css/main.css';

import {
  Button,
  Link,
  List,
  ListInput,
  Navbar,
  NavLeft,
  NavTitle,
  Page,
  Tabs,
  Toolbar,
  useStore,
} from 'framework7-react';

import store from '../js/store';
import ScoreTab from '../components/score-tab.jsx';
import StudentInfo from './student-info';

const calendarParams = {
  header: true,
  dateFormat: 'DD dd MM yyyy',
  closeOnSelect: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
};

import {
  readStudentRegister,
  getActiveStudents,
  writeStudentRegister,
} from '../data/sheets';
import { logger } from '../js/utils';
const { log } = logger('main');

export default () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scoreType, setScoreType] = useState('Attendance');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSection, setSelectedSection] = useState();

  const [selectedStudentId, setSelectedStudentId] = useState('0');

  const setLoading = (value) =>
    value ? store.dispatch('startLoading') : store.dispatch('endLoading');

  const userVersion = useStore('userVersion');
  const user = useMemo(() => store.getters.user.value, [userVersion]);

  useEffect(() => {
    setLoading(true);
    log('Loading students');
    user &&
      getActiveStudents()
        .then((activeStudents) => {
          const sectionsSet = new Set();
          activeStudents.forEach(({ section }) => sectionsSet.add(section));
          setStudents(activeStudents);

          const sectionsArray = Array.from(sectionsSet).filter(Boolean).sort();
          log('students loaded', {
            activeStudents,
            sectionsSet,
            sectionsArray,
          });
          setSections(sectionsArray);

          const storedSection = window.localStorage.getItem('selectedSection');
          const section =
            storedSection && sectionsArray.includes(storedSection)
              ? storedSection
              : sectionsArray[0];

          setSelectedSection(section);
        })
        .finally(() => {
          setLoading(false);
        });
  }, [user]);

  useEffect(() => {
    log('writing to local storage', { selectedSection, sections });
    if (selectedSection && sections.includes(selectedSection))
      window.localStorage.setItem('selectedSection', selectedSection);
    setSelectedStudents(students.filter((s) => s.section === selectedSection));
  }, [selectedSection, sections]);

  useEffect(() => {
    log('Getting student data', { selectedDate, selectedSection, students });
    if (!students || !selectedSection || !selectedDate) return;

    setLoading(true);

    readStudentRegister({
      date: selectedDate,
      section: selectedSection,
    })
      .then((register) => {
        log('register received values', { register });
        const registerMap = register.reduce((acc, { id, type, value }) => {
          const rec = acc[id] || { id };
          rec[type] = { value, orig: value };
          acc[id] = rec;
          return acc;
        }, {});
        log('useEffect [selectedDate, selectedSection, students]', {
          registerMap,
        });
        const selected = students
          .filter(({ section }) => section === selectedSection)
          .map((s) => ({
            ...s,
            ...registerMap[s.id],
          }));
        log(
          'useEffect [selectedDate, selectedSection, students] student register loaded',
          {
            selectedDate,
            selectedSection,
            selected,
            students,
          }
        );
        setSelectedStudents(selected);
      })
      .catch((err) => {
        store.dispatch('setError', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDate, selectedSection, students]);

  const modified = useMemo(() => {
    log('useMemo called for calculating modified', {
      selectedStudents,
    });
    const mods = selectedStudents.some(
      (s) => s[scoreType] && s[scoreType].value !== s[scoreType].orig
    );
    log('useMemo calculated mods:', mods);
    return mods;
  }, [selectedStudents, scoreType]);

  const onChange = useCallback(
    (value, name) => {
      const setStudentValue = (student) => {
        student[scoreType] = student[scoreType] || {};
        student[scoreType].value = value;
      };

      log('main.jsx > onChange', { value, name, scoreType, selectedSection });
      const copyStudents = selectedStudents.slice();
      if (name) {
        const student = copyStudents.find((s) => s.name === name);
        setStudentValue(student);
      } else {
        copyStudents.forEach(setStudentValue);
      }
      log('modified copy students', { selectedStudents, copyStudents });
      setSelectedStudents(copyStudents);
    },
    [selectedStudents, selectedSection, scoreType]
  );

  const onSave = useCallback(() => {
    if (!modified) return;
    setLoading(true);
    const date = selectedDate;
    const modifiedStudents = selectedStudents.filter(
      (s) => s[scoreType] && s[scoreType].value !== s[scoreType].orig
    );
    log('saving data:', { scoreType, date, selectedSection, modifiedStudents });
    writeStudentRegister({
      students: modifiedStudents,
      date,
      section: selectedSection,
      type: scoreType,
      user: user.email.split('@')[0],
    })
      .then(() => {
        modifiedStudents.forEach((s) => {
          s[scoreType].orig = s[scoreType].value;
        });
        setSelectedStudents([...selectedStudents]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          'Error saving data',
          { scoreType, selectedDate, selectedSection, selectedStudents },
          err
        );
        store.dispatch('setError', err);
        setLoading(false);
      });
  }, [selectedDate, selectedStudents, modified]);

  const onCancel = useCallback(() => {
    const restoredStudents = selectedStudents.map((s) => {
      if (scoreType in s) s[scoreType].value = s[scoreType].orig;
      return s;
    });
    log('onCancel called with', {
      selectedStudents,
      scoreType,
      restoredStudents,
    });
    setSelectedStudents([...restoredStudents]);
  }, [selectedStudents, scoreType]);

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
            onStudentInfo={setSelectedStudentId}
          />
        ))}
      </Tabs>

      <StudentInfo
        onClosed={() => setSelectedStudentId('')}
        studentId={selectedStudentId}
      />
    </Page>
  );
};
