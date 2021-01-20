import React from 'react';
import 'framework7-icons';

import { serialToDate } from '../js/utils';

import {
  Page,
  Block,
  Navbar,
  Popup,
  NavRight,
  Link,
  f7,
} from 'framework7-react';

export default ({ student, onClosed }) => {
  const [opened, setOpened] = React.useState(false);
  React.useEffect(() => {
    if (student && student.length > 1) {
      console.log('[popup] opening popup due to data received', { student });
      f7.popup.open('.student-info-popup');
    }
  }, [student]);
  return (
    student &&
    student.length > 1 && (
      <Popup
        swipeToClose
        className="student-info-popup"
        onPopupClosed={onClosed}
      >
        <Page>
          <Navbar title={`${student[1][1]} ${student[1][2]}`}>
            <NavRight>
              <Link popupClose>Close</Link>
            </NavRight>
          </Navbar>
          <Block>
            <table className="student-info">
              <tbody>
                {student[0].map((h, i) => {
                  const value = student[1][i];
                  const formatted = h.match(/date/gi)
                    ? serialToDate(value).toLocaleDateString()
                    : typeof value === 'number'
                    ? value.toFixed(2)
                    : typeof value === 'boolean'
                    ? value
                      ? 'TRUE'
                      : 'FALSE'
                    : value === undefined
                    ? ''
                    : value.toString();
                  return (
                    <tr key={i}>
                      <th>{h}</th>
                      <td>{formatted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Block>
        </Page>
      </Popup>
    )
  );
};
