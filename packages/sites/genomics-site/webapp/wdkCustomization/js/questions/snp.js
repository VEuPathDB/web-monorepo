(function($) {
  $(document).on('filterParamDidMount', injectDefaultFilter);

  var paramNames = [ 'ngsSnp_strain_meta', 'ngsSnp_strain_meta_a', 'ngsSnp_strain_meta_m', 'snpchip_strain_meta' ];
  var re = /reichenowi/i;

  // Inject a filter to deselect experiment P. reichenowi by default
  // per a request from BB.
  //
  // FIXME Remove this when BB reloads SNPs.
  function injectDefaultFilter(event) {
    var $form = $(event.target).closest('form');
    var filterService = $(event.target).data('filterService');

    if ($form.is('.is-revise')) return;
    if (!paramNames.includes(filterService.name)) return;
    if ($('#organism:input').val() !== 'Plasmodium falciparum 3D7') return;

    var field = filterService.fields.find(function(field) {
      return field.term === 'StrainOrLine';
    });

    if (field == null) return;

    filterService.getFieldDistribution(field)
      .then(function(distribution) {
        filterService.distributionMap[field.term] = distribution;
        var values = distribution.reduce(function(values, item) {
          if (!re.test(item.value))
            values.push(item.value);
          return values;
        }, []);

        if (values.length < distribution.length)
          filterParam.actions.addFilter(field, values);
      });
  }
}(jQuery));
