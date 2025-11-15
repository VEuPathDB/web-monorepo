import React from 'react';

import Home from '../App/Home';

interface IndexProps {
  displayName: string;
  webAppUrl: string;
}

/* * Home page for clinepidb sites */
export default function Index(props: IndexProps) {
  return <Home {...props} />;
}
