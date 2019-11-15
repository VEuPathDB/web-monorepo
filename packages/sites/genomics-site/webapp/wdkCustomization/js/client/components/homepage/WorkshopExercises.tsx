import React, { useCallback, useEffect, useState } from 'react';

import { Loading, IconAlt } from 'wdk-client/Components';

import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import { makeVpdbClassNameHelper } from './Utils';
import { MOCK_EXERCISE_METADATA } from './WorkshopExercisesMockConfig';

import './WorkshopExercises.scss';

const cx = makeVpdbClassNameHelper('WorkshopExercises');
const cardListCx = makeVpdbClassNameHelper('CardList');
const bgDarkCx = makeVpdbClassNameHelper('BgDark');
const bgWashCx = makeVpdbClassNameHelper('BgWash');

type CardEntry = {
  title: string,
  description: string,
  exercises: ExerciseEntry[]
};

type ExerciseEntry = {
  title: string,
  url: string,
  description: string
};

export type CardMetadata = {
  cardOrder: string[],
  cardEntries: Record<string, CardEntry>
};

function useCardMetadata() {
  const [ cardMetadata, setCardMetadata ] = useState<CardMetadata | undefined>(undefined);

  useEffect(() => {
    // FIXME: Replace this with "real" logic
    // for loading the featured tool entries
    setTimeout(() => {
      setCardMetadata(MOCK_EXERCISE_METADATA);
    }, Math.random() * 1000 + 500);
  }, []);

  return cardMetadata;
}

export const WorkshopExercises = () => {
  const cardMetadata = useCardMetadata();
  const [ isExpanded, setIsExpanded ] = useState(false);

  const toggleExpansion = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  }, [ isExpanded ])

  return (
    <div className={cx()}>
      <div className={cx('Header')}>
        <h3>Workshop Exercises</h3>
        <a onClick={toggleExpansion} href="#">
          {
            isExpanded 
              ? <>
                  <IconAlt fa="th" />
                  Expanded view
                </>
              : <>
                  <IconAlt fa="ellipsis-h" />
                  Condensed view
                </>
          }
        </a>
      </div>
      {
        !cardMetadata 
          ? <Loading />
          : <CardList
              cardMetadata={cardMetadata}
              isExpanded={isExpanded}
            />
      }
    </div>
  );
};

type CardListProps = {
  cardMetadata: CardMetadata;
  isExpanded: boolean;
};

const CardList = ({
  cardMetadata: { cardOrder, cardEntries },
  isExpanded
}: CardListProps) => 
  <div className={
    combineClassNames(
      cardListCx('', isExpanded ? 'expanded' : 'collapsed'),
      bgWashCx()
    )
  }>
    {cardOrder.map(
      cardKey => <Card key={cardKey} entry={cardEntries[cardKey]} />
    )}
  </div>;

type CardProps = {
  entry: CardEntry;
};

const Card = ({ entry }: CardProps) => 
  <div className={
    combineClassNames(
      cardListCx('Item'),
      bgDarkCx()
    )
  }>
    <h5>{entry.title}</h5>
    <div className={cardListCx('ItemContent')}>
      <p>{entry.description}</p>
      <ul className="fa-ul">
      {
        entry.exercises.map(
          // FIXME: Dynamically render the exercise content by "taking cue"
          // from exercise.description
          exercise => 
            <li key={exercise.title}>
              <span className="fa-li">
                <IconAlt fa="file-pdf-o" />
              </span>
              <a href={exercise.url} target="_blank" className={cardListCx('ItemContentLink')}>{exercise.title}</a>
            </li>
        )
      }
      </ul>
    </div>
  </div>;
