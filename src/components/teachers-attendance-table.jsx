import React from 'react';
import { Block, BlockFooter, BlockTitle, Icon, useStore } from 'framework7-react';

import { logger } from '../js/utils';
const { log } = logger('teachers-attendance-chartjs');

const nextDate = (d) => new Date(d.valueOf() + 24 * 3600 * 1000);

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
  const sections = useStore('sections');
  const data = React.useMemo(() => {
    if (!teachersRecords || !teachersRecords.length) return {};
    const groups = teachersRecords.reduce((acc, g) => {
      const { date, section } = g;
      acc[date] = acc[date] || {};
      acc[date][section] = acc[date][section] || new Set();
      acc[date][section].add(g.type);
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
      <BlockTitle>Updates Summary</BlockTitle>
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
                const value = Array.from(values?.[s] || {});
                const count = value?.length || 0;
                const icon =
                  {
                    Start: 'arrow_up',
                    End: 'arrow_down',
                    StartEnd: 'arrow_up_arrow_down',
                    EndStart: 'arrow_up_arrow_down',
                  }[value?.join('')] ||
                  (values && sectionDays[s].includes(d.getDay()) && 'xmark') ||
                  '';

                //log('rendering cell', d, s, { values, value, count });
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
      <BlockFooter>Legend:</BlockFooter>
      <table width="100%">
        <tbody>
          <tr>
            <td>
              <Icon f7="arrow_up" style={{ color: 'orange' }} size="small" />
            </td>
            <td>Received update for the Start of class</td>
          </tr>
          <tr>
            <td>
              <Icon f7="arrow_down" style={{ color: 'orange' }} size="small" />
            </td>
            <td>Received update for the End of class</td>
          </tr>
          <tr>
            <td>
              <Icon f7="arrow_up_arrow_down" style={{ color: 'green' }} size="small" />
            </td>
            <td>Received update for both Start and End</td>
          </tr>
          <tr>
            <td>
              <Icon f7="xmark" color="red" size="small" />
            </td>
            <td>Update was expected but not received</td>
          </tr>
        </tbody>
      </table>
    </Block>
  );
}
