import React from 'react';
import { Page, Navbar, Block, Popup, BlockTitle } from 'framework7-react';
export default ({ error, setError }) => (
  <Popup
    opened={error != null ? true : false}
    closeOnEscape
    closeByOutsideClick
    closeOnSelect
    closeByBackdropClick
    onPopupClosed={() => setError(null)}
  >
    {error && (
      <Page>
        <Navbar title="Error" backLink onBackClick={() => setError(null)} />
        <BlockTitle>{error.name}</BlockTitle>
        <Block>
          <p>{error.toString()}</p>
          <p>{JSON.stringify(error)}</p>
          {error.stack && error.stack.split('\n').map((l) => <p>{l}</p>)}
        </Block>
      </Page>
    )}
  </Popup>
);
