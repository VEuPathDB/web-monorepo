import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import {
  Unpack,
  constant,
  decode,
  oneOf,
  record,
  string
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { useWdkDependenciesWithStudyAccessApi } from '../shared/wdkDependencyHook';

import {
  Action as DataRestrictionAction,
  ActionAttemptDetails,
  attemptAction,
  label,
  restricted,
  unrestricted,
} from './DataRestrictionActionCreators';

const STUDY_ACTION_CLASS_NAME = 'study-action';

const STUDY_ID_DATA_ATTRIBUTE = 'data-study-id';
const ARGS_DATA_ATTRIBUTE = 'data-args';

export type CompleteApprovalStatus = 'approved' | 'not-approved' | 'study-not-found';

export type ApprovalStatus = CompleteApprovalStatus | 'loading';

/**
 * @param studyId
 * @param action
 * @returns An ApprovalStatus signifying if the user is permitted to
 * perform the specified "action" for the study with id "studyId"
 */
export function useApprovalStatus(studyId: string, action: string) {
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
    'loading'
  );

  const attemptActionTask = useAttemptActionTask(studyId, action);

  useEffect(() => {
    setApprovalStatus('loading');

    return attemptActionTask.run(setApprovalStatus);
  }, [attemptActionTask]);

  return approvalStatus;
}

/**
 * @param studyId
 * @param action
 * @param onApprovalStatusCheckComplete
 * @returns A callback, which, when executed:
 *
 * (1) attempts to perform "action" for the study with "studyId"
 *
 * (2) executes "onApprovalStatusCheckComplete" once the user's permission to
 * perform the action has been checked
 *
 * NOTE: whenever the passed "studyId", "action", or "onApprovalStatusCheckComplete"
 * arguments have changed, or the component which invoked this hook has been unmounted,
 * all pending executions of "onApprovalStatusCheckComplete" will be canceled
 */
export function useScopedAttemptActionCallback(
  studyId: string,
  action: string,
  onApprovalStatusCheckComplete: (
    approvalStatus: CompleteApprovalStatus
  ) => void
) {
  const attemptActionTask = useAttemptActionTask(studyId, action);

  const cancelCbs = useRef<Set<() => void>>(new Set());

  const attemptActionCallback = useCallback(() => {
    const cancelCb = attemptActionTask.run(onApprovalStatusCheckComplete);
    cancelCbs.current.add(cancelCb);
  }, [attemptActionTask, onApprovalStatusCheckComplete]);

  useEffect(
    () => () => {
      for (const cancelCb of cancelCbs.current) {
        cancelCb();
      }

      cancelCbs.current.clear();
    },
    [attemptActionCallback]
  );

  return attemptActionCallback;
}

/**
 * @param studyId
 * @param action
 * @returns A Task which, when run, will:
 * (1) check if the user is permitted to perform "action" for the study with id "studyId"
 * (2) if appropriate, open a Data Restriction modal
 * (3) resolve to the appropriate ApprovalStatus
 */
export function useAttemptActionTask<E>(
  studyId: string,
  action: string
): Task<CompleteApprovalStatus, E> {
  const dispatch = useDispatch();
  const wdkDependencies = useWdkDependenciesWithStudyAccessApi();

  return useMemo(
    () =>
      new Task<DataRestrictionAction, E>(function (fulfill, reject) {
        const attemptAction$ = attemptAction(action, { studyId })(wdkDependencies);

        attemptAction$.then(fulfill, reject);
      }).map((attemptedAction) => {
        if (
          (!unrestricted.isOfType(attemptedAction) &&
            !restricted.isOfType(attemptedAction))
        ) {
          // A study is considered "not found" if:
          // (1) the study DOES NOT exist on the backend
          //     (which can be verified by checking if the attempted redux action
          //      was neither an "unrestricted" nor a "restricted" action)
          // OR
          // (2) the study DOES exist on the backend, but is
          //     marked as "disabled" by the client
          //     (which can be verified by checking if the attemption action's
          //      study is "disabled")
          return 'study-not-found';
        }

        dispatch(attemptedAction);

        if (restricted.isOfType(attemptedAction)) {
          return 'not-approved';
        } else {
          return 'approved';
        }
      }),
    [dispatch, wdkDependencies, action, studyId]
  );
}

export function useAttemptActionCallback() {
  const dispatch = useDispatch();
  const wdkDependencies = useWdkDependenciesWithStudyAccessApi();

  return useCallback(async (
    action: string,
    details: ActionAttemptDetails
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

function makeDataRestrictionCallbacks(actionArgs: ActionArgs, event: MouseEvent): Pick<ActionAttemptDetails, 'onAllow' | 'onDeny'> {
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
