import React from 'react';
import {
  useStore,
  Card,
  CardHeader,
  CardFooter,
  f7,
  Link,
  CardContent,
} from 'framework7-react';
import { logger } from '../js/utils';
const { log } = logger('profile.jsx');

export function SignInProfile({}) {
  const user = useStore('user');
  return user && user.email ? (
    <Card className="profile-card">
      <CardContent className="no-border">
        <Link loginScreenOpen="#the-login-screen" panelClose>
          <div>
            <img src={user.image} width="34" height="34" />
          </div>
          <div style={{ marginLeft: '12px' }}>
            <div>{user.name}</div>
            <div style={{ fontSize: 'smaller' }}>{user.email}</div>
          </div>
        </Link>
      </CardContent>
    </Card>
  ) : null;
}
