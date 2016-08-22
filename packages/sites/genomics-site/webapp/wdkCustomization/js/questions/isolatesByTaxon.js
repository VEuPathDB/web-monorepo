// FIXME Question no longer exists... Determine new question name, if applicable
wdk.question.registerInitializer('IsolateQuestions.IsolateByTaxon', function($form) {
  var MAX_SELECTED = 2000;
  $form.on('submit', function(e) {
    var checkedCount = $form.find('div[id^=strain] input:checked').length;
    if (checkedCount > MAX_SELECTED) {
      var message = 'We\'re sorry.  You cannot currently choose more than ' +
        MAX_SELECTED + ' strains in one step.\n\n'+ 'You have selected ' +
        checkedCount + '.  Please reduce the number and try again.\n\n' +
        'Note: If you do need >' + MAX_SELECTED + ' strains, add another ' +
        'step to your strategy, choose "Isolates By Taxon/Strain" again,\n' +
        'select additional strains, and union the results.';
      alert(message);
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
});
