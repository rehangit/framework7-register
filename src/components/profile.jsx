import React from 'react';
import { useStore, Card, f7, Link, CardContent } from 'framework7-react';
import { logger } from '../js/utils';
import store from '../js/store';
const { log } = logger('profile.jsx');

export default ({}) => {
  const version = useStore('userVersion');
  const user = React.useMemo(() => store.getters.user?.value || {}, [version]);
  return (
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
  );
};
