wdk.util.namespace("eupathdb.foldChange", function(ns, $) {
  "use strict";

  var $img,
      $form,
      $overlay,
      slideMap,
      helpContent;

  helpContent = "<p>This graphic will help you visualize the parameter " +
    "choices you make at the left. " +
    "It will begin to display when you choose a <b>Reference Sample</b> or " +
    " <b>Comparison Sample</b>.</p>" +
    "<p>Additionally, see the <a href='/assets/Fold%20Change%20Help.pdf' " +
    " target='_blank'>detailed help for this search</a>.</p>";

  // map operation combinations to slide numbers
  slideMap = {
      "up-regulated-maximum-maximum"         : 1,
      "up-regulated-none-maximum"            : 2,
      "up-regulated-maximum-none"            : 3,
      "up-regulated-minimum-maximum"         : 4,
      "up-regulated-minimum-none"            : 5,
      "up-regulated-none-none"               : 6,
      "up-regulated-average-maximum"         : 7,
      "up-regulated-average-none"            : 8,
      "up-regulated-maximum-average"         : 9,
      "up-regulated-none-average"            : 10,
      "up-regulated-minimum-average"         : 11,
      "up-regulated-average-average"         : 12,
      "up-regulated-maximum-minimum"         : 13,
      "up-regulated-none-minimum"            : 14,
      "up-regulated-minimum-minimum"         : 15,
      "up-regulated-average-minimum"         : 16,
      "down-regulated-maximum-maximum"       : 17,
      "down-regulated-maximum-none"          : 18,
      "down-regulated-none-maximum"          : 19,
      "down-regulated-minimum-maximum"       : 20,
      "down-regulated-average-maximum"       : 21,
      "down-regulated-maximum-average"       : 22,
      "down-regulated-none-average"          : 23,
      "down-regulated-minimum-average"       : 24,
      "down-regulated-average-average"       : 25,
      "down-regulated-maximum-minimum"       : 26,
      "down-regulated-minimum-minimum"       : 27,
      "down-regulated-none-minimum"          : 28,
      "down-regulated-average-minimum"       : 29,
      "down-regulated-none-none"             : 30,
      "down-regulated-average-none"          : 31,
      "down-regulated-minimum-none"          : 32,
      "up-or-down-regulated-average-average" : 33,
      "up-or-down-regulated-average-none"    : 34,
      "up-or-down-regulated-none-average"    : 35,
      "up-or-down-regulated-none-none"       : 36
    };

  var init = function() {
    // create placeholder for graph images
    var $wrapper,
        $help;

    // swap location of question icons for parameters
    $(".group-detail").find("label").each(function() {
      $(this).find(":first-child").appendTo(this)
    });

    $wrapper = $("<div/>").addClass("fold-change-wrapper").appendTo(".param-group.dynamic");
    $img = $("<div/>").addClass("fold-change-img").appendTo($wrapper);
    // get a handle on the form element -- we use .last to handle nested forms
    $form = $("form#form_question").last();
    $form.addClass("fold-change");

    // override blockUI functions
    $img.block = function() {
      this.find(".overlay").show();
      return this;
    };

    $img.unblock = function() {
      this.find(".overlay").hide();
      return this;
    };

    // load slides
    for (var i = 1; i <= 36; i++) {
      $("<div></div>")
      .css("position", "absolute")
      .css("height", "300px")
      .css("width", "400px")
      .css("background-image", "url(/assets/images/fold-change/Slide" + (i<10 ? "0"+i : i) + ".jpg)")
      .css("top", "-10000px")
      .appendTo($img);
    }

    $img.find("div").last().css("top", "");

    $("<div/>").addClass("overlay").appendTo($img);

    // add help link
    $help = $("<div/>")
    .html(helpContent)
    .addClass("fold-change-help")
    .appendTo($wrapper);

    // $("<a><img src='" + wdk.getWebAppUrl() + "wdk/images/question.png'/> Download detailed help about this search.</a>")
    // .attr("href", "/assets/Fold Change Help.docx")
    // .appendTo($help);


    // connect to form change event
    $form.on("change", function() {
      setParams();
      setGraph();
    }).on("submit", function() {
      $(this).find(":disabled").attr("disabled", false);
    });

    setTimeout(function() {
      setParams();
      setGraph();
    }, 100);
    return;
  };

  // set the classname for the image placeholder
  var setGraph = function() {
    var direction,
        className,
        ref_operation = "none",
        comp_operation = "none";

    direction = $form.find("select[name*='regulated_dir']")
        .val().replace(/\s+/g, "-");

    if ($form.find("input[name*='samples_fc_ref_generic']:checked").length > 1) {
      ref_operation = $form.find("select[name*='min_max_avg_ref']")
          .find(":selected").text().replace(/\s+/g, "-");
    }

    if ($form.find("input[name*='samples_fc_comp_generic']:checked").length > 1) {
      comp_operation = $form.find("select[name*='min_max_avg_comp']")
          .find(":selected").text().replace(/\s+/g, "-");
    }


    className = [direction, ref_operation, comp_operation].join("-");

    //$img.unblock().removeClass().addClass("fold-change-img").addClass(className);
    $img.find("div").css("top", "-10000px").eq(slideMap[className] - 1).css("top", "");

    if ($form.find("input[name*='samples_fc_ref_generic']:checked").length === 0 ||
        $form.find("input[name*='samples_fc_comp_generic']:checked").length === 0) {
      $img.block();
    } else {
      $img.unblock();
    }
  };

  // make some params readonly in certain conditions
  var setParams = function() {
    var refOp = $form.find("select[name*='min_max_avg_ref']"),
        compOp = $form.find("select[name*='min_max_avg_comp']"),
        refCount = $form.find("input[name*='samples_fc_ref_generic']:checked").length,
        compCount = $form.find("input[name*='samples_fc_comp_generic']:checked").length;

    // if "up or down regulated" selected, disable ops
    if ($form.find("select[name*='regulated_dir']").val() === "up or down regulated") {
      refOp.attr("disabled", true);
      refOp.find(":selected").text(refCount <= 1 ? "none" : refOp.val().slice(0, -1));
      refOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");

      compOp.attr("disabled", true);
      compOp.find(":selected").text(compCount <= 1 ? "none" : compOp.val().slice(0, -1));
      compOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
      return;
    }

    // if refCount <= 1, make ops disabled
    if (refCount <= 1) {
      refOp.attr("disabled", true);
      refOp.find(":selected").text("none");
      refOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
    } else {
      refOp.attr("disabled", false);
      refOp.find(":selected").text(refOp.val().slice(0, -1));
      refOp.parents(".param-line").find(".text").css("color","black");
    }

    // if compCount <= 1, make ops disabled
    if (compCount <=1) {
      compOp.attr("disabled", true);
      compOp.find(":selected").text("none");
      compOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
    } else {
      compOp.attr("disabled", false);
      compOp.find(":selected").text(compOp.val().slice(0, -1));
      compOp.parents(".param-line").find(".text").css("color","black");
    }
  };

  $(init);

  ns.init = init;
});
