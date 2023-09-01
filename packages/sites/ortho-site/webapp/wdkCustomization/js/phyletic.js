// cookie names
var COOKIE_SHOW_LABEL = 'show_label';
var COOKIE_TAXON_PREFIX = 'taxon_';

function initializePhyleticView() {
  PhyleticViewManager.initialize();
}

function Taxon(id) {
  this.parent = null;
  this.id = id;
  this.isLeaf = true;
  this.index = null;
  this.name = null;
  this.common_name = null;
  this.abbrev = null;
  this.children = new Array();

  // the leaves only exist on root nodes
  this.leaves = new Array();

  this.getPath = function () {
    if (!('path' in this)) {
      if (this.parent == null) this.path = '';
      else {
        var parentPath = this.parent.getPath();
        if (parentPath != '') parentPath += '-&gt;';
        this.path = parentPath + this.abbrev;
      }
    }
    return this.path;
  };

  this.getAncesterMap = function () {
    var parent = this.parent;
    var ancesterMap = {};
    while (parent != null) {
      ancesterMap[parent.abbrev] = parent;
      parent = parent.parent;
    }
    return ancesterMap;
  };
}

var PhyleticViewManager = {};

PhyleticViewManager.taxonMap = {};
PhyleticViewManager.rootMap = {
  FIRM: {},
  PROT: {},
  OBAC: {},
  ARCH: {},
  EUGL: {},
  AMOE: {},
  VIRI: {},
  ALVE: {},
  FUNG: {},
  META: {},
  OEUK: {},
};

PhyleticViewManager.initialize = function () {
  var manager = PhyleticViewManager;
  var workspace = window.wdk.findActiveView();
  manager.loadTaxons(manager, workspace);
  manager.configureControls(manager, workspace);
  manager.createTaxonDisplay(manager, workspace);
  manager.createGroupDisplay(manager, workspace);
  manager.colorAttributesByFrequency(manager, workspace);

  // remove select columns from pager
  $('.pager .addAttributesButton').hide();
};

PhyleticViewManager.loadTaxons = function (manager, workspace) {
  var parentMap = {};
  // fetch data
  workspace.find('#taxons .taxon').each(function () {
    var taxonTag = $(this);
    var taxon = new Taxon(taxonTag.attr('taxon-id'));
    parentMap[taxon.id] = taxonTag.attr('parent');
    taxon.abbrev = taxonTag.attr('abbrev');
    taxon.isLeaf = taxonTag.attr('leaf') == '1' ? true : false;
    taxon.index = taxonTag.attr('index');
    taxon.common_name = taxonTag.attr('common-name');
    taxon.name = taxonTag.html();
    manager.taxonMap[taxon.id] = taxon;
  });
  // resolve relationships
  for (var taxonId in this.taxonMap) {
    var taxon = this.taxonMap[taxonId];
    var parentId = parentMap[taxonId];
    if (parentId != taxonId) {
      taxon.parent = this.taxonMap[parentId];
      taxon.parent.children.push(taxon);
    }
    if (this.rootMap[taxon.abbrev]) {
      this.rootMap[taxon.abbrev] = taxon;
    }
  }
  // fill in leaves of the roots
  for (var taxonId in this.taxonMap) {
    var taxon = this.taxonMap[taxonId];
    if (!taxon.isLeaf) continue;
    for (var abbrev in taxon.getAncesterMap()) {
      var root = manager.rootMap[abbrev];
      if (root) {
        root.leaves.push(taxon);
        break;
      }
    }
  }
};

PhyleticViewManager.configureControls = function (manager, workspace) {
  // register show/hide count events
  workspace.find('#control #showCount').click(function () {
    var checked = this.checked;
    workspace.find('#groups .group .phyletic-pattern .taxon').each(function () {
      var taxon = $(this);
      var name = taxon.children('.name');
      var count = taxon.children('.count');
      if (checked) {
        taxon.css('width', '26px');
        name.css('height', '12px');
        name.children('span').show();
        count.css('height', '10px');
        count.children('span').show();
      } else {
        taxon.css('width', '10px');
        name.css('height', '5px');
        name.children('span').hide();
        count.css('height', '5px');
        count.children('span').hide();
      }
    });
    $.cookie(COOKIE_SHOW_LABEL, this.checked ? 1 : 0, 30);
  });
};

