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

const serialToDate = serial => new Date(Math.floor(serial - 25569) * 86400 * 1000);
const dateToSerial = date => (date - new Date("1900-01-01")) / (1000 * 3600 * 24);

export default ({ data, user, onProfile }) => {
  const [selectedSection, setSelectedSection] = React.useState("B3");
  const [date, setDate] = React.useState(new Date());
  const [students, setStudents] = React.useState([]);
  const [modified, setModified] = React.useState(false);
  const [scoreType, setScoreType] = React.useState("attendance");

  React.useEffect(() => {
    if (modified) return;
    const dateSerial = Math.floor(dateToSerial(date));
    const sdata = data.map(d => {
      const { name, section } = d;
      const score = d[dateSerial];
      const origScore = d[dateSerial];
      return { name, section, score, origScore };
    });
    setStudents(sdata);
    setModified(false);
  }, [data, date, modified]);

  const onChange = React.useCallback(
    (value, name) => {
      console.log("onChange", value, name, selectedSection);
      if (name) {
        const index = students.findIndex(s => s.name === name);
        students[index].score = value;
      } else {
        for (let i = 0; i < students.length; i++) {
          if (students[i].section === selectedSection) students[i].score = value;
        }
      }
      setStudents(students.slice());
      setModified(true);
    },
    [students, selectedSection]
  );

  const name = f7 && f7.params.name;

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
        />
        <ListInput
          type="select"
          label="Class"
          defaultValue={selectedSection}
          outline
          onChange={e => setSelectedSection(e.target.value)}
          disabled={modified}
        >
          {["B1", "B2", "B3", "B4", "G1", "G2", "G3", "G4"].map(name => (
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
          .map(({ name, score, section, origScore }) => (
            <ListItem title={name} key={name}>
              <Icon slot="media" f7="person"></Icon>
              <StateGroupButtons
                labels="PLA"
                value={score}
                isDirty={origScore !== score}
                onChange={value => onChange(value, name)}
              />
            </ListItem>
          ))}
      </List>
      <Toolbar hidden={modified} labels tabber bottom>
        <Link>Attendance</Link>
        <Link>Behaviour</Link>
        <Link>Learning</Link>
      </Toolbar>
      <Toolbar className="button-bar" hidden={!modified} bottom>
        <Button raised fill color="red" onClick={() => setModified(false)}>
          Cancel
        </Button>
        <Button raised fill color="green">
          Save
        </Button>
      </Toolbar>
    </Page>
  );
};
