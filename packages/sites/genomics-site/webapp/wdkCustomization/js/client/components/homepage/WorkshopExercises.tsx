import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Loading, IconAlt } from 'wdk-client/Components';

import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import { makeVpdbClassNameHelper, useCommunitySiteUrl } from './Utils';

import './WorkshopExercises.scss';

const cx = makeVpdbClassNameHelper('WorkshopExercises');
const cardListCx = makeVpdbClassNameHelper('CardList');
const bgDarkCx = makeVpdbClassNameHelper('BgDark');
const bgWashCx = makeVpdbClassNameHelper('BgWash');

// FIXME This prefix should be added on the "Jekyll side"
const WORKSHOP_EXERCISES_PREFIX = 'https://workshop.eupathdb.org';
const JEKYLL_PDF_PREFIX = 'https://static-content.veupathdb.org//documents';

const WORKSHOP_EXERCISES_URL_SEGMENT = 'workshop_exercises.json';

const FILL_ME_IN = 'FILL ME IN';

type WorkshopExercisesResponseData = {
  cards: CardResponseData[]
};

type CardResponseData = {
  card: string,
  description: string | null,
  links: LinkResponseData[]
};

type LinkResponseData = {
  name: string,
  path: string,
  description: string,
};

type CardMetadata = {
  cardOrder: string[],
  cardEntries: Record<string, CardEntry>
};

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

function useCardMetadata(): CardMetadata | undefined {
  const communitySiteUrl = useCommunitySiteUrl();
  const [ workshopExercisesResponseData, setWorkshopExercisesResponseData ] = useState<WorkshopExercisesResponseData | undefined>(undefined);

  useEffect(() => {
    if (communitySiteUrl != null) {
      (async () => {
        // FIXME Add basic error-handling 
        const response = await fetch(`https://${communitySiteUrl}${WORKSHOP_EXERCISES_URL_SEGMENT}`, { mode: 'cors' });

        // FIXME Validate this JSON using a Decoder
        const responseData = await response.json() as WorkshopExercisesResponseData;

        setWorkshopExercisesResponseData(responseData);
      })();
    }
  }, [ communitySiteUrl ]);

  const cardMetadata = useMemo(
    () => 
      workshopExercisesResponseData &&
      {
        cardOrder: workshopExercisesResponseData.cards.map(({ card }) => card),
        cardEntries: workshopExercisesResponseData.cards.reduce(
          (memo, { card, description, links }) => ({
            ...memo,
            [card]: {
              title: card,
              description: description == null ? FILL_ME_IN : description,
              exercises: links.map(({ name, path, description }) => ({
                title: name,
                url: path,
                description
              }))
            }
          }), 
          {  } as Record<string, CardEntry>
        )
      },
    [ workshopExercisesResponseData ]
  );

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
        <h2>Tutorials and Exercises</h2>
        <a onClick={toggleExpansion} href="#">
          {
            isExpanded 
              ? <>
                  <IconAlt fa="ellipsis-h" />
                  Row view
                </>
              : <>
                  <IconAlt fa="th" />
                  Grid view
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
    <h3>{entry.title}</h3>
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
              { 
              exercise.url.includes("/")
              ? <>
                  <a href={`${WORKSHOP_EXERCISES_PREFIX}/${exercise.url}`} target="_blank" className={cardListCx('ItemContentLink')}>{exercise.title}</a>
                </>
              : <>
                  <a href={`${JEKYLL_PDF_PREFIX}/${exercise.url}`} target="_blank" className={cardListCx('ItemContentLink')}>{exercise.title}</a>
                </>
              } 
            </li>
        )
      }
      </ul>
    </div>
  </div>;
