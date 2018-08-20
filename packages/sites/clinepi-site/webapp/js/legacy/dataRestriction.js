import { getIdFromRecordClassName } from 'Client/App/DataRestriction/DataRestrictionUtils';
import { attemptAction } from 'Client/App/DataRestriction/DataRestrictionActionCreators';

wdk.namespace('wdk.dataRestriction', (ns, $) => {

  ns.restrictionController = (element) => {
    const { recordClass, restrictionType } = element.data();
    const studyId = getIdFromRecordClassName(recordClass);
    const elements = { rawEl: element, jqEl: $(element) };
    console.info('RestrictionController initialized:', { recordClass, restrictionType, elements });

    const isSearchPage = restrictionType && restrictionType === 'search';
    if (isSearchPage) {
      attemptAction('search', { studyId });
    }

    const isResultsPage = element.children('.Results_Div').length !== 0;
    if (isResultsPage) {
      attemptAction('results', { studyId });
    }

    const analysisTiles = element.find('.analysis-selector');
    if (analysisTiles) analysisTiles.each((index, tile) => {
      ns.analysisTileController($(tile), studyId)
    });

    const pagingTables = element.children('.paging-table');
    if (pagingTables) pagingTables.each((index, table) => {
      ns.pagingController($(table), studyId)
    });

    const downloadResultLink = element.find('a.step-download-link');
    if (downloadResultLink) ns.downloadLinkController(downloadResultLink, studyId);

  };

  ns.analysisTileController = (element, studyId) => {
    element.on('click', makeHandler('analysis', studyId));
  };

  ns.pagingController = (element, studyId) => {
    element.on('click', makeHandler('paginate', studyId));
    // Remove inline onclick handler and replace with jquery handler.
    // Rely on ordering and event.stopImmediatePropagation.
    element.find('input.paging-button')
      .attr('onclick', null)
      .on('click', makeHandler('paginate', studyId))
      .on('click', event => wdk.resultsPage.openAdvancedPaging(event.currentTarget))
  };

  ns.downloadLinkController = (element, studyId) => {
    element.on('click', makeHandler('download', studyId));
  };

  function makeHandler(action, studyId) {
    // Create a jquery event handler. The param `isHandled` is an extra param
    // that jquery allows. This allows this function to determine if the click
    // event was already handled.
    return function handle(event, isHandled) {
      if (isHandled) return;

      const onSuccess = () => $(event.currentTarget).trigger(event.type, [ true ]);
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
      ebrc.context.dispatchAction(attemptAction(action, { studyId, onSuccess }));
    }
  }

});
