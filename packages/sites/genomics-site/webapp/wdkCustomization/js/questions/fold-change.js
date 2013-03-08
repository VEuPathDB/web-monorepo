"use strict";

wdk.util.namespace("eupathdb.foldChange", function(ns, $) {
  var $img,
      $form;

  // set the classname for the image placeholder
  var setGraph = function() {
    var direction,
        className,
        slideMap,
        ref_operation = "none",
        comp_operation = "none";


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
      "up-or-down-regulated-average-average" : 30,
      "up-or-down-regulated-average-none"    : 31,
      "up-or-down-regulated-none-average"    : 32,
      "up-or-down-regulated-none-none"       : 33,
      "down-regulated-none-none"             : 34,
      "down-regulated-average-none"          : 35,
      "down-regulated-minimum-none"          : 36
    };

    direction = $form.find("#regulated_dir")
        .val().replace(/\s+/g, "-");

    if ($form.find("#samples_fc_ref_generic:checked").length > 1) {
      ref_operation = $form.find("#min_max_avg_ref")
          .find(":selected").text().replace(/\s+/g, "-");
    }

    if ($form.find("#samples_fc_comp_generic:checked").length > 1) {
      comp_operation = $form.find("#min_max_avg_comp")
          .find(":selected").text().replace(/\s+/g, "-");
    }


    if ($form.find("#samples_fc_ref_generic:checked").length === 0 &&
        $form.find("#samples_fc_comp_generic:checked").length === 0) {
      blockGraph();
      return;
    }

    className = [direction, ref_operation, comp_operation].join("-");

    //$img.unblock().removeClass().addClass("fold-change-img").addClass(className);
    $img.unblock().find("div").css("top", "-10000px").eq(slideMap[className] - 1).css("top", "");
  };

  // block image placeholder with a link for help text
  var blockGraph = function() {
    if (!$img.data("blockUI.isBlocked")) {
      $img.block({
        message: "<a href='' class='fold-change-help'>Click for more information</a>",
        overlayCSS: {
          background: "white",
          opacity: 0.8,
          cursor: "default"
        },
        css: {
          cursor: "default"
        }
      });
    }
  };

  // make some params readonly in certain conditions
  var setParams = function() {
    var refOp = $form.find("#min_max_avg_ref"),
        compOp = $form.find("#min_max_avg_comp"),
        refCount = $form.find("#samples_fc_ref_generic:checked").length,
        compCount = $form.find("#samples_fc_comp_generic:checked").length;

    // if "up or down regulated" selected, disable ops
    if ($form.find("#regulated_dir").val() === "up or down regulated") {
      refOp.attr("disabled", true);
      refOp.find(":selected").text(refCount <= 1 ? "none" : refOp.val().slice(0, -1));

      compOp.attr("disabled", true);
      compOp.find(":selected").text(compCount <= 1 ? "none" : compOp.val().slice(0, -1));
      return;
    }

    // if refCount <= 1, make ops disabled
    if (refCount <= 1) {
      refOp.attr("disabled", true);
      refOp.find(":selected").text("none");
    } else {
      refOp.attr("disabled", false);
      refOp.find(":selected").text(refOp.val().slice(0, -1));
    }

    // if compCount <= 1, make ops disabled
    if (compCount <=1) {
      compOp.attr("disabled", true);
      compOp.find(":selected").text("none");
    } else {
      compOp.attr("disabled", false);
      compOp.find(":selected").text(compOp.val().slice(0, -1));
    }
  };

  var init = function() {
    // create placeholder for graph images
    $img = $("<div></div>").prependTo(".param-group.empty").addClass("fold-change-img");
    // get a handle on the form element -- we use .last to handle nested forms
    $form = $("form#form_question").last();

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

    // set color of params
    // $(".samples_fc_ref_generic, .min_max_avg_ref").css("color", "blue");
    // $(".samples_fc_comp_generic, .min_max_avg_comp").css("color", "#D10000");

    $img.on("click", ".fold-change-help", function(e) {
      e.preventDefault();
      $("<div>Some static help information here...</div>").dialog({
        modal: true,
        title: "Help for Fold Change Expression Searches"
      });
    });

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

  init();

  ns.init = init;
});
