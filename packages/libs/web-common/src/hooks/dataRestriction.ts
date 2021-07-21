import {
  useCallback,
  useContext,
  useEffect
} from 'react';
import { useDispatch } from 'react-redux';

import {
  WdkDepdendenciesContext
} from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import {
  Unpack,
  constant,
  decode,
  oneOf,
  record,
  string
} from '@veupathdb/wdk-client/lib/Utils/Json';

import { attemptAction, label } from 'ebrc-client/App/DataRestriction/DataRestrictionActionCreators';

const STUDY_ACTION_CLASS_NAME = 'study-action';

const STUDY_ID_DATA_ATTRIBUTE = 'data-study-id';
const ARGS_DATA_ATTRIBUTE = 'data-args';

export function useAttemptActionCallback() {
  const dispatch = useDispatch();
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  if (wdkDependencies == null) {
    throw new Error('In order to "useAttemptActionCallback", WdkDependenciesContext must be provided.');
  }

  return useCallback(async (
    action: string,
    details: {
      studyId: string,
      onAllow?: () => void,
      onDeny?: () => void
    }
  ) => {
    const attemptedAction = await attemptAction(action, details)(wdkDependencies);

    dispatch(attemptedAction);
  }, [ dispatch, wdkDependencies ]);
}

export function useAttemptActionClickHandler() {
  const attemptAction = useAttemptActionCallback();

  useEffect(() => {
    function handleActionButtonClick(event: MouseEvent) {
      if (
        event.target instanceof HTMLButtonElement &&
        event.target.classList.contains(STUDY_ACTION_CLASS_NAME)
      ) {
        const studyId = event.target.getAttribute(STUDY_ID_DATA_ATTRIBUTE);
        const actionArgsStr = event.target.getAttribute(ARGS_DATA_ATTRIBUTE);

        if (studyId == null || actionArgsStr == null) {
          const missingAttributes = [
            !studyId && STUDY_ID_DATA_ATTRIBUTE,
            !actionArgsStr && ARGS_DATA_ATTRIBUTE
          ].filter(x => x);

          const missingAttributesMessage = label(
            `Clicked on a ${STUDY_ACTION_CLASS_NAME} button with the following missing attribute(s): ` +
            missingAttributes.join(', ') +
            '. A Data Restriction action will not be attempted.'
          );

          console.warn(missingAttributesMessage);

          return;
        }

        const parsedActionArgs = decode(actionArgs, actionArgsStr);

        attemptAction(
          parsedActionArgs.type,
          {
            studyId,
            ...makeDataRestrictionCallbacks(parsedActionArgs, event)
          }
        );
      }
    }

    document.addEventListener('click', handleActionButtonClick);

    return () => {
      document.removeEventListener('click', handleActionButtonClick);
    };
  }, [ attemptAction ]);
}

const actionArgs = oneOf(
  record({
    type: constant('download'),
    downloadUrl: string
  })
);

type ActionArgs = Unpack<typeof actionArgs>;

function makeDataRestrictionCallbacks(actionArgs: ActionArgs, event: MouseEvent) {
  switch (actionArgs.type) {
    case 'download': {
      const { ctrlKey } = event;
      const { downloadUrl } = actionArgs;

      return {
        onAllow: () => {
          if (ctrlKey) window.open(downloadUrl, '_blank');
          else window.location.assign(downloadUrl);
        }
      };
    }
  }
}
