import React from 'react';
export default function Dashboard() {
  const ratio = window.document.body.clientWidth / 750;

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          transform: `scale(${ratio})`,
          transformOrigin: 'top left',
        }}
      >
        <iframe
          width="750"
          height="448"
          seamless
          frameBorder="0"
          scrolling="no"
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vR2H8v7cZNqbiyCLxJjcVqTHSJH2TFJRmhdeoy0Om7pxbt-pBNeBj6BdbaXMBU7lfE8Num6ZCTmyqtn/pubchart?oid=1481300685&amp;format=interactive"
        ></iframe>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'scale(0.5)',
          transformOrigin: 'top right',
        }}
      >
        <iframe
          style={{ position: 'absolute', top: 0, right: 0 }}
          width="195"
          height="122"
          seamless
          frameBorder="0"
          scrolling="no"
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vR2H8v7cZNqbiyCLxJjcVqTHSJH2TFJRmhdeoy0Om7pxbt-pBNeBj6BdbaXMBU7lfE8Num6ZCTmyqtn/pubchart?oid=156398095&amp;format=image"
        ></iframe>
      </div>
    </div>
  );
}
