/**
 * Add radio buttons around term and wildcard params
 */

function makeRadioParamsInitializer(options) {
  if (options.termName === null || options.wildcardName === null) {
    throw new Error('The "termName" and "wildcardName" properties must be specified.');
  }

  return function radioParamsInitializer($form) {
    var radioStr = '<div class="param-radio"><input type="radio" name="active-param"/></div>';
    var nonsenseValue = 'N/A';

    var termWrapper = $form.find('.param-item:has([name="' +
      options.termName + '"])');

    var wildcardWrapper = $form.find('.param-item:has([name="' +
      options.wildcardName + '"])');

    var wildcardValue = wildcardWrapper.find('input[name="value(' +
      options.wildcardName + ')"]').val();

    termWrapper.find('.param-control').prepend(radioStr);
    wildcardWrapper.find('.param-control').prepend(radioStr);

    var nonsenseValueR = new RegExp('^(nil|' + nonsenseValue + ')$', 'i');

    // default term to be selected, unless wildcard has value
    if (wildcardValue && !nonsenseValueR.test(wildcardValue.trim())) {
      wildcardWrapper.find('[name="active-param"]').prop('checked', true);
    } else {
      termWrapper.find('[name="active-param"]').prop('checked', true);
    }

    setActive();

    $form.on('click', '.param-item:has([name="active-param"]:not(:checked))', handleClick);
    $form.on('click', '[name="active-param"]', handleClick)
    $form.on('submit', handleSubmit);

    function setActive() {
      // get selected radio
      var radios = $form.find('[name="active-param"]'),
          checked = radios.filter(':checked');

      radios.parents('.param-item').addClass('inactive');
      checked.parents('.param-item').removeClass('inactive');
    }

    function handleClick(e) {
      var target = e.currentTarget;
      var paramItem = $(target).closest('.param-item');
      // check the .active-param radio for this param
      paramItem.find('[name="active-param"]').prop('checked', true);
      paramItem.find('input:not(:radio)').focus().select();
      setActive();
    }

    function handleSubmit() {
      // add "empty" value to inactive params
      $form.find('.param-item.inactive').find('input').val(nonsenseValue);
      $form.find('.param-item.inactive').find('select')
        .append('<option value="' + nonsenseValue + '"/>').val(nonsenseValue);
    }
  }
}

wdk.question.registerInitializer('GeneQuestions.GenesByGoTerm', makeRadioParamsInitializer({
  termName: 'go_typeahead',
  wildcardName: 'go_term'
}));

wdk.question.registerInitializer('GeneQuestions.GenesByEcNumber', makeRadioParamsInitializer({
  termName: 'ec_number_pattern',
  wildcardName: 'ec_wildcard'
}));

wdk.question.registerInitializer('GeneQuestions.GenesByInterproDomain', makeRadioParamsInitializer({
  termName: 'domain_typeahead',
  wildcardName: 'domain_accession'
}));

wdk.question.registerInitializer('GeneQuestions.GenesByMetabolicPathway', makeRadioParamsInitializer({
  termName: 'metabolic_pathway_id_with_genes',
  wildcardName: 'pathway_wildcard'
}));

wdk.question.registerInitializer('CompoundQuestions.CompoundsByPathway', makeRadioParamsInitializer({
  termName: 'metabolic_pathway_id',
  wildcardName: 'pathway_wildcard'
}));

wdk.question.registerInitializer('PathwayQuestions.PathwaysByPathwayID', makeRadioParamsInitializer({
  termName: 'metabolic_pathway_id',
  wildcardName: 'pathway_wildcard'
}));

// FIXME Where did you go, question?
wdk.question.registerInitializer('IsolateQuestions.IsolateByProduct', makeRadioParamsInitializer({
  termName: 'product',
  wildcardName: 'product_wildcard'
}));
