import React from "react";

import { Page, LoginScreenTitle, Button, BlockFooter, Block, f7 } from "framework7-react";

export default ({ name, onSignIn }) => (
  <Page noToolbar loginScreen>
    <LoginScreenTitle>{name}</LoginScreenTitle>
    <Block inset>
      <Button fill large round onClick={onSignIn}>
        Sign In
      </Button>
    </Block>
    <BlockFooter>Please sign in using your organisation G Suite account</BlockFooter>
  </Page>
);
