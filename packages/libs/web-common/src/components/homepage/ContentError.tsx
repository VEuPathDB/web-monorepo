import React from 'react';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner'

interface Props {
  message: string;
}

export function ContentError(props: Props) {
  return (
    <Banner banner={{
      type: 'error',
      message: `Content for this section could not be loaded: ${props.message}.`
    }} />
  );
}
