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
} from 'framework7-react';

import { useStore } from 'framework7-react';

import store from '../js/store';
import ScoreTab from '../components/score-tab.jsx';
// import StudentInfo from '../';

const calendarParams = {
  header: true,
  dateFormat: 'DD dd MM yyyy',
  closeOnSelect: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: 'customModal',
  backdrop: true,
};

import { dateToSerial } from '../js/utils';
import { readStudentRegister, getActiveStudents } from '../data/sheets';
import { logger } from '../js/utils';
const { log } = logger('main');

export default () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scoreType, setScoreType] = useState('Attendance');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSection, setSelectedSection] = useState('');

  const setLoading = (value) =>
    value ? store.dispatch('startLoading') : store.dispatch('endLoading');

  // const userVersion = useStore('userVersion');
  // const user = useMemo(() => store.getters.user.value, [userVersion]);

  // const onStudentInfo = (info) => {
  //   setSelectedStudent(students.find((s) => s.name === info.name));
  // };

  useEffect(() => {
    getActiveStudents().then((activeStudents) => {
      const sectionsSet = new Set();
      activeStudents.forEach(({ section }) => sectionsSet.add(section));
      const sectionsArray = Array.from(sectionsSet).filter(Boolean).sort();
      setSections(sectionsArray);
      setStudents(activeStudents);
      log('students loaded', { activeStudents, sectionsSet, sectionsArray });

      if (!selectedSection) {
        const storedSection = window.localStorage.getItem('selectedSection');
        if (storedSection && sections.includes(storedSection)) {
          setSelectedSection(storedSection);
        } else {
          setSelectedSection(sectionsArray[0]);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSection && sections.includes(selectedSection))
      window.localStorage.setItem('selectedSection', selectedSection);
  }, [selectedSection]);

  useEffect(() => {
    log('Getting student data', { selectedDate, selectedSection, students });
    if (!students || !selectedSection || !selectedDate) return;

    setLoading(true);

    readStudentRegister({
      date: selectedDate,
      section: selectedSection,
    })
      .then((register) => {
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
        setSelectedStudents(selected);
        log(
          'useEffect [selectedDate, selectedSection, students] student register loaded',
          {
            selectedDate,
            selectedSection,
            selected,
          }
        );
        setLoading(false);
      })
      .catch((err) => {
        store.dispatch('setError', err);
        setLoading(false);
      });
  }, [selectedDate, selectedSection, students]);

  // useEffect(() => {
  //   setLoading(true);
  //   getData({ scoreType: 'source', indices: ranges }).then((data) => {
  //     log('Received student data from source', {
  //       rowIndex,
  //       ranges,
  //       data,
  //     });
  //     setUserData([scoreHeaders.Source.dates, data.map((d) => d.value)]);
  //     setLoading(false);
  //   });
  // }, [selectedStudent]);

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
          />
        ))}
      </Tabs>

      {/* <StudentInfo
        onClosed={() => {
          log('closing the pop up and set user data to empty array');
          setSelectedStudent('');
        }}
        student={userData}
      /> */}
    </Page>
  );
};
