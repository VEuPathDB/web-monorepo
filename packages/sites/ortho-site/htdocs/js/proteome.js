$(document).ready(function() {
    document.proteome = new Proteome();
    document.proteome.initialize();
});

function Proteome() {

    this.initialize = function() {
        this.decorateForms();
        this.validateForms();
    };

    this.decorateForms = function() {
        $("form input[required=\"true\"]").each(function() {
            $(this).after("<span style=\"color:red\" title=\"This field is required\">*</span>");
        });
    }

    this.validateForms = function() {
        $("form").submit(function() {
            var result = true;
            $(this).find("input").each(function() {
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
            return result;
        });
    }
}


