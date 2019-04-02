/* global ebrc, wdk */

import { compose } from 'lodash/fp';

import { getIdFromRecordClassName, Action } from 'ebrc-client/App/DataRestriction/DataRestrictionUtils';
import { attemptAction } from 'ebrc-client/App/DataRestriction/DataRestrictionActionCreators';

wdk.namespace('wdk.dataRestriction', (ns, $) => {

  ns.restrictionController = ($element) => {
    const { recordClass, restrictionType } = $element.data();
    const studyId = getIdFromRecordClassName(recordClass);
    const attempt = compose(ebrc.context.store.dispatch, attemptAction);
    console.info('RestrictionController initialized:', { recordClass, restrictionType, $element });

    const isSearchPage = restrictionType && restrictionType === Action.search;
    if (isSearchPage) attempt(Action.search, { studyId });

    // approximate selector for record links
    addHandler(`a[href*="\\/record\\/${studyId}_"]`, 'click', Action.record);

    function addHandler(selector, eventType, action) {
      $element.find(selector).toArray().forEach(function(el) {
        // Add a jquery event handler. The param `isHandled` is an extra param
        // that jquery allows. This allows this function to determine if the click
        // event was already handled.
        $(el).on(eventType, function (event, isHandled) {
          if (!isHandled) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
            attempt(action, { studyId, onSuccess });
          }
        });

        function onSuccess() {
          $(el).trigger(eventType, [true]);
          // FIXME Honor modifiers (ctrl+click => new tab; shift+click => new window)
          if (el.href) window.location.assign(el.href);
        }

        // if there is an on-handler (e.g., onclick attribute), save a reference to
        // it, remove it, and add as a jquery event handler
        const onHandler = el['on' + eventType];
        if (onHandler) {
          $(el).attr('on' + eventType, null).on(eventType, () => {
            onHandler.call(el);
          });
        }
      });
    }

  };

});
