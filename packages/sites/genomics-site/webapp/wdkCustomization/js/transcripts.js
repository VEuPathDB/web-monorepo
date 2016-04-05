wdk.namespace('eupathdb.transcripts', function(ns, $) {

  var GENE_TRANSCRIPT_MATCH_FILTER_EXPANDED_KEY = "eupathdb::gene_transcript_match_filter_expanded";

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




  /**
   * BOOLEAN STEP FILTER
   *
   * @param {ClickEvent} event
   * @param {Number} count Recursive invocation count used for retry logic.
   */
  function initializeGeneBooleanFilter(event) {
    // using $ in a var name is convention to indicate it is a jquery object and we can apply jquery methods without using parenthesis
    var $filter = $(event.target).find('.gene-boolean-filter');

    // get expand state of controls
    var expand = wdk.user.getPreference(GENE_TRANSCRIPT_MATCH_FILTER_EXPANDED_KEY, false);

    // expand filter controls if expanded is true
    toggleGeneBooleanFilterExpansion($filter, expand);

    // when user clicks on "Explore"
    $filter.on('click', '.gene-boolean-filter-controls-toggle', function(e) {
      e.preventDefault();
      expand = !expand;
      wdk.user.setPreference(GENE_TRANSCRIPT_MATCH_FILTER_EXPANDED_KEY, expand);
      toggleGeneBooleanFilterExpansion($filter, expand);
    });

    loadGeneBooleanFilter($filter);
  }

  function loadGeneBooleanFilter($filter, count) {
    count = count || 0;
    // example of data:  { step=103340140,  filter="gene_boolean_filter_array"}
    var data = $filter.data();
    $filter
      .find('.gene-boolean-filter-summary')
      .load('getFilterSummary.do', data, function(response, status) {

        // FIXME Remove before release
        // retry once, for some fault tolerance
        if (status == 'error' && count < 1) {
          loadGeneBooleanFilter(event, ++count);
          return;
        }

        // if either one YN/NY/NN is > 0 we show table
        if (!$filter.find('table').data('display')) {
          return;
        }


        // this shows the warning sentence only; the table has display none, controlled by toggle via class name association
        $filter.css('display', 'block');

	/*
        // icon in transcript tab
        if ( $('i#tr-warning').length == 0 ){
          var warningImageUrl = wdk.webappUrl('images/warningIcon2.png');
          $( 'li#transcript-view a span' ).append( $( "<i id='tr-warning'><img src='" + warningImageUrl + "' style='width:16px;vertical-align:top' title='Some Genes in your combined result have Transcripts that were not returned by one or both of the two input searches.' ></i>") );
        }
	*/

        // store initial checked values as eg: "1101"
        var initialCheckboxesState = checkBooleanBoxesState($filter).trim();

        // when a boolean filter input box is clicked
        $filter.on('click', '#booleanFilter input[type=checkbox]', function(e) {
          // check new state for checkboxes (one has been added or removed) 
          var currChBxState = checkBooleanBoxesState($filter);
          //console.log("initial is: ",initialCheckboxesState," and now it is:", currChBxState);
          // show user its current selection
          $('p#trSelection span').text(currChBxState);

          // if different from initialCheckboxesState, enable Apply button, otherwise disable; set consistent popup message
          if( initialCheckboxesState !=  currChBxState ) {
            $('button.gene-boolean-filter-apply-button').removeProp('disabled');
            $('button.gene-boolean-filter-apply-button').prop('title','If selection is applied, it will change the step results and therefore have an effect on the rest of your strategy.');
          }
          else {
            $('button.gene-boolean-filter-apply-button').prop('disabled', true);
            $('button.gene-boolean-filter-apply-button').prop('title','To enable this button, select/unselect transcript sets.');
          }
        });

        // do not show warning sentence in genes view
        if ( $("div#genes").parent().css('display') != 'none'){
          $("div#genes div.gene-boolean-filter").remove();
        }
      });
  }

  /**
   * @param {jQuery} $filter jQuery container for DOM node
   * @param {Boolean} expand? Optional state. If not provided, the current state will be toggled
   */
  function toggleGeneBooleanFilterExpansion($filter, expand) {
    $filter
      .find('.gene-boolean-filter-controls').toggle(expand)
      .end()
      .find('.gene-boolean-filter-controls-toggle').text(expand ? 'Collapse' : 'Explore');
  }

  // parameter: filter jquery object
  // returns string representing state; eg: if values == [YY,YN,NY,NN] and only NN is unchecked, we return '1110'
  function checkBooleanBoxesState ($filter) {
    var state = '';
    // read table.BooleanFilter checkboxes
    var valuesStr = $filter.find('.gene-boolean-filter-values').html().trim();
    //console.log(valuesStr); //{"values":["YY","YN"]}
    if (valuesStr) {
      var values = JSON.parse(valuesStr);
      //console.log(values);  //["YY", "YN"]
      $filter.find('[name=values]').each(function(index, checkbox) {
        if( checkbox.checked ) state = state + '1';
        else state = state + '0';
        });
      }
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
    // values contains: [["Y", "N"], ["N", "Y"]]
    var values = [].slice.call(form.values)
      .filter(function(el) {
        return el.checked;
      })
      .map(function(el) {
        return el.value.replace(/1/g, 'Y').replace(/0/g, 'N').split('');
      });
    // is there any checked checkbox?  (includes disabled checked checkboxes)
    if(!$.isEmptyObject(values)) {
      console.log(values); // the new selection is: eg: [["Y", "N"], ["N", "N"]]

      // check that we have, among user selections, at least one input > 0
      var trSelected = 0;
      $('#booleanFilter input[type=checkbox]:checked').each(function() {
        trSelected = parseInt(trSelected) + parseInt($(this).attr('amount'));
        //console.log("found one: ", trSelected);
      });
      if(trSelected > 0) {
        //enable inputs, so checked ones are sent in post even if the result was 0
        $("#booleanFilter input[type=checkbox]:checked").each(function() {
              $(this).prop('disabled', false);
        });
        //console.log(values); // the new selection is: eg: [["Y", "N"], ["N", "N"]]
        $.post('applyFilter.do', $form.serialize(), function() {
          ctrl.fetchStrategies(ctrl.updateStrategies);
        });
      }
      else {
        alert("Oops! please select at least one option with a count > 0");
      } 
    }
    else {
      alert("Oops! please select at least one option");
    }
  }


	// ===================================================

	// LEAF STEP FILTER


  function initializeGeneLeafFilter(event) {

    // using $ in a var name is convention to indicate it is a jquery object and we can apply jquery methods without using parenthesis
    var $filter = $(event.target).find('.gene-leaf-filter');

    // get expand state of controls
    var expand = wdk.user.getPreference(GENE_TRANSCRIPT_MATCH_FILTER_EXPANDED_KEY, false);

    // expand filter controls if expanded is true
    toggleGeneLeafFilterExpansion($filter, expand);

    // when user clicks on "Explore"
    $filter.on('click', '.gene-leaf-filter-controls-toggle', function(e) {
        e.preventDefault();
        expand = !expand;
        wdk.user.setPreference(GENE_TRANSCRIPT_MATCH_FILTER_EXPANDED_KEY, expand);
        toggleGeneLeafFilterExpansion($filter, expand);
      });

    // load filter table even if user did not click on "explore", cause we need to show icon
    loadGeneLeafFilter($filter);
  }

  function loadGeneLeafFilter($filter, count) {
    count = count || 0;
    // example of data:  { step=103340140,  filter="matched_transcript_filter_array"}
    var data = $filter.data();
    $filter
      .find('.gene-leaf-filter-summary')
      .load('getFilterSummary.do', data, function(response, status) {

        // FIXME Remove before release
        // retry once, for some fault tolerance
        if (status == 'error' && count < 1) {
          loadGeneLeafFilter($filter, ++count);
        }
        // if N > 0 we show table
        if ($filter.find('table').data('display')) {
          // this shows the warning sentence only; the table has display none, controlled by toggle via class name association
          $filter.css('display', 'block');
	  /*
          // icon in transcript tab
          if ( $('i#tr-warning').length == 0 ){
            var warningImageUrl = wdk.webappUrl('images/warningIcon2.png');
            $( 'li#transcript-view a span' ).append( $( "<i id='tr-warning'><img src='" + warningImageUrl + "' style='width:16px;vertical-align:top' title='Some Genes in your result have Transcripts that did not meet the search criteria.' ></i>") );
          }
	  */
          // store initial checked values as eg: "1101"
          var initialCheckboxesState = checkBoxesState($filter).trim();

          // when a leaf filter input box is clicked
          $filter.on('click', '#leafFilter input[type=checkbox]', function(e) {
            // check new state for checkboxes (one has been added or removed) 
            var currChBxState = checkBoxesState($filter);
            //console.log("initial is: ",initialCheckboxesState," and now it is:", currChBxState);
            // show user its current selection
            $('p#trSelection span').text(currChBxState);

            // if different from initialCheckboxesState, enable Apply button, otherwise disable; set consistent popup message
            if( initialCheckboxesState !=  currChBxState ) {
              $('button.gene-leaf-filter-apply-button').removeProp('disabled');
              $('button.gene-leaf-filter-apply-button').prop('title','If selection is applied, it will change the step results and therefore have an effect on the rest of your strategy.');
            }
            else {
              $('button.gene-leaf-filter-apply-button').prop('disabled', true);
              $('button.gene-leaf-filter-apply-button').prop('title','To enable this button, select/unselect transcript sets.');
            }
          });

          // do not show warning sentence in genes view
          if ( $("div#genes").parent().css('display') != 'none'){
            $("div#genes div.gene-leaf-filter").remove();
          }
        }
      });
  }

  /**
   * @param {jQuery} $filter jQuery container for DOM node
   * @param {Boolean} expand? Optional state. If not provided, the current state will be toggled
   */
  function toggleGeneLeafFilterExpansion($filter, expand) {
    $filter
      .find('.gene-leaf-filter-controls').toggle(expand)
      .end()
      .find('.gene-leaf-filter-controls-toggle').text(expand ? 'Collapse' : 'Explore');
  }

  // parameter: filter jquery object
  // returns string representing state; eg: if values == [Y,N] and only N is unchecked, we return '01'
  function checkBoxesState ($filter) {
    var state = '';
    // read table.LeafFilter checkboxes
    var valuesStr = $filter.find('.gene-leaf-filter-values').html().trim();
    //console.log(valuesStr); //{"values":["Y","N"]}
    if (valuesStr) {
      var values = JSON.parse(valuesStr);
      //console.log(values);  //["Y", "N"]
      $filter.find('[name=values]').each(function(index, checkbox) {
        if( checkbox.checked ) state = state + '1';
        else state = state + '0';
        });
      }
    return state;
  }



  function applyGeneLeafFilter(event) {
    event.preventDefault();
    var ctrl = wdk.strategy.controller;
    var form = event.target;
    var $form = $(form);
    var $filter = $form.parent('.gene-leaf-filter');
    // what for?
    var data = $filter.data();
    // values contains:                                              //[["Y", "N"], ["N", "Y"]]
    var values = [].slice.call(form.values)
      .filter(function(el) {
        return el.checked;
      })
      .map(function(el) {
        return el.value.replace(/1/g, 'Y').replace(/0/g, 'N').split('');
      });
    // is there any checked checkbox?  (includes disabled checked checkboxes)
    if(!$.isEmptyObject(values)) {
      console.log(values); // the new selection is:                  //eg: [["Y", "N"], ["N", "N"]]

      // check that we have, among user selections, at least one input > 0
      var trSelected = 0;
      $('#leafFilter input[type=checkbox]:checked').each(function() {
        trSelected = parseInt(trSelected) + parseInt($(this).attr('amount'));
        //console.log("found one: ", trSelected);
      });
      if(trSelected > 0) {
        //enable inputs, so checked ones are sent in post even if the result was 0
        $("#leafFilter input[type=checkbox]:checked").each(function() {
              $(this).prop('disabled', false);
        });
        //console.log(values);                                      // the new selection is: eg: [["Y", "N"], ["N", "N"]]
        $.post('applyFilter.do', $form.serialize(), function() {
          ctrl.fetchStrategies(ctrl.updateStrategies);
        });
      }
      else {
        alert("Oops! please select at least one option with a count > 0");
      } 
    }
    else {
      alert("Oops! please select at least one option");
    }
  }

	// ===================================================




	// ===============================================


  // check if we have a boolean filter
  $(document).on('wdk-results-loaded', initializeGeneBooleanFilter);
  // when boolean filter form submitted
  $(document).on('submit', '[name=apply-gene-boolean-filter]', applyGeneBooleanFilter);


  $(document).on('wdk-results-loaded', initializeGeneLeafFilter);
  $(document).on('submit', '[name=apply-gene-leaf-filter]', applyGeneLeafFilter);

  ns.openTransform = openTransform;
});