PhyleticViewManager.createTaxonDisplay = function (manager, workspace) {
  var stub = workspace.find('#taxon-display');
  var div = '<table><tr>';
  var cols = 4;
  var count = 0;
  for (var abbrev in manager.rootMap) {
    if (count++ % cols == 0) div += '</tr><tr>';

    var cookie = $.cookie(COOKIE_TAXON_PREFIX + abbrev);
    var exp = '',
      col = '',
      hid = '';
    var exp_class = 'off',
      col_class = 'off',
      hid_class = 'off';
    if (cookie == 'c') {
      col = '_h';
      exp_class = '';
    } else if (cookie == 'h') {
      hid = '_h';
      col_class = '';
    } else {
      exp = '_h';
      exp_class = '';
    }
    var root = this.rootMap[abbrev];
    div += '<td class="taxon" abbrev="' + abbrev + '">';
    div += ' <div class="name">' + abbrev + '</div>&nbsp;&nbsp;&nbsp;';
    div +=
      ' <img class="expand-handle ' +
      exp_class +
      '" src="/images/expand' +
      exp +
      '.gif" title="Display all species of ' +
      root.name +
      '" />';
    div +=
      ' <img class="collapse-handle ' +
      col_class +
      '" src="/images/collapse' +
      col +
      '.gif"  title="Display only summary of ' +
      root.name +
      '" />';
    div +=
      ' <img class="hide-handle ' +
      hid_class +
      '" src="/images/hide' +
      hid +
      '.gif"  title="Hide all species of ' +
      root.name +
      '" />';
    div +=
      '&nbsp;<div class="description tooltip">' +
      root.getPath() +
      '<br /><i>' +
      root.name;
    if (root.common_name) div += ' (' + root.common_name + ')';
    div += '</i></div>';
    div += '</td>';
  }
  div += '</tr></table>';
  stub.append(div);

  // register show/hide events
  var cookie_options = { path: '/', expires: 30 };
  stub.find('.taxon .expand-handle').click(function () {
    var handle = $(this);
    handle.attr('src', '/images/expand_h.gif').removeClass('off');
    handle
      .siblings('.collapse-handle')
      .attr('src', '/images/collapse.gif')
      .addClass('off');
    handle
      .siblings('.hide-handle')
      .attr('src', '/images/hide.gif')
      .addClass('off');

    var abbrev = handle.parent('.taxon').attr('abbrev');
    var branch = workspace.find(
      '#groups .group .phyletic-pattern .branch[abbrev="' + abbrev + '"]'
    );
    branch.show();
    branch.children('.taxon[leaf="true"]').show();
    branch.children('.taxon[leaf="false"]').hide();
    $.cookie(COOKIE_TAXON_PREFIX + abbrev, 'e', cookie_options);
  });
  stub.find('.taxon .collapse-handle').click(function () {
    var handle = $(this);
    handle.attr('src', '/images/collapse_h.gif').removeClass('off');
    handle
      .siblings('.expand-handle')
      .attr('src', '/images/expand.gif')
      .addClass('off');
    handle
      .siblings('.hide-handle')
      .attr('src', '/images/hide.gif')
      .addClass('off');

    var abbrev = handle.parent('.taxon').attr('abbrev');
    var branch = workspace.find(
      '#groups .group .phyletic-pattern .branch[abbrev="' + abbrev + '"]'
    );
    branch.show();
    branch.children('.taxon[leaf="true"]').hide();
    branch.children('.taxon[leaf="false"]').show();
    $.cookie(COOKIE_TAXON_PREFIX + abbrev, 'c', cookie_options);
  });
  stub.find('.taxon .hide-handle').click(function () {
    var handle = $(this);
    handle.attr('src', '/images/hide_h.gif').removeClass('off');
    handle
      .siblings('.expand-handle')
      .attr('src', '/images/expand.gif')
      .addClass('off');
    handle
      .siblings('.collapse-handle')
      .attr('src', '/images/collapse.gif')
      .addClass('off');

    var abbrev = handle.parent('.taxon').attr('abbrev');
    var branch = workspace.find(
      '#groups .group .phyletic-pattern .branch[abbrev="' + abbrev + '"]'
    );
    branch.hide();
    $.cookie(COOKIE_TAXON_PREFIX + abbrev, 'h', cookie_options);
  });

  // register mouse over events
  stub.find('.taxon').qtip({
    content: {
      text: function (api) {
        return $(this).find('.tooltip').clone();
      },
    },
    position: {
      at: 'bottom right',
      my: 'top right',
      viewport: $(window),
      adjust: { y: 4 },
    },
  });

  stub.find('.taxon').hover(
    function () {
      if ($(this).attr('color-backup')) return;

      var abbrev = $(this).attr('abbrev');
      var color = $(this).children('.name').css('background-color');
      $(this).attr('color-backup', color);
      var parts = color.split(/[\(\),]\s*/);
      if (parts.length == 1) {
        // code for IE, color format: #FFFFFF
        var red = parseInt('0x' + color.substring(1, 3));
        var green = parseInt('0x' + color.substring(3, 5));
        var blue = parseInt('0x' + color.substring(5, 7));
      } else {
        // code for firefox, color format rgb(xxx, xxx, xxx)
        var red = Number(parts[1]);
        var green = Number(parts[2]);
        var blue = Number(parts[3]);
      }
      var inc = 0;
      var step = 5;
      $(this).everyTime(
        40,
        function () {
          inc += step;
          var ired = red + inc;
          var igreen = green + inc;
          var iblue = blue + inc;
          if (ired > 255) ired = 255;
          else if (ired < 0) ired = 0;
          if (igreen > 255) igreen = 255;
          else if (igreen < 0) igreen = 0;
          if (iblue > 255) iblue = 255;
          else if (iblue < 0) iblue = 0;
          color = 'rgb(' + ired + ', ' + igreen + ', ' + iblue + ')';
          var bcolor = 40 + inc * 2;
          border = 'rgb(' + bcolor + ', ' + bcolor + ', ' + bcolor + ')';
          $(this)
            .children('.name')
            .css('background-color', color)
            .css('border-color', border);
          var taxon = workspace.find(
            '#groups .group .phyletic-pattern .branch[abbrev="' +
              abbrev +
              '"] .taxon'
          );
          taxon.css('background-color', color).css('border-color', 'silver');
          if (inc >= 60) step = -5;
          else if (inc <= -20) step = 5;
        },
        0
      );
    },
    function () {
      if (!$(this).attr('color-backup')) return;

      $(this).stopTime();

      var abbrev = $(this).attr('abbrev');
      var color = $(this).attr('color-backup');
      $(this)
        .children('.name')
        .css('background-color', color)
        .css('border-color', 'black');
      var taxon = workspace.find(
        '#groups .group .phyletic-pattern .branch[abbrev="' +
          abbrev +
          '"] .taxon'
      );
      taxon.css('background-color', color).css('border-color', 'black');
      $(this).removeAttr('color-backup');
    }
  );
};

