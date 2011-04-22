// =============================================================================
// The js related to the span search by location question display on question page
const SPAN_LENGTH_LIMIT = 100000;


$(document).ready(function() {
    if (window.wdk == undefined) window.wdk = new WDK();

    var spanLocation = new SpanLocation();
    window.wdk.registerQuestionEvent(spanLocation.questionEventHandler);
});


function SpanLocation() {

    this.questionEventHandler = function() {
        var spanLocation = new SpanLocation();
        spanLocation.createLayout();
    }
}

SpanLocation.prototype.createLayout = function() {
        // locate the span_id param, then find it's tr parent, then add a place holder
        // for the span logic container
        var params = $("#form_question .params");
        params.find("table#span_id").parent("td").parent("tr")
            .before("<tr><td colspan='3'><div id='span-composition'></div></td></tr>");
            
        // find the place holder, and put the content of the template into it
        params.find("#span-composition").css("text-align", "center")
            .html($("#span-composition-template").html());

        // register events
        params.find("#span-composition #compose").click(this.composeId);
        $("#form_question").submit(this.validateIds);
};

SpanLocation.prototype.composeId = function() {
        var params = $("#form_question .params");
        var sequenceIds = $.trim(params.find("input#sequenceId").val());
        if (sequenceIds.length == 0 || sequenceIds.indexOf('(Examples:') == 0) {
            // sequence not set, get the chromosome instead
            var chromosome = params.find("select#chromosomeOptional");
            sequenceIds = chromosome.val();
            if (sequenceIds == "Choose chromosome") {
                alert("Please choose a chromosome, or enter a sequence id");
                chromosome.focus();
                return;
            }
        }
        var startInput = params.find("input#start_point");
        var start = parseInt(startInput.val());
        var end = parseInt(params.find("input#end_point").val());
        
        // check the length and make sure it didn't exceed the limit
        var length = end - start + 1;
        if (length <= 0 || length > SPAN_LENGTH_LIMIT) {
            alert("The start cannot be bigger than end, and the length of a "
                  + "segment cannot exceed " + SPAN_LENGTH_LIMIT + " bps.");
            startInput.focus();
            return;
        }

        var strand = params.find("select#sequence_strand").val();

        var ids = sequenceIds.split(/[,;]/);
        var spanIdsInput = params.find("textarea#span_id_data");
        var spanIds = spanIdsInput.val();
        for(var i = 0; i < ids.length; i++) {
            var sequenceId = $.trim(ids[i]);
            var spanId = sequenceId + ":" + start + "-" + end + ":" + strand;
            if (spanIds.length > 0) spanIds = ", " + spanIds;
            spanIds = spanId + spanIds;
        }
        spanIdsInput.val(spanIds);
};

SpanLocation.prototype.validateIds = function() {
        var strIds = $("#form_question .params textarea#span_id_data").val();
        var spanIds = strIds.split(/[,;\n]+/);
        for(var i = 0; i < spanIds.length; i++) {
            var spanId = $.trim(spanIds[i]);
            if (spanId.length == 0) continue;
            var columns = spanId.split(":");
            if (columns.length != 3) {
                alert("Segment id is malformed: " + spanId);
                return false;
            }
            if (columns[2] != 'f' && columns[2] != 'r') {
                alert("Segment id is malformed: " + spanId);
                return false;
            }
            var location = columns[1].split("-");
            if (location.length != 2) {
                alert("Segment id is malformed: " + spanId);
                return false;
            }
            var start = parseInt(location[0]);
            var end = parseInt(location[1]);
            if (isNaN(start) || isNaN(end)) {
                alert("Segment id is malformed: " + spanId);
                return false;
            }
            var length = end - start + 1;
            if (length <= 0 || length > SPAN_LENGTH_LIMIT) {
                alert("The start cannot be bigger than end in segment id '" 
                      + spanId + "', and the length of a segment cannot exceed " 
                      + SPAN_LENGTH_LIMIT + " bps.");
                return false;
            }
        }
};

