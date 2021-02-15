import React from 'react';
import { Block, BlockHeader, Icon } from 'framework7-react';

import { logger } from '../js/utils';
const { log } = logger('teachers-attendance-chartjs');

const nextDate = (d) => new Date(d.valueOf() + 24 * 3600 * 1000);

const sections = ['B1', 'B2', 'B3', 'B4', 'G1', 'G2', 'G3', 'G4', 'W1', 'W2'];
const sectionDays = {
  B1: '1234',
  B2: '1234',
  B3: '1234',
  B4: '123',
  G1: '1234',
  G2: '1234',
  G3: '1234',
  G4: '123',
  W1: '60',
  W2: '60',
};
export default function TeachersAttendanceChart({ checkins: teachersRecords }) {
  const data = React.useMemo(() => {
    if (!teachersRecords || !teachersRecords.length) return {};
    const groups = teachersRecords.reduce((acc, g) => {
      const { date, section } = g;
      acc[date] = acc[date] || {};
      acc[date][section] = acc[date][section] || '';
      acc[date][section] = acc[date][section] + g.type;
      return acc;
    }, {});
    log('nested', groups);
    return groups;
  }, [teachersRecords]);

  const sortedDates = Object.keys(data).sort();
  const dateRange = [sortedDates[0], sortedDates.slice(-1)[0]].map((d) => new Date(d));
  const dates = [];
  for (let d = dateRange[0]; d < nextDate(dateRange[1]); d = nextDate(d)) {
    dates.push(d);
  }

  log('teachers records groupby', { dateRange, dates, data });
  return (
    <Block strong>
      <BlockHeader>Teachers Attendance Summary ...</BlockHeader>
      <table className="teachers-updates-table">
        <thead>
          <tr>
            {['Date', ...sections].map((s) => (
              <th key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => (
            <tr key={d}>
              <td key={0}>
                {[d.toLocaleDateString().slice(0, 5), 'SMTWTFS'[d.getDay()]].join('\t')}
              </td>
              {sections.map((s) => {
                const values = data?.[d.toISOString().slice(0, 10)];
                const value = values?.[s];
                const count = value?.length || 0;
                const icon =
                  {
                    Start: 'arrow_up',
                    End: 'arrow_down',
                    StartEnd: 'arrow_up_arrow_down',
                    EndStart: 'arrow_up_arrow_down',
                  }[value] ||
                  (values && sectionDays[s].includes(d.getDay()) && 'xmark') ||
                  '';
                return (
                  <td data-count={count} key={s}>
                    <Icon f7={icon} size="small"></Icon>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Block>
  );
}
