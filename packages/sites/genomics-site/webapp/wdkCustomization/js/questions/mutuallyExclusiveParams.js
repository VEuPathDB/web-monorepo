(function($) {
  "use strict";

  // See http://wiki.jqueryui.com/w/page/12138135/Widget-factory for more
  // details about the jQueryUI Widget factory and what each property of
  // the object passed to jQuery.widget means.
  $.widget("apidb.mutuallyExclusiveParams", {

    // default options
    options: {

      // Each element of the array is an object with the properties
      // "name" and "params" where "name" is the label to use for the
      // group of params, and "params" is an array of param IDs
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
      this.paramDiv = $(".param-group[name='" + this.questionName + "_empty']" +
          " > .group-detail", this.element),
      //this.paramTable = $(".param-group[name='" + this.questionName + "_empty']" +
      //    " > .group-detail > table", this.element),
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
              groups = value,
              spacer = $("<tr><td colspan='3'>&nbsp;</td></tr>"),
              radioDiv;

          self.destroy();

          // for each group, we want to get the rows for the params
          self.groupsDivs = [];

          $.each(groups, function(idx, group) {
            // groupRows will get pushed to groupsRows
            var groupDivs = [];
            $.each(group.params, function(idx, param) {
              var div = $(".param-item", self.paramDiv)
                  .has("[id='" + param + "']")
                  .first()
                  .addClass("xor-group")
                  //.css("background-color", "lightYellow")
                  .data("xor-group", group.name)
                  .hide();

              if (div.length !== 1) {
                missingParam = true;
              } else {
                groupDivs.push(div);
              }
            });
            self.groupsDivs.push(groupDivs);
          });

          if (missingParam) {
            self.destroy();
            return;
          }

          radioDiv = $("<div><label>Search by: </label></div>")
          .addClass("xor-select")
          .on("change", function() {
            // taking advantage of jQuery patching change events to bubble up
            self.change();
          });
          self.paramDiv.before(radioDiv)
              .addClass("ui-widget-content")
              .addClass("ui-tabs")
              .addClass("ui-corner-all");

          $.each(groups, function(idx, group) {
            radioDiv
            .append($("<input id='xor-group-" + idx + "' type='radio' " +
                "name='xor-group' value='" + idx + "'/>").prop("checked", idx === 0))
            .append($("<label for='xor-group-" + idx + "'>" + group.name + "</label>"));
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
      var self = this,
          tabLabels,
          num;
      $("input[name='xor-group']", self.element).each(function(idx, input) {
        num = input.value;

        if (input.checked) {
          // set cookie for checked radio
          // $.cookie(self.questionName + "-xor-group", num);
        }

        $.each(self.groupsDivs[num], function() {
          //this.css("color", input.checked ? "black" : "#AAA");
          // this.toggleClass("active", input.checked);
          this.find("input, select, textarea")
              .attr("disabled", !input.checked);
          this.toggle(input.checked);
        });
        if (self.options.change instanceof Function && input.checked) {
          self.options.change.call(self.element, input, self.groupsDivs[num]);
        }
        tabLabels = $(".xor-select", self.element)
            .buttonset()
            .find("label")
            .removeClass("ui-corner-left")
            .removeClass("ui-corner-right")
            .addClass("ui-corner-top");
      });
    },

    destroy: function() {
      // remove previous xor-group markup and elements
      $(this.element).find(".xor-select").remove();
      $(this.element).find(".xor-group").removeClass("xor-group").show();

      $.Widget.prototype.destroy.call( this );
    }

  });

}(jQuery));

// *ByLocation questions have mutually exclusive params:
  wdk.registerQuestionEvent(function() {
    var $ = jQuery;

    // First, find the active form
    // Then, get the form name
    // Then, determine which groups to use based on form name.

    var form = $("form[name=questionForm]").has("div#questionName").last(),
        questionName = form.find("div#questionName").attr("name"),
        getChromosomeParam = function() { return form.find('[id^="chromosomeOptional"]:input'); },
        sequenceR = /(\(Example: .*\)|No match)/i,
        chromosomeFakeNull,
        groups;

    if (form.length === 0) {
      return;
    }

    groups = questionName === "NgsSnpsByLocation" ? [
      {
        name: "Chromosome",
        params: ['chromosomeOptionalForNgsSnps']
      },
      {
        name: "Sequence ID",
        params: ['sequenceId']
      }
    ]
    : questionName === "SnpsByLocation" ? [
      {
        name: "Chromosome",
        params: [ 'chromosomeOptional' ]
      },
      {
        name: "Sequence ID",
        params: [ 'sequenceId' ]
      }
    ]
    : /ByLocation$/.exec(questionName) || questionName === "DynSpansBySourceId" ? [
      {
        name: "Chromosome",
        params: ['organismSinglePick', 'chromosomeOptional']
      },
      {
        name: "Sequence ID",
        params: ['sequenceId']
      }
    ]
    : undefined;

    // no param grouping needed for now
    if (!groups) return;

    form.mutuallyExclusiveParams({
      groups: groups,

      init: function(element) {
        var $chromosomeOptional = getChromosomeParam();

        if (!sequenceR.test(element.find('#sequenceId').val()) ||
            // AmoebaDB only allows SequenceID
            (questionName === "HtsSnpsByLocation" && wdk.modelName() === "AmoebaDB")) {
          // select this
          $("input[name='xor-group']")[1].checked = true;
        }
        // change default chromosome
        chromosomeFakeNull = $chromosomeOptional.find(":first").remove();
      }

    });

    form.on("submit", function validateAndFormfix(event) {
      var $chromosomeOptional = getChromosomeParam();

      if ($chromosomeOptional.prop('disabled') &&
          sequenceR.test(this.sequenceId.value) &&
          questionName !== 'DynSpansBySourceId') {
        alert("Please enter a valid Sequence ID");
        this.sequenceId.select();
        event.preventDefault();
        return false;
      }

      // If chromosome is disabled, enable it and select the first option,
      // which should be the "blank" option
      if ($chromosomeOptional.prop('disabled')) {
        $chromosomeOptional.prop('disabled', false);
        chromosomeFakeNull.appendTo($chromosomeOptional).attr("selected", true);
      }

      this['value(organismSinglePick)'].disabled = false;

    }).on("change", function() {
      form.mutuallyExclusiveParams("change");
    });

  });
