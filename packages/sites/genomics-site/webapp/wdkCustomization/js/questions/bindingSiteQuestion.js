wdk.question.registerInitializer('GeneQuestions.GenesByBindingSiteFeature', function ($form) {
  var $select = $form.find('#tfbs_name');
  var $image = $('#tfbs_image');

  updateImage();
  $select.on('change', updateImage);

  function updateImage() {
    var newVal = $select.val();
    $image.attr('src', '/a/images/pf_tfbs/' + newVal + '.png');
  }
});