PhyleticViewManager.createGroupDisplay = function (manager, workspace) {
  workspace.find('#groups .group').each(function () {
    var groupId = $(this).attr('id');
    var counts = manager.getCounts(manager, workspace, groupId);
    for (var abbrev in manager.rootMap) {
      var root = manager.rootMap[abbrev];
      var cookie = $.cookie(COOKIE_TAXON_PREFIX + abbrev);
      var countSum = 0;
      var display = cookie == 'h' ? 'display: none;' : '';
      var div =
        '<div class="branch" abbrev="' +
        root.abbrev +
        '" style="' +
        display +
        '">';
      for (var i = 0; i < root.leaves.length; i++) {
        var leaf = root.leaves[i];
        var count = counts[leaf.id] ? counts[leaf.id] : 0;
        div += manager.createFlatNode(leaf, count, cookie != 'c');
        countSum += count;
      }
      div += manager.createFlatNode(root, countSum, cookie == 'c');
      div += '</div>';
      $(this).find('.phyletic-pattern').append(div);
    }
  });

  // register mouse over events
  workspace.find('#groups .group .phyletic-pattern .taxon').qtip({
    content: {
      text: function (api) {
        return $(this).find('.tooltip').clone();
      },
    },
    position: {
      viewport: $(window),
    },
  });
};

PhyleticViewManager.createFlatNode = function (taxon, count, show) {
  var div = '';
  var display = show ? '' : 'display: none; ';
  var cookie = $.cookie(COOKIE_SHOW_LABEL);
  var width = '',
    childStyle = '',
    grandChildStyle = '';
  if (cookie == '0') {
    var grandChildStyle = 'style="display: none;"';
    var width = 'width: 10px; ';
    var childStyle = 'style="height: 5px;"';
  }
  div += '<div class="taxon" abbrev="' + taxon.abbrev + '"';
  div += '     leaf="' + taxon.isLeaf + '"';
  div += '     style="' + display + width + '" count="' + count + '">';
  div +=
    '  <div class="name" ' +
    childStyle +
    '><span ' +
    grandChildStyle +
    '>' +
    taxon.abbrev +
    '</span></div>';
  div +=
    '  <div class="count" ' +
    childStyle +
    '><span ' +
    grandChildStyle +
    '>' +
    count +
    '</span></div>';
  div +=
    '  <div class="description tooltip">' +
    taxon.getPath() +
    '<br /><i>' +
    taxon.name;
  if (taxon.common_name) div += ' (' + taxon.common_name + ')';
  div += '</i></div>';
  div += '</div>';
  return div;
};

PhyleticViewManager.getCounts = function (manager, workspace, groupId) {
  var counts = {};
  workspace
    .find('#groups #' + groupId)
    .find('.count-data .count')
    .each(function () {
      var group = $(this);
      var taxonId = group.attr('taxon-id');
      var count = group.html();
      counts[taxonId] = Number(count);
    });
  return counts;
};

PhyleticViewManager.colorAttributesByFrequency = function (manager, workspace) {
  workspace
    .find('.attr-keyword-freq .keyword, .attr-descriptions .keyword')
    .each(function () {
      var $this = $(this);
      var freq = $this.data('frequency');
      var cLevel = Math.floor(200 - 200 * freq);
      $this.css('color', 'rgb(' + [cLevel, cLevel, cLevel].join(',') + ')');
    });
};
