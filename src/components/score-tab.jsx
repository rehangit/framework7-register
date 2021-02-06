import React from 'react';
import 'framework7-icons';

import '../css/score-tab.css';

import { ListItem, List, Icon, Tab } from 'framework7-react';

import StateGroupButtons from './state-group';
import store from '../js/store';

export default function ScoreTab({
  type,
  scoreType,
  setScoreType,
  scoreLabels,
  onChange,
  selectedStudents,
  selectedSection,
  onStudentInfo,
}) {
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
          .map(({ id, name, section, ...scores }) => {
            const { value, orig } = (scores && scores[scoreType]) || {};
            const { image } = store.state.studentInfo[id];
            return (
              <ListItem
                key={name}
                style={{ opacity: 1, transition: 'all 1s ease' }}
              >
                <div
                  className="title"
                  slot="title"
                  onClick={() => {
                    console.log('calling onStudentInfo', id);
                    onStudentInfo(id);
                  }}
                >
                  {image ? (
                    <span
                      className="image"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  ) : (
                    <Icon className="image" f7="person" color="gray" />
                  )}
                  <span>{name}</span>
                </div>
                <StateGroupButtons
                  labels={scoreLabels}
                  value={value}
                  isDirty={orig !== value}
                  onChange={(value) => onChange(value, name)}
                />
              </ListItem>
            );
          })}
      </List>
    </Tab>
  );
}
