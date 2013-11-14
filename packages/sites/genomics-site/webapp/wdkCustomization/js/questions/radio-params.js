/**
 * Add radio buttons around term and wildcard params
 */

(function() {

  var paramNames = {
    'GeneQuestions.GenesByGoTerm': [
      'go_term',
      'go_wildcard'
    ],

    'GeneQuestions.GenesByInterproDomain': [
      'domain_accession',
      'domain_wildcard'
    ]
  };

  wdk.question.on(Object.keys(paramNames), function($form, name) {
        // get handles on params
    var termWrapper = $form.find('.param-item:has([id^="' + paramNames[name][0] + '"])'),

        wildcardWrapper = $form.find('.param-item:has([id^="' + paramNames[name][1] + '"])'),

        // template for radio input
        radioStr = '<div class="param-radio"><input type="radio" name="active-param"/></div>',

        wildcardValue = wildcardWrapper.find('input[name="value(' + paramNames[name][1] + ')"]').val(),

        nonsenseValue = 'nil',

        inlineSubmit = $form[0].onsubmit;

    $form[0].onsubmit = null;

    // insert radio inputs
    termWrapper.find('.param-control').prepend(radioStr)

    wildcardWrapper.find('.param-control').prepend(radioStr);


    // default term to be selected, unless wildcard has value
    if (wildcardValue && wildcardValue !== nonsenseValue) {
      wildcardWrapper.find('[name="active-param"]').prop('checked', true);
    } else {
      termWrapper.find('[name="active-param"]').prop('checked', true);
    }

    setActive();


    $form

      // attach event handler for radio selection
      .on('click', '.param-item:has([name="active-param"]:not(:checked)), ' +
          '[name="active-param"]', function(e) {
        $(this).find('[name="active-param"]').prop('checked', true);
        setActive();
      })

      // attach submit handler
      .on('submit', function(e) {

        // keep form from submitting radio params so validation doesn't break
        $form.find('[name="active-param"]').prop('disabled', true);

        // add nonsense value to inactive params
        $form.find('.param-item.inactive').find('input').val(nonsenseValue);
        $form.find('.param-item.inactive').find('select')
          .append('<option value="' + nonsenseValue + '"/>').val(nonsenseValue);

        if ('function' === typeof inlineSubmit) {
          inlineSubmit.call(this);
        }
      });

    function setActive() {
      // get selected radio
      var radios = $form.find('[name="active-param"]'),
          selected = radios.filter(':checked');

      radios.parents('.param-item').addClass('inactive');
      selected.parents('.param-item').removeClass('inactive').find('input').focus();
    };

  });
}());
