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

import StateGroupButtons from '../components/state-group';

export default ({
  type,
  scoreType,
  setScoreType,
  scoreLabels,
  onChange,
  selectedStudents,
  selectedSection,
  waiting,
}) => {
  // console.log('Rendering ScoreTab', { type, scoreType, selectedStudents });
  return (
    <Tab
      id={type}
      onTabShow={({ id }) => setScoreType(id)}
      tabActive={scoreType === type}
    >
      <List style={{ pointerEvents: waiting ? 'none' : 'initial' }}>
        <ListItem title="Name" className="header">
          <StateGroupButtons
            labels={scoreLabels}
            slot="after"
            header={true}
            onChange={onChange}
          />
        </ListItem>
        {selectedStudents
          .filter((s) => s.section === selectedSection)
          .map(({ name, value, section, orig }) => (
            <ListItem title={name} key={name}>
              <StateGroupButtons
                labels={scoreLabels}
                value={value}
                isDirty={orig !== value}
                onChange={(value) => onChange(value, name)}
              />
            </ListItem>
          ))}
      </List>
    </Tab>
  );
};
