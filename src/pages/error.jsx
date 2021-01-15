import React from 'react';

import store from '../js/store';

import { Page, Navbar, Block, Popup, BlockTitle } from 'framework7-react';
import { useStore } from 'framework7-react';

export default ({}) => {
  const error = useStore('error');
  const clearError = () => store.dispatch('setError', null);

  return (
    <Popup
      opened={error != null ? true : false}
      closeOnEscape
      closeByOutsideClick
      closeOnSelect
      closeByBackdropClick
      onPopupClosed={clearError}
    >
      {error && (
        <Page>
          <Navbar title="Error" backLink onBackClick={clearError} />
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
};
