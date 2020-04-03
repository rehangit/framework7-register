import React from "react";
import "framework7-icons";

import "../css/main.css";

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
} from "framework7-react";

import { SignInProfile } from "../components/profile";

import StateGroupButtons from "../components/state-group";

const calendarParams = {
  header: true,
  dateFormat: "DD dd MM yyyy",
  closeOnSelect: true,
  closeByOutsideClick: true,
  closeByBackdropClick: true,
  openIn: "customModal",
  backdrop: true,

  rangesClasses: [
    {
      cssClass: "weekday-madrasah-on",
      range: date => date.getDay() >= 1 && date.getDay() <= 4,
    },
  ],
};

const dateToSerial = date => Math.floor((date - new Date("1900-01-01")) / (1000 * 3600 * 24));

export default ({ getData, getHeaders, user, onProfile, saveData }) => {
  const [names, setNames] = React.useState([]);
  const [dates, setDates] = React.useState([]);

  const [sections, setSections] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [scoreType, setScoreType] = React.useState("Attendance");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedSection, setSelectedSection] = React.useState();

  const [waiting, setWaiting] = React.useState(false);

  const modified = React.useMemo(() => {
    console.log("modified memo");
    const mods = students.reduce((acc, { value, orig }) => acc || value !== orig, false);
    console.log("onChange", { mods });
    return mods;
  }, [students]);

  React.useEffect(() => {
    setWaiting(true);
    getHeaders(scoreType).then(headers => {
      console.log("React.useEffect[user]", headers);

      setNames(headers.names);
      setDates(headers.dates);

      setWaiting(false);
    });
  }, [user]);

  React.useEffect(() => {
    if (!names || !names.length) return;
    const sectionsSet = names.reduce((acc, { section }) => {
      acc.add(section);
      return acc;
    }, new Set());

    const sections = Array.from(sectionsSet).filter(Boolean);
    setSections(sections);
    setSelectedSection(selectedSection || sections[0]);

    console.log("React.useEffect[names]", { names, sections });
  }, [names]);

  React.useEffect(() => {
    setWaiting(true);

    const serial = dateToSerial(selectedDate);
    const col = 3 + dates.findIndex(d => d === serial);
    const indices = names.reduce((acc, { section }, row) => {
      if (section === selectedSection) {
        acc.push([row, col]);
      }
      return acc;
    }, []);

    getData({ scoreType, indices }).then(data => {
      console.log("React.useEffect [selectedDate, selectedSection]", { data });
      const sdata = data.map(({ index, value }) => ({
        ...names[index],
        index,
        value,
        orig: value,
      }));
      setStudents(sdata);

      setWaiting(false);
      console.log({ sdata });
    });
  }, [selectedDate, selectedSection]);

  const onChange = React.useCallback(
    (value, name) => {
      console.log("onChange", value, name, selectedSection);
      if (name) {
        const index = students.findIndex(s => s.name === name);
        students[index].value = value;
      } else {
        students.forEach((s, i) => {
          if (s.section === selectedSection) {
            students[i].value = value;
          }
        });
      }
      setStudents(students.slice());
    },
    [students, selectedSection]
  );

  const onSave = React.useCallback(() => {
    if (!modified) return;
    setWaiting(true);
    const serial = dateToSerial(selectedDate);
    const colIndex = 3 + dates.findIndex(d => d === serial);
    const values = students.reduce((acc, { index, value, orig }) => {
      if (value != orig) {
        acc.push({ ri: index, ci: colIndex, value });
      }
      return acc;
    }, []);
    console.log("saving data:", { scoreType, date: selectedDate, values });
    saveData({ scoreType, values }).then(() => {
      setStudents(
        students.map((s, i) => {
          s.orig = s.value;
          return s;
        })
      );
      setWaiting(false);
    });
  }, [selectedDate, students, modified]);

  const onCancel = React.useCallback(() => {
    students.forEach((s, i) => {
      students[i].value = s.orig;
    });
    setStudents(students.slice());
  }, [students]);

  const name = (f7 && f7.params.name) || "";

  return (
    <Page>
      <Navbar title={name} innerClass="navbar-inner-spacing">
        <SignInProfile
          user={user}
          onClick={() => {
            console.log("trying to open login screen");
            onProfile(true);
          }}
        />
      </Navbar>
      <List inlineLabels>
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
          defaultValue={selectedSection}
          outline
          onChange={e => setSelectedSection(e.target.value)}
          disabled={modified}
        >
          {sections.map(name => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </ListInput>
      </List>
      <List style={{ pointerEvents: waiting ? "none" : "initial" }}>
        <ListItem title="Name" className="header">
          <StateGroupButtons labels="PLA" slot="after" header={true} onChange={onChange} />
        </ListItem>
        {students
          .filter(s => s.section === selectedSection)
          .map(({ name, value, section, orig }) => (
            <ListItem title={name} key={name}>
              <Icon slot="media" f7="person"></Icon>
              <StateGroupButtons
                labels="PLA"
                value={value}
                isDirty={orig !== value}
                onChange={value => onChange(value, name)}
              />
            </ListItem>
          ))}
      </List>
      <Toolbar hidden={modified} tabbar labels bottom>
        <Link tabLink="#tab-attendance" tabLinkActive>
          Attendance
        </Link>
        <Link tabLink="#tab-behaviour">Behaviour</Link>
        <Link tabLink="#tab-learning">Learning</Link>
      </Toolbar>
      <Toolbar className="button-bar" hidden={!modified} bottom>
        <Button raised fill color="red" onClick={onCancel}>
          Cancel
        </Button>
        <Button raised fill color="green" onClick={onSave}>
          Save
        </Button>
      </Toolbar>
      <Preloader className="loader" style={{ display: waiting ? "block" : "none" }} />
    </Page>
  );
};
