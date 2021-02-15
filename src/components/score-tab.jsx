import React, { useCallback, useMemo } from 'react';
import 'framework7-icons';

import '../css/score-tab.css';

import { ListItem, List, Icon, Tab } from 'framework7-react';

import StateGroupButtons from './state-group';

export default function ScoreTab({
  type,
  scoreType,
  setScoreType,
  scoreLabels,
  onChange,
  selectedStudents,
  onStudentInfo,
}) {
  const [sortAsc, setSortAsc] = React.useState(true);
  const sortFn = useMemo(
    () =>
      sortAsc
        ? (a, b) => (a.fullName < b.fullName ? -1 : 1)
        : (a, b) => (a.fullName > b.fullName ? -1 : 1),
    [sortAsc]
  );
  return (
    <Tab id={type} onTabShow={({ id }) => setScoreType(id)} tabActive={scoreType === type}>
      <List>
        <ListItem className="header">
          <div slot="title" onClick={() => setSortAsc(!sortAsc)}>
            <span>Name</span>
            <Icon className="sort-icon" f7={sortAsc ? 'sort_down' : 'sort_up'} size="20" />
          </div>
          <StateGroupButtons labels={scoreLabels} slot="after" header={true} onChange={onChange} />
        </ListItem>
        {selectedStudents.sort(sortFn).map(({ id, fullName, image, ...rest }) => {
          const score = rest[scoreType];
          const attendance = rest.Attendance;
          const { value, orig } = score || {};
          const disabled = score !== attendance && attendance.value && attendance.value === 'A';
          //console.log('[score-tab] rendering', fullName, attendance, disabled);
          return (
            <ListItem
              key={id}
              style={{ opacity: 1, transition: 'all 1s ease' }}
              disabled={disabled}
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
                  <span className="image" style={{ backgroundImage: `url(${image})` }} />
                ) : (
                  <Icon className="image" f7="person" color="gray" />
                )}
                <span>{fullName}</span>
              </div>
              <StateGroupButtons
                labels={scoreLabels}
                value={value}
                isDirty={orig !== value}
                onChange={(value) => onChange(value, id)}
              />
            </ListItem>
          );
        })}
      </List>
    </Tab>
  );
}
