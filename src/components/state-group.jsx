import React from "react";
import { Segmented, Button } from "framework7-react";

import "../css/state-group.css";

export default ({ labels, onChange, value, slot, header }) => {
  // const [active, setActive] = React.useState(value);
  return (
    <Segmented raised className="state-group" slot={slot}>
      {labels.split("").map((label, i) => (
        <Button
          key={i}
          active={value === label || header}
          onClick={() => {
            onChange(label);
          }}
          className={label}
        >
          {label}
        </Button>
      ))}
    </Segmented>
  );
};
