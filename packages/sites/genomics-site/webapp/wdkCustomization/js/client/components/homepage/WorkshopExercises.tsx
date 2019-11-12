import React, { useCallback, useEffect, useState } from 'react';

import { Loading } from 'wdk-client/Components';

import { makeVpdbClassNameHelper } from './Utils';
import { MOCK_EXERCISE_METADATA } from './WorkshopExercisesMockConfig';

import './WorkshopExercises.scss';

const cx = makeVpdbClassNameHelper('WorkshopExercises');
const exerciseListCx = makeVpdbClassNameHelper('ExerciseList');

type ExerciseEntry = {
  title: string;
  description: string;
  url: string;
};

export type ExerciseMetadata = {
  exerciseListOrder: string[];
  exerciseEntries: Record<string, ExerciseEntry>;
};

function useExerciseMetadata() {
  const [ exerciseMetadata, setExerciseMetadata ] = useState<ExerciseMetadata | undefined>(undefined);

  useEffect(() => {
    // FIXME: Replace this with "real" logic
    // for loading the featured tool entries
    setTimeout(() => {
      setExerciseMetadata(MOCK_EXERCISE_METADATA);
    }, Math.random() * 1000 + 500);
  }, []);

  return exerciseMetadata;
}

export const WorkshopExercises = () => {
  const exerciseMetadata = useExerciseMetadata();
  // FIXME: For implementor's convenience, the initial "isExpanded" value is "true"
  // It should be set to "false" once styling is stabilized
  const [ isExpanded, setIsExpanded ] = useState(true);

  const toggleExpansion = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  }, [ isExpanded ])

  return (
    <div className={cx()}>
      <h3>Workshop Exercises</h3>
      <a onClick={toggleExpansion} href="#">
        {
          isExpanded 
            ? 'Collapse exercises'
            : 'View all exercises'
        }
      </a>
      {
        !exerciseMetadata 
          ? <Loading />
          : <ExerciseList
              exerciseMetadata={exerciseMetadata}
              isExpanded={isExpanded}
            />
      }
    </div>
  );
};

type ExerciseListProps = {
  exerciseMetadata: ExerciseMetadata;
  isExpanded: boolean;
};

const ExerciseList = ({
  exerciseMetadata: { exerciseListOrder, exerciseEntries },
  isExpanded
}: ExerciseListProps) => 
  <div className={exerciseListCx('', isExpanded && 'expanded')}>
    {exerciseListOrder.map(exerciseListKey => (
      <ExerciseListItem
        key={exerciseListKey}
        entry={exerciseEntries[exerciseListKey]}
      />
    ))}
  </div>;

type ExerciseListItemProps = {
  entry: ExerciseEntry;
};

const ExerciseListItem = ({ entry }: ExerciseListItemProps) => 
  <div className={exerciseListCx('Item')}>
    <a href={entry.url}>
      <h5>{entry.title}</h5>
    </a>
    <div
      dangerouslySetInnerHTML={{
        __html: entry.description
      }}
    />
  </div>;
