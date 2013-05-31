wdk.util.namespace("eupathdb.foldChange", function(ns, $) {
  "use strict";

  var $img,
      $form,
      helpTmpl,
      helpMap,
      slideMap;

  var $scope = {}; // gets bound to form state, with some extras. used for template

  // map extra help info to param choices
  helpMap = {
    "down-regulated-none-none":
    "See help document for more details.",

    "down-regulated-maximum-none":
    "This calculation creates the <b>broadest</b> window of expression values in which to look for genes that meet your fold change cutoff.  To narrow the window, use the average or minimum reference value. See help document for more details. ",

    "down-regulated-average-none":
    "To broaden the window, use the maximum reference value. To narrow the window in which to look for genes that meet your fold change cutoff, use the minimum reference value. See our help document for more details.",

    "down-regulated-minimum-none":
    "This calculation creates the most <b>narrowest</b> window of expression values in which to look for genes that meet your fold change cutoff. To broaden the window, use the average or maximum reference value. See help document for more details. ",

    "down-regulated-none-maximum":
    "This calculation creates the most <b>narrowest</b> window in which to look for genes that meet your fold change cutoff.  To broaden the window, use the average or minimum comparison value. See our help document for more details.",

    "down-regulated-none-average":
    "To broaden the window, use the minimum comparison value. To narrow the window in which to look for genes that meet your fold change cutoff, use the maximum comparison value. See our help document for more details.",

    "down-regulated-none-minimum":
    "This calculation creates the <b>broadest</b> window of expression values in which to look for genes that meet your fold change cutoff. To narrow the window, use the average or maximum comparison value. See help document for more details.",

    "up-regulated-none-none":
    "See help document for more details.",

    "up-regulated-maximum-none":
    "This calculation creates the most <b>narrowest</b> window of expression values in which to look for genes that meet your fold change cut off. To broaden the window, use the average or minimum reference value. See our help document for more details. ",

    "up-regulated-average-none":
    "To broaden the window of expression values in which to look for genes that meet your fold change cut off, use the minimum reference expression value. To narrow the window, use the maximum reference value. See our help document for more details.",

    "up-regulated-minimum-none":
    "This calculation creates the <b>broadest</b> window of expression values in which to look for genes that meet your fold change cut off. To narrow the window, use the average or maximum reference value. See our help document for more details. ",

    "up-regulated-none-maximum":
    "This calculation creates the <b>broadest</b> window of expression values in which to look for genes that meet your fold change cut off. To narrow the window, use the average or minimum comparison value. See help document for more details. ",

    "up-regulated-none-average":
    "To broaden the window of expression values in which to look for genes that meet your fold change cut off, use the maximum comparison value. To narrow the window, use the minimum comparison value. See help document for more details.",

    "up-regulated-none-minimum":
    "This calculation creates the most <b>narrowest</b> window of expression values in which to look for genes that meet your fold change cut off. To broaden the window, use the average or maximum comparison value. See our help document for more details."
  };

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

    // swap location of question icons for parameters
    // $(".group-detail").find("label").each(function() {
    //   $(this).find(":first-child").appendTo(this)
    // });

    helpTmpl = Handlebars.compile($("#help-template").html());

    $img = $(".fold-change-img");
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

    // connect to form change event
    $form.on("change", update).on("submit", function() {
      $(this).find(":disabled").attr("disabled", false);
    });

    $form.find("#fold_change").on("keyup", function(e) {
      update();
    });

    update();
    return;
  };

  var update = function() {
    setParams();
    setScope();
    setGraph();
    setHelp();
  };

  // make some params readonly in certain conditions
  var setParams = function() {
    var refOp = $form.find("select[name*='min_max_avg_ref']"),
        compOp = $form.find("select[name*='min_max_avg_comp']"),
        refCount = $form.find("input[name*='samples_fc_ref_generic']:checked").length,
        compCount = $form.find("input[name*='samples_fc_comp_generic']:checked").length;


    // if refCount <= 1, make ops disabled
    if (refCount <= 1) {
      refOp.attr("disabled", true);
      refOp.find(":selected").text("none");
      refOp.parent().hide().next().hide();
      //refOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
    } else {
      refOp.attr("disabled", false);
      refOp.find(":selected").text(refOp.val().slice(0, -1));
      refOp.parent().show().next().show();
      //refOp.parents(".param-line").find(".text").css("color","black");
    }

    // if compCount <= 1, make ops disabled
    if (compCount <=1) {
      compOp.attr("disabled", true);
      compOp.find(":selected").text("none");
      compOp.parent().hide().next().hide();
      //compOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
    } else {
      compOp.attr("disabled", false);
      compOp.find(":selected").text(compOp.val().slice(0, -1));
      compOp.parent().show().next().show();
      //compOp.parents(".param-line").find(".text").css("color","black");
    }

    // if "up or down regulated" selected, disable ops
    if ($form.find("select[name*='regulated_dir']").val() === "up or down regulated") {
      refOp.attr("disabled", true);
      //refOp.find(":selected").text(refCount <= 1 ? "none" : refOp.val().slice(0, -1));
      //refOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");

      compOp.attr("disabled", true);
      //compOp.find(":selected").text(compCount <= 1 ? "none" : compOp.val().slice(0, -1));
      //compOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
      return;
    }
  };

  // set the properies of $scope
  var setScope = function() {
    // defaults
    // $scope.ref_operation = "none";
    // $scope.comp_operation = "none;

    $scope.fold_change = $form.find("#fold_change").val();
    $scope.direction = $form.find("select[name*='regulated_dir']").val();
    $scope.ref_count = $form.find("input[name*='samples_fc_ref_generic']:checked").length;
    $scope.comp_count = $form.find("input[name*='samples_fc_comp_generic']:checked").length;
    $scope.ref_operation = $form.find("select[name*='min_max_avg_ref']").find(":selected").text();
    $scope.comp_operation = $form.find("select[name*='min_max_avg_comp']").find(":selected").text();

    $scope.className = [
      $scope.direction.replace(/\s+/g, "-"),
      $scope.ref_operation.replace(/\s+/g, "-"),
      $scope.comp_operation.replace(/\s+/g, "-")
    ].join("-");

    $scope.multiple_ref = $scope.ref_count > 1;
    $scope.multiple_comp = $scope.comp_count > 1;

    if ($scope.multiple_ref) {
      $scope.numerator = $scope.ref_operation + " expression value in reference samples";
    } else {
      $scope.numerator = "reference expression value";
    }

    if ($scope.multiple_comp) {
      $scope.denominator = $scope.comp_operation + " expression value in comparison samples";
    } else {
      $scope.denominator = "comparison expression value";
    }

    $scope.extra_help = helpMap[$scope.className];
  };

  // set the classname for the image placeholder
  var setGraph = function() {
    $img.find("div").css("top", "-10000px").eq(slideMap[$scope.className] - 1).css("top", "");

    if ($scope.ref_count === 0 || $scope.comp_count === 0) {
      $img.block({
        message: null,
        overlayCSS: {
          opacity: 0.9,
          backgroundColor: "rgb(211,211,211)"
        }
      });
    } else {
      $img.unblock();
    }
  };

  var setHelp = function() {
    if ($scope.ref_count && $scope.comp_count) {
      var html = helpTmpl($scope);
      $(".fold-change-help.static-help").hide();
      $(".fold-change-help.dynamic-help").show().html(html);
    } else {
      $(".fold-change-help.static-help").show();
      $(".fold-change-help.dynamic-help").hide();
    }
  };

  $(init);

  ns.init = init;
});
