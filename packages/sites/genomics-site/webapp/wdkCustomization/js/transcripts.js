wdk.namespace('eupathdb.transcripts', function(ns, $) {

  // was used for leaf step, still available in Add Step
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

  // BOOLEAN STEP FILTER
  function loadGeneBooleanFilter(event) {

    // using $ in a var name is convention to indicate it is a jquery object and we can apply jquery methods without using parenthesis
    var $filter = $(event.target).find('.gene-boolean-filter');
    // when user clicks on "Explore"
    $filter.on('click', '.gene-boolean-filter-controls-toggle', function(e) {
        e.preventDefault();
        $filter.find('.gene-boolean-filter-controls').toggle(400);
        if ( $('a.gene-boolean-filter-controls-toggle').text() === 'Collapse' ) {
          $('a.gene-boolean-filter-controls-toggle').text('Explore');
        }
        else {
          $('a.gene-boolean-filter-controls-toggle').text('Collapse');
        };
      });
    // load filter table even if user did not click on "explore", cause we need to show icon
    reallyLoadGeneBooleanFilter($filter);
  }

  function reallyLoadGeneBooleanFilter($filter, count) {
    count = count || 0;
    // example of data:  { step=103340140,  filter="gene_boolean_filter_array"}
    var data = $filter.data();
    $filter
      .find('.gene-boolean-filter-summary')
      .load('getFilterSummary.do', data, function(response, status) {

        // FIXME Remove before release
        // retry once, for some fault tolerance
        if (status == 'error' && count < 1) {
          reallyLoadGeneBooleanFilter($filter, ++count);
        }
        // if either one YN/NY/NN is > 0 we show table
        if ($filter.find('table').data('display')) {
          // this shows the warning sentence only; the table has display none, controlled by toggle via class name association
          $filter.css('display', 'block');
          // icon in tab
          if ( $("i#tr-warning").length == 0 ){
            $( "li#transcript-view a span" ).append( $( "<i id='tr-warning'><img src='/a/images/warningIcon2.png' style='width:16px;vertical-align:top' title='Some Genes in your result have Transcripts that do not meet the search criteria.' ></i>") );
          }
          // store initial checked values
					// use checkBoxState()
          var initialCheckboxState = "1101";

          // when boolean filter input boxes clicked
          $filter.on('click', '#booleanFilter input[type=checkbox]', function(e) {
						// check new state for checkboxes (one has been added or removed) 
            // if different from initialCheckboxState, enable						
            $("button.gene-boolean-filter-apply-button").removeAttr("disabled");
            });

          // do not show warning sentence in genes view
          if ( $("div#genes").parent().css('display') != 'none'){
            $("div#genes div.gene-boolean-filter").remove();
          }
        }
      });
  }

  // parameters: filter jquery object
	// returns string representing state (assuming YY,YN,NY,NN) eg:  1101)
  function checkBoxesState ($filter) {
    var state = '';
		// read table.BooleanFilter checkboxes

    return state;
  }

  function applyGeneBooleanFilter(event) {
    event.preventDefault();
    var ctrl = wdk.strategy.controller;
    var form = event.target;
    var $form = $(form);
    var $filter = $form.parent('.gene-boolean-filter');
    // what for?
    var data = $filter.data();
    /*  all filter values YY YN NY NN
      console.log([].slice.call(form.values));
       ["YN", "NY", "NN"]  user selections (disabled or not)
      console.log([].slice.call(form.values).filter(function(el) {
          return el.checked;
        }).map(function(el) {
            return el.value;
          }));
    */
    var values = [].slice.call(form.values)
      .filter(function(el) {
        return el.checked;
      })
      .map(function(el) {
        return el.value.replace(/1/g, 'Y').replace(/0/g, 'N').split('');
      });

    // this includes disabled checked checkboxes, we might want to check that we have among user selections at least one input > 0
    if(!$.isEmptyObject(values)) {
      //enable inputs, so checked ones are sent in post even if the result was 0
      $("form").submit(function() {
          $("input").removeAttr("disabled");
        });
      $.post('applyFilter.do', $form.serialize(), function() {
          ctrl.fetchStrategies(ctrl.updateStrategies);
        });
    } else {
      alert("Oops! please select at least one option");
    }
  }

  // check if we have a boolean filter
  $(document).on('wdk-results-loaded', loadGeneBooleanFilter);
  // when boolean filter form submitted
  $(document).on('submit', '[name=apply-gene-boolean-filter]', applyGeneBooleanFilter);

  // check if we have a leaf filter
  $(document).on('wdk-results-loaded', loadGeneLeafFilter);
  // when leaf filter form submitted
  $(document).on('submit', '[name=apply-gene-leaf-filter]', applyGeneLeafFilter);

  ns.openTransform = openTransform;
});
