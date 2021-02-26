import React, { useMemo } from 'react';
import { List, ListItem, Icon, Badge, Tab, useStore, ListGroup } from 'framework7-react';

import { logger } from '../js/utils';
const { log } = logger('teachers-updates');

export default function TeachersUpdatesPerClass({ checkins }) {
  const user = useStore('user');
  const sections = useStore('sections');
  const userName = useMemo(() => user?.email.split('@')[0], [user]);
  const perDate = React.useMemo(() => {
    if (!checkins || !checkins.length) return {};
    const groups = checkins.reduce((acc, g) => {
      const { date, section, type } = g;
      acc[date] = acc[date] || {};
      acc[date][section] = acc[date][section] || {};
      acc[date][section][type] = acc[date][section][type] || [];
      acc[date][section][type].unshift(g);
      return acc;
    }, {});
    log('nested', groups);
    return groups;
  }, [checkins]);

  console.log('[TeachersUpdatesPerClass] perDate', perDate);

  return (
    <List mediaList accordionList className="per-class">
      {Object.keys(perDate).map((d) => {
        const date = new Date(d).toDateString();
        const isToday = date === new Date().toDateString();
        return (
          <ListGroup key={d}>
            <ListItem title={date} groupTitle className={isToday ? 'today' : ''} />
            {sections.map((section) => {
              const sectionUpdate = perDate?.[d]?.[section];
              const start = sectionUpdate?.Start?.[0];
              const end = sectionUpdate?.End?.[0];
              const startTitle = start && `Started by ${start?.name}`;
              const endTitle = end && `Ended by ${end?.name}`;
              const color = {
                B: 'dodgerblue',
                G: 'indianred',
                W: 'limegreen',
              }[section[0]];
              return (
                <ListItem key={section}>
                  <div className="section" slot="media" style={{ backgroundColor: color }}>
                    {section}
                  </div>
                  <div slot="subtitle">{startTitle}</div>
                  <div slot="subtitle">{endTitle}</div>
                  <div slot="after" style={{ position: 'absolute', right: 0, top: 0 }}>
                    {start?.time ? (
                      <Badge>
                        <Icon f7="arrow_up_circle_fill" size="medium" />
                        {start?.time?.slice(0, 5)}
                      </Badge>
                    ) : null}
                    {end?.time ? (
                      <Badge>
                        <Icon f7="arrow_down_circle_fill" size="medium" />
                        {end?.time?.slice(0, 5)}
                      </Badge>
                    ) : null}
                  </div>
                </ListItem>
              );
            })}
          </ListGroup>
        );
      })}
    </List>
  );
}
