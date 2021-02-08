import React, { propTypes, useMemo } from 'react';
import 'framework7-icons';

import { serialToDate } from '../js/utils';

import { Page, Block, Navbar, Popup, NavRight, Link, f7 } from 'framework7-react';
import store from '../js/store';

const StudentInfo = ({ studentId, onClosed }) => {
  const studentInfo = store.state.studentInfo;
  const { id, fullName, parentName, dateOfBirth, dateOfAdmission, parentId, age, image = '' } =
    studentInfo?.[studentId] || {};
  console.log('[StudentInfo]: ', { studentInfo, studentId, id, fullName });

  const imageSrcSet = image ? `${image} 100w, ${image.replace('s100', 's512')} 512w` : '';

  return (
    <Popup className="student-info-popup" opened={!!id}>
      <Page>
        <Navbar title={fullName}>
          <NavRight>
            <Link onClick={onClosed}>Close</Link>
          </NavRight>
        </Navbar>
        <Block>
          <table className="student-info">
            <tbody>
              <tr>
                <td colSpan="2">
                  <img src={image} srcSet={imageSrcSet} width="100%" />
                </td>
              </tr>
              <tr>
                <th>Id</th>
                <td>{id}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{fullName}</td>
              </tr>
              <tr>
                <th>Date of Birth</th>
                <td>
                  {serialToDate(dateOfBirth).toLocaleDateString()} ({Number(age).toFixed(1)} years)
                </td>
              </tr>
              <tr>
                <th>Date of Admission</th>
                <td>{serialToDate(dateOfAdmission).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>Parent Name</th>
                <td>{parentName}</td>
              </tr>
            </tbody>
          </table>
        </Block>
      </Page>
    </Popup>
  );
};

export default StudentInfo;
