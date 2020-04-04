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
};

const dateToSerial = date => Math.floor((date - new Date("1900-01-01")) / (1000 * 3600 * 24));

export default ({ getData, getHeaders, user, onProfile, saveData }) => {
  const [students, setStudents] = React.useState([]);
  const [dates, setDates] = React.useState([]);

  const [sections, setSections] = React.useState([]);
  const [selectedStudents, setSelectedStudents] = React.useState([]);
  const [scoreType, setScoreType] = React.useState("Attendance");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedSection, setSelectedSection] = React.useState();

  const [waiting, setWaiting] = React.useState(false);

  const modified = React.useMemo(() => {
    console.log("modified memo");
    const mods = selectedStudents.reduce((acc, { value, orig }) => acc || value !== orig, false);
    console.log("onChange", { mods });
    return mods;
  }, [selectedStudents]);

  React.useEffect(() => {
    if (selectedSection && sections.includes(selectedSection))
      window.localStorage.setItem("selectedSection", selectedSection);
  }, [selectedSection]);

  React.useEffect(() => {
    setWaiting(true);
    getHeaders(scoreType).then(headers => {
      console.log("React.useEffect[user]", headers);

      setStudents(headers.names);
      setDates(headers.dates);

      setWaiting(false);
    });
  }, [user]);

  React.useEffect(() => {
    if (!students || !students.length) return;
    const sectionsSet = students.reduce((acc, { section }) => {
      acc.add(section);
      return acc;
    }, new Set());

    const newSections = Array.from(sectionsSet).filter(Boolean);
    console.log("React.useEffect [students]", { selectedSection, newSections });
    setSections(newSections);

    if (!selectedSection) {
      const storedSelectedSection = window.localStorage.getItem("selectedSection");
      console.log({ storedSelectedSection });
      if (storedSelectedSection && newSections.includes(storedSelectedSection))
        setSelectedSection(storedSelectedSection);
      else {
        setSelectedSection(newSections[0]);
      }
    }

    console.log("React.useEffect [students]", { students, newSections });
  }, [students]);

  React.useEffect(() => {
    setWaiting(true);

    const serial = dateToSerial(selectedDate);
    const col = 3 + dates.findIndex(d => d === serial);
    const indices = students.reduce((acc, { section }, row) => {
      if (section === selectedSection) {
        acc.push([row, col]);
      }
      return acc;
    }, []);

    getData({ scoreType, indices }).then(data => {
      console.log("React.useEffect [selectedDate, selectedSection]", { data });
      const sdata = data.map(({ index, value }) => ({
        ...students[index],
        index,
        value,
        orig: value,
      }));
      setSelectedStudents(sdata);

      setWaiting(false);
      console.log({ sdata });
    });
  }, [selectedDate, selectedSection]);

  const onChange = React.useCallback(
    (value, name) => {
      console.log("onChange", value, name, selectedSection);
      if (name) {
        const index = selectedStudents.findIndex(s => s.name === name);
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
    const colIndex = 3 + dates.findIndex(d => d === serial);
    const values = selectedStudents.reduce((acc, { index, value, orig }) => {
      if (value != orig) {
        acc.push({ ri: index, ci: colIndex, value });
      }
      return acc;
    }, []);
    console.log("saving data:", { scoreType, date: selectedDate, values });
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
          value={selectedSection}
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
        {selectedStudents
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
      <Toolbar hidden={modified} tabbar bottom>
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
