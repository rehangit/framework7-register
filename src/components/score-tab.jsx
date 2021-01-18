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
  Tab,
  Tabs,
  useStore,
} from 'framework7-react';

import StateGroupButtons from './state-group';

export default ({
  type,
  scoreType,
  setScoreType,
  scoreLabels,
  onChange,
  selectedStudents,
  selectedSection,
  onStudentInfo,
}) => {
  const [sortAsc, setSortAsc] = React.useState(true);
  const sortFn = sortAsc
    ? (a, b) => (a.name < b.name ? -1 : 1)
    : (a, b) => (a.name > b.name ? -1 : 1);
  return (
    <Tab
      id={type}
      onTabShow={({ id }) => setScoreType(id)}
      tabActive={scoreType === type}
    >
      <List>
        <ListItem className="header">
          <div slot="title" onClick={() => setSortAsc(!sortAsc)}>
            <span>Name</span>
            <Icon
              className="sort-icon"
              f7={sortAsc ? 'sort_down' : 'sort_up'}
              size="20"
            />
          </div>
          <StateGroupButtons
            labels={scoreLabels}
            slot="after"
            header={true}
            onChange={onChange}
          />
        </ListItem>
        {selectedStudents
          .sort(sortFn)
          .filter((s) => s.section === selectedSection)
          .map(({ name, value, section, orig }) => (
            <ListItem
              key={name}
              style={{ opacity: 1, transition: 'all 1s ease' }}
            >
              <div
                className="title"
                slot="title"
                onClick={() => onStudentInfo({ name, section })}
              >
                <Icon
                  f7="person"
                  size="22"
                  style={{ verticalAlign: 'baseline', marginRight: '8px' }}
                />
                <span>{name}</span>
              </div>
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
