import React from "react";
import { Button } from "framework7-react";

import "../css/profile.css";

export function SignInProfile({ signedIn, user, onClick }) {
  return signedIn ? (
    <div className="user-profile" onClick={onClick}>
      <div className="text-block">
        <div className="item-title">{user.name}</div>
        <div className="item-subtitle">{user.email}</div>
      </div>
      <img src={user.image} />
    </div>
  ) : (
    <Button className="user-profile" raised fill text="Sign In" onClick={onClick} />
  );
}
