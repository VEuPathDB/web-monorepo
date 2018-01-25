wdk.namespace('wdk.dataRestriction', (ns, $) => {

  function getIdFromRecordClass (recordClass) {
    if (typeof recordClass !== 'string') return null;
    if (recordClass.length > 13) recordClass = recordClass.slice(0, 13);
    const result = recordClass.match(/^DS_[^_]+/g);
    return result === null
      ? null
      : result[0];
  };

  function emit (action, details) {
    const detail = Object.assign({}, details, { action });
    const event = new CustomEvent('DataRestricted', { detail });
    document.dispatchEvent(event);
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  ns.restrictionController = (element) => {
    const { recordClass } = element.data();
    const studyId = getIdFromRecordClass(recordClass);

    const pagingTables = element.find('.paging-table');
    pagingTables.each((index, table) => ns.pagingController($(table), studyId));

    const downloadButton = element.find('a.step-download-link');
    ns.downloadLinkController(downloadButton, studyId);
  }

  ns.pagingController = (element, studyId) => {
    const handler = (event) => emit('paginate', { studyId, event });
    element.on('click', 'a', handler);
    element.find('input.paging-button')
      .attr('onclick', null)
      .on('click', handler)
      .on('click', function () { wdk.resultsPage.openAdvancedPaging(this); });
  };

  ns.downloadLinkController = (element, studyId) => {
    element.on('click', (event) => {
      emit('download', { studyId, event });
    });
  };

});
