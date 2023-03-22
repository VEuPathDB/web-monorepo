$(document).ready(function() {
    document.proteome = new Proteome();
    document.proteome.initialize();
});

function Proteome() {

    this.initialize = function() {
        var proteome = this;
        proteome.decorateForms();
    };

    this.decorateForms = function() {
        var proteome = this;
        var form = $("form#proteome");
        // decorate the form with required fields
        form.find("input[required=\"true\"]").each(function() {
            $(this).after("<span style=\"color:red\" title=\"This field is required\">*</span>");
        });
        form.submit(function() {
            //$.blockUI({ message : "Submitting, please wait..." });
            // ajaxSubmitted is need to support file upload.
            form.ajaxSubmit({
                type:         "POST",
                target:       "#proteome-result",
                beforeSubmit: proteome.validateForm,
                success:      proteome.displayResponse,
                error:        proteome.displayResponse
            });
            // prevent form from submitted by the default way.
            return false;
        });
    }

    this.validateForm = function(formData, jqForm, options) {
            var result = true;
            jqForm.find("input").each(function() {
                var required = $(this).attr("required");
                var invalid = false;
                var value = $(this).val();
                if (required == "true")  {
                    // reset the state
                    $(this).siblings(".error").remove();
                    $(this).css("background-color", "white");
                    if (value == "") {
                        result = false;
                        invalid = true;
                        $(this).before("<div class=\"error\" style=\"color:red\">" + $(this).attr("name") + " is required.</div>");
                        $(this).css("background-color", "#FFCCCC");
                        $(this).focus();
                    }
                }
                if (!invalid && $(this).attr("name") == 'email') {
                    // validate email
                    var pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                    if (!pattern.test(value)) {
                        result = false;
                        $(this).before("<div class=\"error\" style=\"color:red\">email is invalid.</div>");
                        $(this).css("background-color", "#FFCCCC");
                        $(this).focus();
                    }
                } 
            });
            //if (!result) $.unblockUI();
            return result;
    }

    this.displayResponse = function() {
        //$.unblockUI();
        $("#proteome-result").dialog({ modal: true, width: 'auto' });
    }
}


