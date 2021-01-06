import React from 'react';
import { Segmented, Button } from 'framework7-react';

import '../css/state-group.css';

export default ({ labels, onChange, value, slot, header, isDirty }) => {
  const classes = ['state-group', isDirty ? 'dirty' : ''].join(' ');
  return (
    <Segmented raised className={classes} slot={slot}>
      {labels.split('').map((label, i) => (
        <Button
          key={i}
          active={(value && value.toString() === label) || header}
          onClick={() => {
            onChange(label);
          }}
          className={`label-${label}`}
          text={label}
        />
      ))}
    </Segmented>
  );
};
