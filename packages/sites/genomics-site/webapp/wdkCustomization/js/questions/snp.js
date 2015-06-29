(function($) {
  $(document).on('filterParamDidMount', injectDefaultFilter);

  // Inject a filter to deselect experiment P. reichenowi by default
  // per a request from BB.
  //
  // FIXME Remove this when BB reloads SNPs.
  function injectDefaultFilter(event, filterParam) {
    var $form = $(event.target).closest('form');
    var filterService = filterParam.filterService;

    if ($form.is('.is-revise')) return;
    if (filterService.name !== 'ngsSnp_strain_meta') return;
    if ($('#organism:input').val() !== 'Plasmodium falciparum 3D7') return;

    var field = filterService.fields.find(function(field) {
      return field.term === 'Experiment';
    });

    filterService.getFieldDistribution(field)
      .then(function(distribution) {
        filterService.distributionMap[field.term] = distribution;
        var values = distribution.reduce(function(values, item) {
          if (!item.value.includes('P. reichenowi'))
            values.push(item.value);
          return values;
        }, []);
        filterParam.actions.addFilter(field, values);
      });
  }
}(jQuery));
