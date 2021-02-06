import React from 'react';

export default function A2HS() {
  const [showA2HS, setShowA2HS] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  addEventListener('beforeinstallprompt', (e) => {
    console.log('Received beforeinstallprompt.');
    e.preventDefault();
    setDeferredPrompt(e);
    setShowA2HS(true);
  });

  const onA2HS = (e) => {
    console.assert(deferredPrompt, 'Error onA2HS called without deferredPrompt');
    setShowA2HS(false);
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  return showA2HS ? (
    <Fab
      position="center-bottom"
      slot="fixed"
      text="Add To Home Screen"
      color="blue"
      className="add-button"
      onClick={onA2HS}
    />
  ) : null;
}
