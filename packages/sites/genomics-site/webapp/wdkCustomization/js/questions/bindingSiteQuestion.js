
$(function() {
	// set the initial description image
	swapTfbsImage();
	// change image when user changes TFBS name
	$('#tfbs_name').click(swapTfbsImage);
});

function swapTfbsImage(){
	var names = $('#tfbs_name')[0];
	var newVal = names.options[names.selectedIndex].value;
	$('#tfbs_image').attr('src', '/a/images/pf_tfbs/' + newVal + '.png');
}
