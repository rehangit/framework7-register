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

export default ({ getData, user, onProfile, saveData }) => {
  const [date, setDate] = React.useState(new Date());
  const [students, setStudents] = React.useState([]);
  const [modified, setModified] = React.useState(false);
  const [sections, setSections] = React.useState([]);
  const [selectedSection, setSelectedSection] = React.useState();
  const [scoreType, setScoreType] = React.useState("Attendance");

  React.useEffect(() => {
    if (modified) return;
    getData({ scoreType, date }).then(data => {
      console.log({ data });
      const sdata = data.map(d => ({ ...d, orig: d.value }));
      setStudents(sdata);
      const secs = Array.from(
        sdata.reduce((acc, { section }) => {
          acc.add(section);
          return acc;
        }, new Set())
      ).filter(Boolean);
      setSections(secs);
      setSelectedSection(selectedSection || secs[0]);
      console.log({ sdata, secs });
    });
  }, [date, modified, user]);

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

      const mods = students.reduce((acc, { value, orig }) => acc || value !== orig, false);
      setModified(mods);
      console.log("onChange", { mods, students });
    },
    [students, selectedSection]
  );

  const onSave = React.useCallback(() => {
    if (!modified) return;
    const values = students.reduce((acc, { id, value, orig }) => {
      if (value != orig) {
        acc.push({ id, value });
      }
      return acc;
    }, []);
    console.log("saving data:", { scoreType, date, values });
    saveData({ scoreType, date, values }).then(() => {
      setModified(false);
    });
  }, [date, students, modified]);

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
          value={[date]}
          calendarParams={calendarParams}
          outline
          disabled={modified}
          onCalendarChange={([newDate]) => setDate(newDate)}
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
      <List>
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
        <Link tabLink="#tab-1" tabLinkActive>
          Attendance
        </Link>
        <Link tabLink="#tab-2">Behaviour</Link>
        <Link tabLink="#tab-3">Learning</Link>
      </Toolbar>
      <Toolbar className="button-bar" hidden={!modified} bottom>
        <Button raised fill color="red" onClick={() => setModified(false)}>
          Cancel
        </Button>
        <Button raised fill color="green" onClick={onSave}>
          Save
        </Button>
      </Toolbar>
    </Page>
  );
};
