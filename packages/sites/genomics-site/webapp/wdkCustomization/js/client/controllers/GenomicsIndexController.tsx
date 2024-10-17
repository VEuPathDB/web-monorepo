import { FeaturedTools } from '@veupathdb/web-common/lib/components/homepage/FeaturedTools';
import { WorkshopExercises } from '@veupathdb/web-common/lib/components/homepage/WorkshopExercises';
import React from 'react';

export default function GenomicsIndexController() {
  return (
    <React.Fragment>
      <FeaturedTools />
      <hr />
      <WorkshopExercises />
    </React.Fragment>
  );
}
