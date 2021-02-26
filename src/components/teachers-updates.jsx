import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  List,
  ListItem,
  BlockTitle,
  Icon,
  Badge,
  Tab,
  useStore,
  f7,
  SwipeoutActions,
  SwipeoutButton,
  Subnavbar,
  Searchbar,
  Link,
} from 'framework7-react';

import CheckinForm from '../components/checkin';

import { logger } from '../js/utils';
const { log } = logger('teachers-updates');

export default function TeachersUpdates({ newUpdate, checkins, onUpdate, onDelete }) {
  const user = useStore('user');
  const userName = useMemo(() => user?.email.split('@')[0], [user]);

  const defaultCheckin = useCallback(() => {
    return {
      name: user?.name,
      date: new Date().toISOString().slice(0, 10),
      type: '',
      time: new Date().toLocaleTimeString(),
      username: userName || user?.email.split('@')[0] || '',
    };
  }, [user]);

  const [checkin, setCheckin] = useState({});

  const onEdit = (ci) => {
    log('onEdit', ci);
    setCheckin(ci);
    f7.input.scrollIntoView('#top-of-the-list', 200, false, true);
    if (ci.type) setTimeout(() => f7.fab.open('.add-start-end'), 500);
  };

  useEffect(() => {
    if (newUpdate === 0) return;
    onEdit(defaultCheckin());
  }, [newUpdate]);

  return (
    <div>
      <BlockTitle id="top-of-the-list">Recent updates</BlockTitle>
      <List mediaList className="search-list searchbar-found">
        <CheckinForm
          onUpdate={(data) => onUpdate({ ...data, username: userName })}
          checkin={checkin}
        />
        {checkins
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((ci, i) => {
            const color = ci.username === userName ? 'theme' : 'gray';
            const icon = ci.type === 'Start' ? 'arrow_up_circle_fill' : 'arrow_down_circle_fill';

            return (
              <ListItem
                key={i}
                badgeColor={color}
                title={ci.name}
                subtitle={`${ci.type === 'Start' ? 'Started' : 'Ended'} class: ${ci.section}`}
                text={new Date(ci.timestamp).toLocaleString()}
                data-today={new Date(ci.date).toDateString() === new Date().toDateString()}
                swipeout
                onSwipeoutDeleted={() => {
                  onDelete(ci);
                  console.log('[teachers-update] onDelete', ci);
                }}
              >
                <Icon f7={icon} slot="media" size="48" color={color} />
                <div slot="after" style={{ position: 'absolute', right: 0, top: 0 }}>
                  <Badge color={color}>{ci.time.slice(0, 5)}</Badge>
                  <div>{new Date(ci.date).toLocaleDateString()}</div>
                </div>
                {ci.username === userName && (
                  <div>
                    <SwipeoutActions left>
                      <SwipeoutButton color="blue" close onClick={() => onEdit(ci)}>
                        Edit
                      </SwipeoutButton>
                    </SwipeoutActions>
                    <SwipeoutActions right>
                      <SwipeoutButton delete confirmText="Are you sure?">
                        Delete
                      </SwipeoutButton>
                    </SwipeoutActions>
                  </div>
                )}
              </ListItem>
            );
          })}
      </List>
    </div>
  );
}
