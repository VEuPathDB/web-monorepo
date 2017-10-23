
// need to override download link
function initializeGeneView(element, attributes) {

  var $downloadLink = jQuery('#genes .step-download-link');
  var downloadLink = $downloadLink[0];
  var oldStepId = attributes.transcriptStepId;
  var oldDownloadUrl = $downloadLink.attr('href');

  $downloadLink.click(function(event) {

    // don't allow browser to visit original link
    event.preventDefault();

    // display spinner next to download link so user knows something is happening
    var image = document.createElement("img");
    image.setAttribute("src", wdk.webappUrl('wdk/images/filterLoading.gif'));
    downloadLink.appendChild(image);

    // create a new transform step that converts the current transcript step to
    //   a gene step, then visit the download page, passing the new gene step id
    wdk.getWdkService().createStep({
      answerSpec: {
        "questionName": "GeneRecordQuestions.GenesFromTranscripts",
        "parameters": { "gene_result": oldStepId }
      }
    })
    .then(step => {
      downloadLink.removeChild(image);
      window.location = oldDownloadUrl.replace(oldStepId, data.id);
    })
    .catch(error => {
      downloadLink.removeChild(image);
      alert("Unable to transform transcript result to genes for download.  Check your internet connection.");
    });
  });
}
