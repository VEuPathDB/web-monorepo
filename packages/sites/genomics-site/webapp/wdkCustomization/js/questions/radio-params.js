/**
 * Add radio buttons around term and wildcard params
 */

var RadioParamsView = Backbone.View.extend({

  termName: null,

  wildcardName: null,

  radioStr: '<div class="param-radio"><input type="radio" name="active-param"/></div>',

  nonsenseValue: 'N/A',

  events: {
    'click .param-item:has([name="active-param"]:not(:checked)), [name="active-param"]': 'handleClick',
    'submit': 'submit'
  },

  initialize: function(options) {
    if (this.termName === null || this.wildcardName === null) {
      throw new Error('The "termName" and "wildcardName" properties must be specified.');
    }

    var radioStr = this.radioStr;

    var termWrapper = this.$('.param-item:has([id^="' +
      this.termName + '"])');

    var wildcardWrapper = this.$('.param-item:has([id^="' +
      this.wildcardName + '"])');

    var wildcardValue = wildcardWrapper.find('input[name="value(' +
      this.wildcardName + ')"]').val();

    termWrapper.find('.param-control').prepend(radioStr);
    wildcardWrapper.find('.param-control').prepend(radioStr);

    this.nonsenseValue = this.nonsenseValue;
    var nonsenseValueR = new RegExp('^(nil|' + this.nonsenseValue + ')$', 'i');

    this.inlineSubmit = this.el.onsubmit;
    this.el.onsubmit = null;

    // default term to be selected, unless wildcard has value
    if (wildcardValue && !nonsenseValueR.test(wildcardValue.trim())) {
      wildcardWrapper.find('[name="active-param"]').prop('checked', true);
    } else {
      termWrapper.find('[name="active-param"]').prop('checked', true);
    }

    this.setActive();

  },

  setActive: function() {
    // get selected radio
    var radios = this.$('[name="active-param"]'),
        checked = radios.filter(':checked');

    radios.parents('.param-item').addClass('inactive');
    checked.parents('.param-item').removeClass('inactive');
  },

  handleClick: function(e) {
    var target = e.currentTarget;
    // check the .active-param radio for this param
    $(target).find('[name="active-param"]').prop('checked', true);
    this.setActive();
    $(target).find('input:not(:radio)').focus().select();
  },

  submit: function(e) {
    // keep form from submitting radio params so validation doesn't break
    this.$('[name="active-param"]').prop('disabled', true);

    // add nonsense value to inactive params
    this.$('.param-item.inactive').find('input').val(this.nonsenseValue);
    this.$('.param-item.inactive').find('select')
      .append('<option value="' + this.nonsenseValue + '"/>').val(this.nonsenseValue);

    if ('function' === typeof this.inlineSubmit) {
      this.inlineSubmit.call(this.el);
    }
  }

});

wdk.questionView('GeneQuestions.GenesByGoTerm',  RadioParamsView.extend({
  termName: 'go_typeahead',
  wildcardName: 'go_term',
}));

wdk.questionView('GeneQuestions.GenesByEcNumber', RadioParamsView.extend({
  termName: 'ec_number_pattern',
  wildcardName: 'ec_wildcard'
}));

wdk.questionView('GeneQuestions.GenesByInterproDomain', RadioParamsView.extend({
  termName: 'domain_typeahead',
  wildcardName: 'domain_accession'
}));
