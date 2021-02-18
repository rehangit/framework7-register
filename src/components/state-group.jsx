import React from 'react';
import { Segmented, Button } from 'framework7-react';

import '../css/state-group.css';

export default function StateGroup({ labels, onChange, value, slot, header, isDirty }) {
  const classes = ['state-group', isDirty ? 'dirty' : '', header && 'header'].join(' ').trim();
  return (
    <Segmented raised className={classes} slot={slot}>
      {labels.split('').map((label, i) => (
        <Button
          key={i}
          active={(value !== undefined && value.toString() === label) || header}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const onchangeParam =
              value !== undefined && value.toString() === label ? undefined : label;
            onChange(onchangeParam);
          }}
          className={`label-${label}`}
          text={label}
        />
      ))}
    </Segmented>
  );
}
