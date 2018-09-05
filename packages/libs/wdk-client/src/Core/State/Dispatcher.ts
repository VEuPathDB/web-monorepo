import { Dispatcher } from 'flux';
import { Subject } from 'rxjs';

export default class WdkDispatcher<T> extends Dispatcher<T> {

  /**
   * Actions will be pushed here after they have been handled by registered
   * callbacks. See http://reactivex.io/rxjs/manual/overview.html#subject
   * for more details on what a Subject is, and how they can be treated as
   * Observables.
   */
  private action$: Subject<T> = new Subject();

  /**
   * Call super's dispatch method, then push values into action$ Subject.
   * Doing this here makes it possible for consumers of action$ emit futher
   * actions.
   */
  dispatch(action: T) {
    super.dispatch(action);
    this.action$.next(action);
    return action;
  }

  asObservable() {
    // Only return the Observable functionality of action$.
    // E.g., consumers cannot push actions.
    return this.action$.asObservable();
  }

}
