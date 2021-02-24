import React from 'react';
import { Block, BlockHeader, Progressbar, useStore } from 'framework7-react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { getCached, logger } from '../js/utils';
import { getTeachersCheckins } from '../data/sheets';
const { log } = logger('teachers-attendance-chartjs');
export default function TeachersAttendanceChart() {
  const [teachersRecords, setTeachersRecords] = React.useState([]);
  const sections = useStore('sections');

  React.useEffect(() => {
    getCached('teachers_checkin', 1 * 60 * 1000, getTeachersCheckins).then((checkins) => {
      setTeachersRecords(checkins);
    });
  }, []);

  const { labels = [], values = [], earliest = '' } = React.useMemo(() => {
    if (!teachersRecords || !teachersRecords.length) return {};

    log('recalculating chart values', { teachersRecords });
    let earliest;
    const classSets =
      (teachersRecords &&
        teachersRecords.reduce((acc, { section, date }) => {
          const sec = section.toUpperCase();
          acc[sec] = acc[sec] || new Set();
          acc[sec].add(date);
          earliest = earliest && earliest < date ? earliest : date;
          return acc;
        }, {})) ||
      {};
    const labels = sections;
    const values = labels.map((l) => classSets[l]?.size || 0);
    return { labels, values, earliest };
  }, [teachersRecords, sections]);

  log('chartjs labels and values', { labels, values, length: teachersRecords?.length });
  const colors = {
    B: 'dodgerblue',
    G: 'indianred',
    W: 'limegreen',
  };

  const options = {
    legend: { display: false },
    scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
    plugins: [ChartDataLabels],
  };

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((label) => colors[label[0]]),
        datalabels: { color: 'white', anchor: 'end', align: 'bottom' },
      },
    ],
  };

  return (
    <Block strong>
      <BlockHeader>
        Teachers updates {earliest ? `since ${new Date(earliest).toLocaleDateString()}` : '...'}
      </BlockHeader>
      {values && values.length ? (
        <Bar width={100} height={40} data={data} options={options} />
      ) : (
        <Progressbar infinite color="multi" />
      )}
    </Block>
  );
}
