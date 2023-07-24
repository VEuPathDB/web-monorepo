wdk.namespace('eupathdb.pfamDomain', function (ns, $) {
  // change this to have more/less bands
  var BAND_COUNT = 4;
  // 13 colors used for 4-band domain coloring
  var COLORS = [
    'rgb(71, 145, 213)', // dark blue
    'rgb(193, 235, 248)', // light blue
    'orange',
    'rgb(235, 235, 0)', // yellow
    'black',
    'rgb(190, 190, 190)', // grey
    'rgb(255, 192, 203)', // light red
    'rgb(223, 42, 42)', // dark red
    'rgb(144, 238, 144)', // light green
    'rgb(0, 145, 0)', // dark green
    'rgb(216, 87, 216)', // purple
    'rgb(206, 169, 73)', // brown
    'white',
  ];

  function initializePfams() {
    var manager = new PfamManager();
    manager.initialize();
  }

  function PfamManager() {
    this.initialize = function () {
      var manager = this;
      var domains = manager.loadDomains();
      manager.loadProteins(domains);
    };

    this.loadDomains = function () {
      var domains = {};
      var manager = this;
      $('#Record_Views #domains .domain').each(function () {
        var name = $(this).attr('id');
        var domainNode = $(this).find('.legend');
        $.each(manager.assignColors(name), function (idx, color) {
          $('<div/>').css('background-color', color).appendTo(domainNode);
        });
      });
      return domains;
    };

    this.loadProteins = function (domains) {
      var maxLength = parseInt($('#Record_Views #proteins').attr('maxlength'));
      var manager = this;
      $('#Record_Views #proteins .protein').each(function () {
        var length = parseInt($(this).find('.length').text());
        var width = ((100.0 * length) / maxLength).toString() + '%';
        $(this).find('.protein-graph').width(width);
        $(this)
          .find('.domains .domain')
          .each(function (idx, domainNode) {
            var name = $(this).attr('id');
            var start = parseInt($(this).attr('start'));
            var end = parseInt($(this).attr('end'));
            var dw = ((100.0 * (end - start + 1)) / maxLength).toString() + '%';
            var x = ((100.0 * start) / maxLength).toString() + '%';
            $(this).css('width', dw).css('left', x);
            $.each(manager.assignColors(name), function (idx, color) {
              $('<div/>').css('background-color', color).appendTo(domainNode);
            });
          });
      });
    };

    this.assignColors = function (pfamId) {
      // COLORS is a curated list of colors. Four colors are combined based on
      // the pfam ID (see below) to create a 4-band coloring. The number 4 was
      // chosen with the idea that the number of pfam domains would not surpass
      // 13^4 (28,561) for quite some time. If it does, then untouched, this
      // will scale to 5 bands (where apprpriate). This will also scale if
      // additional colors are added.
      //
      // The pfam ID is of the form "PF#####" where the numbers are sequential.
      // We will slice out the numeric part of the ID and compute its elements
      // in base {COLORS.length}.
      //
      // Number.toString will do this with a numeric argument. The values are 0-indexed.
      // For values larger than 9, lowercase alpha characters are used beginning
      // with "a".
      //
      // Likewise, parseInt will convert a String to a Number in the given radix.

      var colors = [];

      // Parse the numeric part of the Pfam ID as an integer and get its
      // elements in base {COLORS.length}
      var terms = parseInt(pfamId.slice(2), 10).toString(COLORS.length);

      // pad with zeros so we can get the number of colors needed
      while (terms.length < BAND_COUNT) {
        terms = '0' + terms;
      }

      // push colors into array
      for (var i = 0; i < terms.length; i++) {
        colors.push(COLORS[parseInt(terms[i], COLORS.length)]);
      }

      return colors;
    };
  }

  ns.init = initializePfams;
  ns.PfamManager = PfamManager;
});
