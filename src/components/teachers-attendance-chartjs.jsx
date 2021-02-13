import React from 'react';
import { Block, BlockHeader } from 'framework7-react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { getCached, logger } from '../js/utils';
const { log } = logger('teachers-attendance-chartjs');
export default function TeachersAttendanceChart() {
  const [teachersRecords, setTeachersRecords] = React.useState([]);

  React.useEffect(() => {
    getCached('teachers_checkin').then((checkins) => {
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
    const labels = Object.keys(classSets).sort();
    const values = labels.map((l) => classSets[l].size);
    return { labels, values, earliest };
  }, [teachersRecords]);

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
        Teachers updates since: {(earliest && new Date(earliest).toLocaleDateString()) || '...'}
      </BlockHeader>
      <Bar width={100} height={40} data={data} options={options} />
    </Block>
  );
}
