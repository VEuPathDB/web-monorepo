(function($) {
  "use strict";

  // See http://wiki.jqueryui.com/w/page/12138135/Widget-factory for more
  // details about the jQueryUI Widget factory and what each property of
  // the object passed to jQuery.widget means.
  $.widget("apidb.mutuallyExclusiveParams", {

    // default options
    options: {

      // Each element of the array is a (set of)
      // mutually exclusive parameter(s)
      //
      // @Array
      groups: [],

      // Event handler for change event on radio button,
      // for each parameter row.
      //
      // Arguments passed to function are radio input element
      // and table row for paramater.
      //
      // @Function
      change: function() { return true; }
    },

    // set up widget; this gets called *first* time plugin is invoked
    _create: function() {
      // cache values
      this.questionName = $("#questionName", this.element).attr("name");
      this.paramTable = $("div.param-group[name='" + this.questionName + "_empty']" +
          " > div.group-detail > table", this.element),
      this.groups = this.options.groups;
    },

    // this gets called *every time* plugin is invoked
    _init: function() {
      this._setOption("groups", this.groups);
    },

    // call-backs for changes to option values
    _setOption: function(key, value) {
      var self = this;
      this.groupsRows = [];

      switch(key) {
        case "groups":
          var missingParam = false,
              groups = value;

          self.destroy();

          // for each group, we want to get the rows for the params
          self.groupsRows = [];

          $.each(groups, function(groupNum, group) {
            // groupRows will get pushed to groupsRows
            var groupRows = [];
            $.each(group, function(idx, param) {
              var row = $("tr", self.paramTable).has("[id='" + param + "']")
                  .first().addClass("xor-group").data("xor-group", groupNum)

              if (row.length !== 1) {
                missingParam = true;
              } else {
                groupRows.push(row);
              }
            });

            self.groupsRows.push(groupRows);
          });

          if (missingParam) {
            return;
          }

          $("<tr><td colspan='3'>&nbsp;</td></tr><tr><td>&nbsp;</td><td><b>Please choose one of the " +
              "following groups of parameters</b></td></tr>")
              .insertBefore(self.groupsRows[0][0])
              .addClass("xor-group-note");

          // we want to add a radio button to the first cell of the first groupRow
          $.each(self.groupsRows, function(groupNum, groupRows) {
            var input = $("<input/ type='radio' name='xor-group'>")
                // .attr("checked", groupNum == ($.cookie(self.questionName + "-xor-group") || 0))
                .attr("checked", groupNum === 0)
                .attr("id", "xor-group-" + groupNum)
                .val(groupNum);


            $("<tr></tr>")
                .append($("<td style='text-align:right; color:#610B0B;'></td>")
                    .append(input)
                    .append("<label for='xor-group-" + groupNum + "'>" +
                        "<b>Select parameters below</b></label>"))
                .append("<td colspan='2'></td>")
                .addClass("xor-group-select")
                .insertBefore(groupRows[0]);

            $("<tr><td colspan='3'>&nbsp;</td></tr>")
                .addClass("xor-group-spacer")
                .insertAfter(groupRows[groupRows.length - 1]);
          });

          $(this.element).on("change", ".xor-group-select input", function() {
            self.change();
          });
          if (this.options.init instanceof Function) {
            this.options.init(this.element);
          }
          self.change();
          break;
      }

      $.Widget.prototype._setOption.apply(this, arguments);
    },

    change: function() {
      var self = this;
      $("input[name='xor-group']", self.element).each(function(idx, input) {
        var num = input.value;

        if (input.checked) {
          // set cookie for checked radio
          // $.cookie(self.questionName + "-xor-group", num);
        }

        $.each(self.groupsRows[num], function() {
          this.css("color", input.checked ? "black" : "#AAA");
          this.find("td:nth-child(2)")
              .find("input, select, textarea")
              .attr("disabled", !input.checked);
        });
        if (self.options.change instanceof Function) {
          self.options.change(input, self.groupsRows[num]);
        }
      });
    },

    destroy: function() {
      // remove previous xor-group markup and elements
      $(this.element).off();
      $(this.element).find(".xor-group-note").remove();
      $(this.element).find(".xor-group-select").remove();
      $(this.element).find(".xor-group-spacer").remove();
      $(this.element).find(".xor-group").removeClass("xor-group");

      $.Widget.prototype.destroy.call( this );
    }

  });

}(jQuery));


// *ByLocation questions have mutually exclusive params:
jQuery(function($) {
  wdkEvent.subscribe("questionload", function() {

    // First, find the active form
    // Then, get the form name
    // Then, determine which groups to use based on form name.

    var form = $("form#form_question").has("div#questionName").last(),
        questionName = form.find("div#questionName").attr("name"),
        // tmpChrom = $("#chromosomeOptional", form).first().clone().attr("type", "hidden"),
        tmpChrom = $("<input type='hidden' name='array(chromosomeOptional)' value='Choose chromosome'/>"),
        groups;

    if (questionName === "HtsSnpsByLocation") {
      groups = [
        ['chromosomeOptional'],
        ['sequenceId']
      ];
    } else if (/ByLocation$/.exec(questionName) ||
        questionName === "DynSpansBySourceId") {
      groups = [
        ['organism', 'chromosomeOptional'],
        ['sequenceId']
      ];
    } else {
      // no param grouping needed for now
      return;
    }

    form.mutuallyExclusiveParams({
      groups: groups,

      init: function(element) {
        if ($("#sequenceId", element).val().indexOf("(Examples:") !== 0) {
          // select this
          $("input[name='xor-group']")[1].checked = true;
        }
        element.on("submit", function(event) {
          var chromosomeOptional = this.chromosomeOptional;
          if (chromosomeOptional.nodeName === "SELECT" && chromosomeOptional.disabled) {
            chromosomeOptional.disabled = false;
            chromosomeOptional[0].selected = true;
          } else if (chromosomeOptional[0].disabled) {
            chromosomeOptional[0].disabled = false;
            chromosomeOptional[0].checked = true;
          }

          this.organism.disabled = false;
        });
      }
    });

    wdkEvent.subscribe("questionchange", function() {
      form.mutuallyExclusiveParams("change");
    });

  });
});