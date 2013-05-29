wdk.util.namespace("eupathdb.foldChange", function(ns, $) {
  "use strict";

  var $img,
      $form,
      helpTmpl,
      slideMap;

  var $scope = {}; // gets bound to form state, with some extras. used for template

  helpTmpl = Handlebars.compile($("#help-template").html());

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

    setTimeout(update, 0);
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

    // if "up or down regulated" selected, disable ops
    if ($form.find("select[name*='regulated_dir']").val() === "up or down regulated") {
      refOp.attr("disabled", true);
      refOp.find(":selected").text(refCount <= 1 ? "none" : refOp.val().slice(0, -1));
      //refOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");

      compOp.attr("disabled", true);
      compOp.find(":selected").text(compCount <= 1 ? "none" : compOp.val().slice(0, -1));
      //compOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
      return;
    }

    // if refCount <= 1, make ops disabled
    if (refCount <= 1) {
      refOp.attr("disabled", true);
      refOp.find(":selected").text("none");
      //refOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
    } else {
      refOp.attr("disabled", false);
      refOp.find(":selected").text(refOp.val().slice(0, -1));
      //refOp.parents(".param-line").find(".text").css("color","black");
    }

    // if compCount <= 1, make ops disabled
    if (compCount <=1) {
      compOp.attr("disabled", true);
      compOp.find(":selected").text("none");
      //compOp.parents(".param-line").find(".text").css("color","rgb(198,198,198)");
    } else {
      compOp.attr("disabled", false);
      compOp.find(":selected").text(compOp.val().slice(0, -1));
      //compOp.parents(".param-line").find(".text").css("color","black");
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
  };

  // set the classname for the image placeholder
  var setGraph = function() {
    var className = [
      $scope.direction.replace(/\s+/g, "-"),
      $scope.ref_operation.replace(/\s+/g, "-"),
      $scope.comp_operation.replace(/\s+/g, "-")
    ].join("-");

    $img.find("div").css("top", "-10000px").eq(slideMap[className] - 1).css("top", "");

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
      $(".fold-change-help.dynamic-help").html(html).show();
    } else {
      $(".fold-change-help.static-help").show();
      $(".fold-change-help.dynamic-help").hide();
    }
  };

  $(init);

  ns.init = init;
});
