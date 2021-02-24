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
              const start = sectionUpdate?.Start || [];
              const end = sectionUpdate?.End || [];
              const startTitle = start?.length > 0 ? `Started by ${start?.[0]?.name}` : '';
              const endTitle = end?.length > 0 ? `Ended by ${start?.[0]?.name}` : '';
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
                  <div slot="title">{startTitle}</div>
                  <div slot="title">{endTitle}</div>
                  <div slot="after" style={{ position: 'absolute', right: 0, top: 0 }}>
                    {start?.[0]?.time ? (
                      <Badge>
                        <Icon f7="arrow_up_circle_fill" size="medium" />
                        {start?.[0]?.time?.slice(0, 5)}
                      </Badge>
                    ) : null}
                    {end?.[0]?.time ? (
                      <Badge>
                        <Icon f7="arrow_down_circle_fill" size="medium" />
                        {end?.[0]?.time?.slice(0, 5)}
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
