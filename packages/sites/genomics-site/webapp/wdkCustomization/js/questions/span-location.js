(function($) {
    // =============================================================================
    // The js related to the span search by location question display on question page.
    // Cannot use const keyword, since IE doesn't support it.
    var SPAN_LENGTH_LIMIT = 100000;


    if (window.wdk == undefined) window.wdk = new WDK();

    var spanLocation = new SpanLocation();
    window.wdk.registerQuestionEvent(spanLocation.questionEventHandler);


    function SpanLocation() {

        this.questionEventHandler = function() {
            var spanLocation = new SpanLocation();
            spanLocation.createLayout();
        }
    }

    SpanLocation.prototype.createLayout = function() {
            var $form = $("form[name=questionForm]");
            var questionName = $form.find("input[name=questionFullName]").val();
            if (questionName != "SpanQuestions.DynSpansBySourceId") return;

            // locate the span_id param, then find it's tr parent, then add a place holder
            // for the span logic container
            var params = $form.find(".params").last();
            var spanIdInput = params.find("#span_id").parent(".param-control");
                
            // find the place holder for location, and put the content of the input id param into it
            $form.find("#span-location #span-search-list").append(spanIdInput.children());

            // find extra param groups
            // params.children(".param-group").each(function() {
            //     if ($(this).attr("type") != "empty")
            //         $(this).appendTo("#span-extra");
            // });
            params.children(".param-group").not(".empty").appendTo("#span-extra");

            spanIdInput.parents(".param-item").remove();

            // register events
            $form.find("#span-location #span-compose").click(this.composeId);
            $form.submit(this.validateIds);

            // fix param label width
            $form.find("label").css("width", "130px");
            $form.find(".param-control").css("margin-left", "140px");

            // move content-pane class to span-location table
            params.find(".content-pane").removeClass("content-pane")
                .parents("#span-location")
                .addClass("content-pane")
                .css("display", "block")
                .css("padding", "0.5em")
                .css("margin", "0.5em");
    };

    SpanLocation.prototype.composeId = function() {
            var $form = $("form[name=questionForm");
            var params = $form.find(".params");
            var sequenceIdsInput = params.find("input#sequenceId");
            var sequenceIds = $.trim(sequenceIdsInput.val());
            if (sequenceIds.length == 0 || sequenceIds.indexOf('(Example') == 0 ||
                sequenceIdsInput.attr("disabled")) {
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
            var end = parseInt(params.find("input#end_point_segment").val());
            
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
            var spanIdsInput = $form.find("#span-search-list textarea[name=span_id_data]");
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
            var $form = $("form[name=questionForm");
            var idInputType = $form.find("#span-search-list input#span_id_type").val();
            // if the input is not from text area, don't validate
            if (idInputType == 'file') {
                var fileName = $form.find("#span-search-list input#span_id_file").val();
                if (fileName.length == 0) {
                    // no upload file is selected, error
                    alert("Please select an upload file that contains segment id.");
                    return false;
                } else return true; // do not validate file content.
            } else if (idInputType != "data") return true;

            var strIds = $.trim($form.find("#span-search-list textarea#span_id_data").val());
            if (strIds.length == 0) {
                alert("Please specify a location on the left and click \"Add Location\" or\n"
                      + "  enter locations directly in the box on the right.");
                return false;
            } 

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

}(jQuery));
