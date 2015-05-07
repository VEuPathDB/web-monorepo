wdk.namespace('eupathdb.transcripts', function(ns, $) {

  function openTransform(stepId) {
    var currentStrategyFrontId = wdk.addStepPopup.current_Front_Strategy_Id;
    var strategy = wdk.strategy.model.getStrategy(currentStrategyFrontId);
    var strategyId = strategy.backId;

    wdk.step.isInsert = stepId;

    if(wdk.step.openDetail != null) wdk.step.hideDetails(); 

    var url = "wizard.do?stage=transform&action=add";
    url += "&strategy=" + strategyId + "&step=" + stepId;
    url += "&questionFullName=InternalQuestions.GenesByMissingTranscriptsTransform";

    // display the stage
    wdk.addStepPopup.callWizard(url,null,null,null,'next'); 
  }

  function loadGeneBooleanFilter(event) {
    var $filter = $(event.target).find('.gene-boolean-filter');
    reallyLoadGeneBooleanFilter($filter);
  }

  function reallyLoadGeneBooleanFilter($filter, count) {
    count = count || 0;
    var data = $filter.data();
    $filter
      .find('.gene-boolean-filter-summary')
      .load('getFilterSummary.do', data, function(response, status) {

        // FIXME Remove before release
        // retry once, for some fault tolerance
        if (status == 'error' && count < 1) {
          reallyLoadGeneBooleanFilter($filter, ++count);
        }

        var valuesStr = $filter.find('.gene-boolean-filter-values').html().trim();
        if (valuesStr) {
          var values = JSON.parse(valuesStr);
          $filter.find('[name=values]').each(function(index, checkbox) {
            checkbox.checked = values.values.indexOf(checkbox.value) > -1;
          });
        }
        if ($filter.find('table').data('display')) {
          $filter.css('display', 'block');
          $filter.accordion({
            active: false,
            collapsible: true
          });
        }
      });
  }

  function applyGeneBooleanFilter(event) {
    event.preventDefault();
    var ctrl = wdk.strategy.controller;
    var form = event.target;
    var $form = $(form);
    var $filter = $form.parent('.gene-boolean-filter');
    var data = $filter.data();
    var values = [].slice.call(form.values)
      .filter(function(el) {
        return el.checked;
      })
      .map(function(el) {
        return el.value.replace(/1/g, 'Y').replace(/0/g, 'N').split('');
      });

    $.post('applyFilter.do', $form.serialize(), function() {
      ctrl.fetchStrategies(ctrl.updateStrategies);
    });
  }

  $(document).on('submit', '[name=apply-gene-boolean-filter]', applyGeneBooleanFilter);
  $(document).on('wdk-results-loaded', loadGeneBooleanFilter);
  ns.openTransform = openTransform;
});
