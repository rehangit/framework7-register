import React from "react";
import { Link, f7, theme, Block } from "framework7-react";

import "../css/profile.css";

export function SignInProfile({ user, onClick }) {
  if (!f7 || !f7.params) return null;
  const { navbar } = f7.params;
  const showText = !theme.ios || !navbar.iosCenterTitle;
  return (
    <div className="user-profile" onClick={onClick}>
      {showText ? (
        <div className="text-block">
          <div className="item-title">{user.name}</div>
          <div className="item-subtitle">{user.email}</div>
        </div>
      ) : null}
      <img src={user.image} />
    </div>
  );
}
