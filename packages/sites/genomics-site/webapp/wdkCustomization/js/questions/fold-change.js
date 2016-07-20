wdk.namespace("eupathdb.foldChange", function(ns, $) {
  "use strict";

  var SampleCollection = function(type) {
    this.type = type;
    this.samplesLabel = type[0].toUpperCase() + type.slice(1);
    this.operationLabel = type[0].toUpperCase() + type.slice(1);
    this.samples = [];
  };

  /** 
   * set the sample step in px and where the first sample goes
   * String @operation - one of minimum, maximum, average
   * Boolean @isHigh - should the samples appear high or low in graph?
   */
  SampleCollection.prototype.setup = function(sampleCount, operation, isHigh) {
    var stepCount, steps, smallSteps, bigSteps;

    smallSteps = [0, 100, 33, 66]; // percentages
    bigSteps = [0, 200, 66, 133]; // percentages

    stepCount = sampleCount = Math.min(sampleCount, 4);

    if (sampleCount > 1) {
      //stepCount = sampleCount - 1;
      this.operationLabel = operation[0].toUpperCase() + operation.slice(1) +
          " " + this.operationLabel;
    }

    switch (operation) {
      case "minimum":
        steps = (isHigh) ? $.map(smallSteps, function(x) { return -x; }) :
          $.map(bigSteps, function(x) { return -x;});
        break;

      case "maximum":
        steps = (isHigh) ? bigSteps : smallSteps;
        break;

      case "average":
        if (stepCount === 2) {
          steps = [-90, 90];
        } else if (stepCount === 3) {
          steps = [-90, 90, 0];
        } else if (stepCount === 4) {
          steps = [-90, 90, -50, 50];
        }
        break;

      default:
        steps = smallSteps;
    }
    for (var i = 0; i < sampleCount; i++) {
      this.samples.push({top: steps[i]});
    }
    return this;
  };

  var Formula = function(leftHandSide, numerator, denominator) {
    this.leftHandSide = leftHandSide;
    this.numerator = numerator;
    this.denominator = denominator;
  };

  var init = function($element) {
    var $img,
        $form,
        helpTmpl,
        oneDirectionTmpl,
        twoDirectionTmpl;

    var $scope = {}; // gets bound to form state, with some extras. used for template


    var templateImports = { imports: {
      samplesPartial: _.template($element.find("#samples-partial").html()),
      foldChangePartial: _.template($element.find("#foldChange-partial").html()),
      formulaPartial: _.template($element.find("#formula-partial").html())
    }};

    helpTmpl = _.template($element.find("#help-template").html(), null, templateImports);
    oneDirectionTmpl = _.template($element.find("#one-direction-template").html(), null, templateImports);
    twoDirectionTmpl = _.template($element.find("#two-direction-template").html(), null, templateImports);

    $img = $element.find(".fold-change-img");
    $form = $element.closest("form");

    // connect to form change event
    $form
    .on("change", function() {
      update($scope, $form, $img, oneDirectionTmpl, twoDirectionTmpl, helpTmpl);
    })
    .on("submit", function() {
      $(this).find(":disabled").attr("disabled", false);
    });

    $form.find("#fold_change").on("keyup", function(e) {
      update($scope, $form, $img, oneDirectionTmpl, twoDirectionTmpl, helpTmpl);
    });

    // make samples boxes resizable
    $element.find(".reference > div, .comparison > div").each(function(idx, div) {
      var $div = $(div);
      $div.resizable({
        alsoResize: $div.find(".param-multiPick.dependentParam ul, .checkbox-tree"),
        minWidth: $div.width(),
        maxWidth: $div.width(),
        minHeight: 120
      });
    });

    update($scope, $form, $img, oneDirectionTmpl, twoDirectionTmpl, helpTmpl);
    return;
  };

  var update = _.debounce(function($scope, $form, $img, oneDirectionTmpl, twoDirectionTmpl, helpTmpl) {
    setParams($form);
    setScope($scope, $form);
    setGraph($scope, $img, oneDirectionTmpl, twoDirectionTmpl);
    setHelp($scope, $form, helpTmpl);
  }, 50);

  // make some params readonly in certain conditions
  var setParams = function($form) {
    var refOp = $form.find("select[name*='min_max_avg_ref']"),
        compOp = $form.find("select[name*='min_max_avg_comp']"),
        refCount = $form.find("input[name*='samples_fc_ref_generic']:checked").length,
        compCount = $form.find("input[name*='samples_fc_comp_generic']:checked").length;


    // if refCount <= 1, make ops disabled
    if (refCount <= 1) {
      //refOp.attr("disabled", true);
      refOp.find(":selected").text("none");
      refOp.parent().hide();
    } else {
      //refOp.attr("disabled", false);
      refOp.find(":selected").text(refOp.val().slice(0, -1));
      refOp.parent().css("display", "");
    }

    // if compCount <= 1, make ops disabled
    if (compCount <=1) {
      //compOp.attr("disabled", true);
      compOp.find(":selected").text("none");
      compOp.parent().hide();
    } else {
      //compOp.attr("disabled", false);
      compOp.find(":selected").text(compOp.val().slice(0, -1));
      compOp.parent().css("display", "");
    }

    // if "up or down regulated" selected, disable ops
    // if ($form.find("select[name*='regulated_dir']").val() === "up or down regulated") {
    //   refOp.attr("disabled", true);
    //   compOp.attr("disabled", true);
    // }
  };

  // set the properies of $scope
  var setScope = function($scope, $form) {

    $scope.foldChange = $form.find("#fold_change").val();
    $scope.direction = $form.find("select[name*='regulated_dir']").val();
    $scope.refCount = $form.find("input[name*='samples_fc_ref_generic']:checked").length;
    $scope.compCount = $form.find("input[name*='samples_fc_comp_generic']:checked").length;
    $scope.refOperation = $form.find("select[name*='min_max_avg_ref']").find(":selected").text();
    $scope.compOperation = $form.find("select[name*='min_max_avg_comp']").find(":selected").text();

    $scope.className = [
      $scope.direction.replace(/\s+/g, "-"),
      $scope.refOperation.replace(/\s+/g, "-"),
      $scope.compOperation.replace(/\s+/g, "-")
    ].join("-");

    $scope.multipleRef = $scope.refCount > 1;
    $scope.multipleComp = $scope.compCount > 1;

    $scope.formulas = [];
    var compFormula, refFormula;

    if ($scope.multipleRef) {
      refFormula = '<span class="reference-label">' +
        $scope.refOperation + '</span> expression value in ' +
        '<span class="reference-label">reference</span> samples';
    } else {
      refFormula = '<span class="reference-label">reference</span> expression value';
    }

    if ($scope.multipleComp) {
      compFormula = '<span class="comparison-label">' +
        $scope.compOperation + '</span> expression value in ' +
        '<span class="comparison-label">comparison</span> samples';
    } else {
      compFormula = '<span class="comparison-label">comparison</span> expression value';
    }

    if ($scope.direction === "up-regulated") {
      $scope.formulas.push(new Formula("fold change", compFormula, refFormula));
      $scope.criteria = "<b>fold change</b> &gt;= <b>" + $scope.foldChange + "</b>";
    } else if ($scope.direction === "down-regulated") {
      $scope.formulas.push(new Formula("fold change", refFormula, compFormula));
      $scope.criteria = "<b>fold change</b> &gt;= <b>" + $scope.foldChange + "</b>";
    } else if ($scope.direction === "up or down regulated") {
      $scope.formulas.push(new Formula('fold change<sub>up</sub>', compFormula, refFormula));
      $scope.formulas.push(new Formula('fold change<sub>down</sub>', refFormula, compFormula));
      $scope.criteria = "<b>fold change<sub>up</sub></b> &gt;= <b>" + $scope.foldChange + "</b>";
      $scope.criteria += " or <b>fold change<sub>down</sub></b> &gt;= <b>" + $scope.foldChange + "</b>";
    }

    $scope.narrowest = false;
    $scope.broadest = false;

    if ($scope.direction === "up-regulated") {
      // we are interested in expression values increasing

      // a broad window exists when we choose the least ref expression value
      // and the most comp expression value
      if (($scope.refOperation === "none" || $scope.refOperation === "minimum")
          && $scope.compOperation === "maximum") {
        $scope.broadest = true;
      } else if ($scope.refOperation === "minimum" &&
          ($scope.compOperation === "none" || $scope.compOperation === "maximum")) {
        $scope.broadest = true;
      }
      // a narrow window exists when we choose the most ref expression value
      // and the least comp expression value
      if (($scope.refOperation === "none" || $scope.refOperation === "maximum")
          && $scope.compOperation === "minimum") {
        $scope.narrowest = true;
      } else if ($scope.refOperation === "maximum" &&
          ($scope.compOperation === "none" || $scope.compOperation === "minimum")) {
        $scope.narrowest = true;
      }
    } else if ($scope.direction === "down-regulated") {
      // we are interested in expression values decreasing

      // a broad window exists when we choose the most ref expression value
      // and the least comp expression value
      if (($scope.refOperation === "none" || $scope.refOperation === "maximum")
          && $scope.compOperation === "minimum") {
        $scope.broadest = true;
      } else if ($scope.refOperation === "maximum" &&
          ($scope.compOperation === "none" || $scope.compOperation === "minimum")) {
        $scope.broadest = true;
      }
      // a narrow window exists when we choose the least ref expression value
      // and the most comp expression value
      if (($scope.refOperation === "none" || $scope.refOperation === "minimum")
          && $scope.compOperation === "maximum") {
        $scope.narrowest = true;
      } else if ($scope.refOperation === "minimum" &&
          ($scope.compOperation === "none" || $scope.compOperation === "maximum")) {
        $scope.narrowest = true;
      }
    }

    $scope.narrowOps = { comp: [], ref: [] };
    $scope.broadenOps = { comp: [], ref: [] };
    if ($scope.direction === "up-regulated") {
      // select average or minimum comp
      if ($scope.compOperation === "maximum") {
        $scope.narrowOps.comp.push("average", "minimum");
      } else if ($scope.compOperation === "average") {
        $scope.narrowOps.comp.push("minimum");
        $scope.broadenOps.comp.push("maximum");
      } else if ($scope.compOperation === "minimum") {
        $scope.broadenOps.comp.push("average", "maximum");
      }
      // select average or maximum ref
      if ($scope.refOperation === "minimum") {
        $scope.narrowOps.ref.push("average", "maximum");
      } else if ($scope.refOperation === "average") {
        $scope.narrowOps.ref.push("maximum");
        $scope.broadenOps.ref.push("minimum");
      } else if ($scope.refOperation === "maximum") {
        $scope.broadenOps.ref.push("average", "minimum");
      }
    } else if ($scope.direction === "down-regulated") {
      // select average or maximum comp
      if ($scope.compOperation === "minimum") {
        $scope.narrowOps.comp.push("average", "maximum");
      } else if ($scope.compOperation === "average") {
        $scope.narrowOps.comp.push("maximum");
        $scope.broadenOps.comp.push("minimum");
      } else if ($scope.compOperation === "maximum") {
        $scope.broadenOps.comp.push("average", "minimum");
      }
      // select average or maximum ref
      if ($scope.refOperation === "maximum") {
        $scope.narrowOps.ref.push("average", "minimum");
      } else if ($scope.refOperation === "average") {
        $scope.narrowOps.ref.push("minimum");
        $scope.broadenOps.ref.push("maximum");
      } else if ($scope.refOperation === "minimum") {
        $scope.broadenOps.ref.push("average", "maximum");
      }
    }

    $scope.toBroaden = "";
    $scope.toNarrow = "";

    $scope.broadenHelp = [];
    if ($scope.broadenOps.ref.length) {
      $scope.broadenHelp.push($scope.broadenOps.ref.join(" or ") + " reference value");
    }
    if ($scope.broadenOps.comp.length) {
      $scope.broadenHelp.push($scope.broadenOps.comp.join(" or ") + " comparison value");
    }
    $scope.toBroaden = $scope.broadenHelp.join(", or ");

    $scope.narrowHelp = [];
    if ($scope.narrowOps.ref.length) {
      $scope.narrowHelp.push($scope.narrowOps.ref.join(" or ") + " reference value");
    }
    if ($scope.narrowOps.comp.length) {
      $scope.narrowHelp.push($scope.narrowOps.comp.join(" or ") + " comparison value");
    }
    $scope.toNarrow = $scope.narrowHelp.join(", or ");
  };

  // set the classname for the image placeholder
  var setGraph = function($scope, $img, oneDirectionTmpl, twoDirectionTmpl) {
    var html = '';

    if ($scope.direction === "up or down regulated") {
      var leftSampleGroups = [],
          rightSampleGroups = [];
      if ($scope.refCount) {
        leftSampleGroups.push(new SampleCollection("reference")
            .setup($scope.refCount, $scope.refOperation));
        rightSampleGroups.push(new SampleCollection("reference")
            .setup($scope.refCount, $scope.refOperation, true));
      }
      if ($scope.compCount) {
        leftSampleGroups.push(new SampleCollection("comparison")
            .setup($scope.compCount, $scope.compOperation, true));
        rightSampleGroups.push(new SampleCollection("comparison")
            .setup($scope.compCount, $scope.compOperation));
      }
      html = twoDirectionTmpl({
        title: $scope.direction[0].toUpperCase() + $scope.direction.slice(1),
        leftSampleGroups: leftSampleGroups,
        rightSampleGroups: rightSampleGroups,
        foldChange: ($scope.refCount && $scope.compCount) ? $scope.foldChange : 0
      });
    } else {
      var sampleCollections = [];
      var refSamples = new SampleCollection("reference");
      var compSamples = new SampleCollection("comparison");

      refSamples.setup($scope.refCount, $scope.refOperation, $scope.direction === "down-regulated");
      compSamples.setup($scope.compCount, $scope.compOperation, $scope.direction === "up-regulated");

      if ($scope.refCount) sampleCollections.push(refSamples);
      if ($scope.compCount) sampleCollections.push(compSamples);

      html = oneDirectionTmpl({
        title: $scope.direction[0].toUpperCase() + $scope.direction.slice(1),
        direction: $scope.direction.replace(/\s+/g, "-"),
        sampleGroups: sampleCollections,
        foldChange: ($scope.refCount && $scope.compCount) ? $scope.foldChange : 0
      });
    }
    // use setTimeout to prevent hard assert in IE8 rendering engine...
    setTimeout(function() {
      $img.html(html);
    }, 10);
  };

  var setHelp = function($scope, $form, helpTmpl) {
    if ($scope.refCount && $scope.compCount) {
      var html = helpTmpl($scope);
      $form.find(".fold-change-help.static-help").hide();
      $form.find(".fold-change-help.dynamic-help").show().html(html);
    } else {
      $form.find(".fold-change-help.static-help").show();
      $form.find(".fold-change-help.dynamic-help").hide();
    }
    $form.find(".fold-change .caption")
      .css("visibility", $scope.refCount > 4 || $scope.compCount > 4 ?
          "visible" : "hidden");
  };

  ns.init = init;
});
