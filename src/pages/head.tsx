import React from 'react';
import { Helmet } from 'react-helmet';

export default () => (
  <div className="application">
    <Helmet>
      <meta charSet="utf-8" />
      <title>Fast Reader</title>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
      />
    </Helmet>
  </div>
);
