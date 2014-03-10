wdk.questionView('GeneQuestions.GenesByBindingSiteFeature', wdk.views.View.extend({

  events: {
    'change #tfbs_name': 'swapTfbsImage'
  },

  didInitialize: function() {
    this.swapTfbsImage();
  },

  swapTfbsImage: function() {
    var newVal = this.$('#tfbs_name').val();
    this.$('#tfbs_image').attr('src', '/a/images/pf_tfbs/' + newVal + '.png');
  }

}));
