import React from "react";
import "framework7-icons";

import {
  App,
  View,
  Page,
  Navbar,
  Block,
  BlockTitle,
  ListItem,
  List,
  ListView,
  ListInput,
  Icon,
  Button,
  Input,
  Row,
  Col,
  Toolbar,
  Link,
  Segmented,
} from "framework7-react";

import StateGroupButtons from "../components/state-group";

const calendarParams = {
  header: true,
  dateFormat: "DD dd MM yyyy",
  closeOnSelect: true,
  openIn: "customModal",
  rangesClasses: [
    {
      cssClass: "weekday-madrasah-on",
      range: date => date.getDay() >= 1 && date.getDay() <= 4,
    },
  ],
};

const serialToDate = serial => new Date(Math.floor(serial - 25569) * 86400 * 1000);
const dateToSerial = date => (date - new Date("1900-01-01")) / (1000 * 3600 * 24);

export default ({ data }) => {
  const [selectedSection, setSelectedSection] = React.useState("B3");
  const [date, setDate] = React.useState(new Date());

  const sdata = React.use(() => {
    const dateSerial = Math.floor(dateToSerial(date));
    return data.map(d => {
      const { name, section } = d;
      const attendance = d[dateSerial];
      return { name, section, attendance };
    });
  }, [date]);
  console.log({ sdata });

  const [students, setStudents] = React.useState(sdata);

  console.log({ students });
  const onChange = React.useCallback(
    (value, name) => {
      console.log("onChange", value, name);
      if (name) {
        const index = students.findIndex(s => s.name === name);
        students[index].attendance = value;
      } else {
        for (let i = 0; i < students.length; i++) {
          students[i].attendance = value;
        }
      }
      setStudents(students.slice());
    },
    [students]
  );

  return (
    <Page>
      <List inlineLabels noHairlinesMd>
        <ListInput
          type="datepicker"
          label="Date"
          value={[date]}
          calendarParams={calendarParams}
          outline
        />
        <ListInput type="select" label="Class" defaultValue={selectedSection} outline>
          {["B1", "B2", "B3", "B4", "G1", "G2", "G3", "G4"].map(name => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </ListInput>
      </List>
      <List>
        <ListItem title="Student" className="header">
          <StateGroupButtons labels="PLA" slot="after" header={true} onChange={onChange} />
        </ListItem>
        {students.map(({ name, attendance }) => (
          <ListItem title={name} key={name}>
            <Icon slot="media" f7="person"></Icon>
            <StateGroupButtons
              labels="PLA"
              value={attendance}
              onChange={value => onChange(value, name)}
            />
          </ListItem>
        ))}
      </List>
      <Toolbar tabber labels position="bottom">
        <Link>Attendance</Link>
        <Link>Behaviour</Link>
        <Link>Learning</Link>
      </Toolbar>
    </Page>
  );
};
