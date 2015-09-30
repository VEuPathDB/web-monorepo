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
    $filter.on('click', '.gene-boolean-filter-controls-toggle', function(e) {
      e.preventDefault();
      $filter.find('.gene-boolean-filter-controls').toggle(400);
    });
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
          // icon in tab
          if ( $("i#tr-warning").length == 0 ){
            $( "li#transcript-view a span" ).append( $( "<i id='tr-warning' style='color: #0039FF;' title='This combined result contains transcripts that were not returned by one of the two input searches.' class='fa fa-lg fa-exclamation-circle'></i>" ) );
          }
          // do not show warning sentence in genes view
          if ( $("div#genes").parent().css('display') != 'none'){
            $("div#genes div.gene-boolean-filter").remove();
          } else {
            // if only transcripts in one option no need for checkboxes
            if ($("div.gene-boolean-filter table tr").length === 1) {
              $("div.gene-boolean-filter button").remove();
              $("div.gene-boolean-filter table input").remove();
            }
          }
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
    if(!$.isEmptyObject(values)) {
      $.post('applyFilter.do', $form.serialize(), function() {
          ctrl.fetchStrategies(ctrl.updateStrategies);
        });
    } else {
      alert("Oops! please select at least one option");
    }
  }

  $(document).on('submit', '[name=apply-gene-boolean-filter]', applyGeneBooleanFilter);
  $(document).on('wdk-results-loaded', loadGeneBooleanFilter);
  ns.openTransform = openTransform;
});
