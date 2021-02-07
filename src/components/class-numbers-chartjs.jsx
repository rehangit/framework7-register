import React from 'react';
import { Block, BlockHeader, useStore } from 'framework7-react';
import { Bar, defaults } from 'react-chartjs-2';

import store from '../js/store';

export default function ClassNumbersBarChart() {
  const students = useStore('studentInfo');
  const { labels, values } = React.useMemo(() => {
    const classCounts =
      (students &&
        Object.values(students).reduce((acc, { class: c }) => {
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {})) ||
      {};
    const labels = Object.keys(classCounts).sort();
    const values = labels.map((l) => classCounts[l]);
    return { labels, values };
  }, [students]);

  console.log('chartjs labels and values', { labels, values });
  const colors = {
    B: 'dodgerblue',
    G: 'indianred',
    W: 'limegreen',
  };

  const options = {
    legend: { display: false },
    scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
  };

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((label) => colors[label[0]]),
      },
    ],
  };

  return (
    <Block strong>
      <BlockHeader>Number of students per class</BlockHeader>
      <Bar width={100} height={40} data={data} options={options} />
    </Block>
  );
}
