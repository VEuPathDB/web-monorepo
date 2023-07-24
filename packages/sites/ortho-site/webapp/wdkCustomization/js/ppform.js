var urls = {
  dc: 'dc.gif',
  yes: 'yes.gif',
  no: 'no.gif',
  maybe: 'maybe.gif',
  unk: 'unk.gif',
};
var branch_states = ['dc', 'yes', 'maybe', 'no', 'unk'];
var leaf_states = ['dc', 'yes', 'no'];
var taxons = {};
var roots = [];
var inLeaves;
var outLeaves;

function initial() {
  // reset roots, otherwise we might get duplicate nodes in subsequent revises
  roots = [];

  // resolve the children of each node
  for (var taxon_id in taxons) {
    var taxon = taxons[taxon_id];
    taxon.expanded = true;
    if (taxon_id != taxon.parent_id) {
      var parent = taxons[taxon.parent_id];
      parent.children.push(taxon);
    } else {
      roots.push(taxon);
    }
  }
  roots.sort(compareTaxons);

  // sort children
  for (var taxon_id in taxons) {
    var taxon = taxons[taxon_id];
    taxon.children.sort(compareTaxons);
  }
  // load the saved status
  loadState();
  displayNodes();

  // tooltips for species
  $('.species').qtip({
    position: { at: 'bottom center' },
  });
}

function compareTaxons(a, b) {
  if (!(a.is_species ^ b.is_species)) return a.index - b.index;
  else if (a.is_species) return -1;
  else return 1;
}

function displayNodes() {
  var content = [];
  for (var i = 0; i < roots.length; i++) {
    displayClade(roots[i], content);
  }
  $('#phyletic-tree').html(content.join(''));
}

function displayClade(node, content) {
  var subClades = [];
  var subSpecies = [];
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    if (child.is_species) subSpecies.push(child);
    else subClades.push(child);
  }
  var foldImage = node.expanded ? 'minus.png' : 'plus.png';

  content.push("<table><tr><td class='clade'>");
  if (subClades.length == 0 || node.id == node.parent_id) {
    content.push("<image width='20' src='wdkCustomization/images/spacer.gif'>");
  } else {
    content.push("<image id='", node.id, "_fold' width='20' ");
    content.push(' style="cursor:pointer;" ');
    content.push(' src="wdkCustomization/images/', foldImage, '" ');
    content.push(' onclick="toggleFold(\'', node.id, '\')"/>');
  }
  content.push("<image id='", node.id, "_check' ");
  content.push(' src="wdkCustomization/images/', urls[node.state], '" ');
  content.push(' style="cursor:pointer;" ');
  content.push(' onclick="toggleState(\'' + node.id + '\')" />');

  if (node.common_name) content.push('<span title="', node.common_name, '">');
  content.push('<b>', node.name, ' (', node.abbrev, ')</b>');
  if (node.common_name) content.push('</span>');
  content.push(':</td>');

  // display species under the node
  if (subSpecies.length > 0) {
    var display =
      node.expanded || subClades.length == 0 ? '' : 'display: none;';
    content.push('<td class="species-region">');
    content.push('<table id="', node.id, '_species" ');
    content.push(' style="' + display + '">');
    content.push('<tr>');
    for (var i = 0; i < subSpecies.length; i++) {
      displaySpecies(subSpecies[i], content);
    }
    content.push('</tr></table></td>');
  }
  content.push('</tr></table>');

  // display sub-clades under the node
  if (subClades.length > 0) {
    var display = node.expanded ? '' : 'display: none;';
    content.push("<div id='" + node.id + '_clades\' class="indent" ');
    content.push(' style="' + display + '">');
    for (var i = 0; i < subClades.length; i++) {
      displayClade(subClades[i], content);
    }
    content.push('</div>');
  }
}

function displaySpecies(node, content) {
  content.push('<td class="species" title="<i>');
  content.push(node.name.replace(/'/g, "\\'"), '</i> (', node.abbrev, ')">');
  content.push('<image id="', node.id, '_check" ');
  content.push(' src="wdkCustomization/images/', urls[node.state], '" ');
  content.push(' style="cursor:pointer;" ');
  content.push(' onclick="toggleState(\'', node.id, '\')" />');
  content.push(node.abbrev, '</td>');
}

function toggleFold(nodeId) {
  var imgFold = document.getElementById(nodeId + '_fold');
  var divSpecies = document.getElementById(nodeId + '_species');
  var divClades = document.getElementById(nodeId + '_clades');
  var taxon = taxons[nodeId];
  taxon.expanded = !taxon.expanded;

  imgFold.src =
    'wdkCustomization/images/' + (taxon.expanded ? 'minus.png' : 'plus.png');
  var display = taxon.expanded ? 'block' : 'none';
  if (divClades) divClades.style.display = display;
  if (divSpecies) divSpecies.style.display = display;

  saveState();
}

function toggleState(nodeId) {
  var imgState = document.getElementById(nodeId + '_check');
  var taxon = taxons[nodeId];

  if (taxon.children.length) {
    taxon.state = branch_states[(branch_states.indexOf(taxon.state) + 1) % 4];
    //taxon.state = (taxon.state + 1) % 4;
    imgState.src = 'wdkCustomization/images/' + urls[taxon.state];

    for (var i = 0, j = taxon.children.length; i < j; ++i) {
      if (taxon.state != 'maybe') {
        setState(taxon.children[i].id, taxon.state);
      } else {
        setState(taxon.children[i].id, 'dc');
      }
    }
  } else {
    taxon.state = leaf_states[(leaf_states.indexOf(taxon.state) + 1) % 3];
    //taxon.state = (taxon.state + 1) % 3;
    imgState.src = 'wdkCustomization/images/' + urls[taxon.state];
  }

  if (nodeId != taxon.parent_id) {
    fixParent(nodeId);
  }
  calcText();
}

function setState(nodeId, nodeState) {
  var imgState = document.getElementById(nodeId + '_check');
  var taxon = taxons[nodeId];

  taxon.state = nodeState;
  imgState.src = 'wdkCustomization/images/' + urls[nodeState];

  if (taxon.children.length) {
    for (var i = 0, j = taxon.children.length; i < j; ++i) {
      setState(taxon.children[i].id, nodeState);
    }
  }
}

function fixParent(nodeId) {
  var parentId = taxons[nodeId].parent_id;
  var parentImg = document.getElementById(parentId + '_check');
  var parent = taxons[parentId];
  var taxon = taxons[nodeId];

  parent.state = 'dc';

  for (var i = 0, j = parent.children.length; i < j; ++i) {
    if (taxon.state == 'maybe' || taxon.state != parent.children[i].state) {
      parent.state = 'unk';
      parentImg.src = 'wdkCustomization/images/' + urls[parent.state];
      break;
    }
  }
  if (!parent.state || parent.state == 'dc') {
    parent.state = taxon.state;
    parentImg.src = 'wdkCustomization/images/' + urls[parent.state];
  }
  if (parentId != parent.parent_id) {
    fixParent(parentId);
  }
}

function calcText() {
  var query;
  var rootStrs = [];

  inLeaves = [];
  outLeaves = [];

  for (var i = 0, j = roots.length; i < j; ++i) {
    var rootText;
    if ((rootText = nodeText(roots[i].id))) {
      rootStrs.push(rootText);
    }
  }

  if (inLeaves.length) {
    rootStrs.push(inLeaves.join('+') + '=' + inLeaves.length + 'T');
  }
  if (outLeaves.length) {
    rootStrs.push(outLeaves.join('+') + '=0T');
  }

  query = rootStrs.join(' AND ');

  document.getElementById('query_top').value = query;
  // text input currently not on bottom of page
  // document.getElementById("query_bottom").value = query;
}

function nodeText(nodeId) {
  var nodeStr;

  if (taxons[nodeId].children.length) {
    if (taxons[nodeId].state == 'yes') {
      nodeStr = taxons[nodeId].abbrev + '=' + countLeaves(nodeId) + 'T';
    } else if (taxons[nodeId].state == 'no') {
      nodeStr = taxons[nodeId].abbrev + '=0T';
    } else if (taxons[nodeId].state == 'maybe') {
      nodeStr = taxons[nodeId].abbrev + '>=1T';
    } else if (taxons[nodeId].state == 'unk') {
      var childStrs = [];
      for (var i = 0, j = taxons[nodeId].children.length; i < j; ++i) {
        var resp = nodeText(taxons[nodeId].children[i].id);
        if (resp) {
          childStrs.push(resp);
        }
      }
      nodeStr = childStrs.join(' AND ');
    }
  } else {
    if (taxons[nodeId].state == 'yes') {
      inLeaves.push(taxons[nodeId].abbrev);
    } else if (taxons[nodeId].state == 'no') {
      outLeaves.push(taxons[nodeId].abbrev);
    }
  }

  return nodeStr;
}

function countLeaves(nodeId) {
  var count = 0;

  if (!taxons[nodeId].children.length) {
    return 1;
  }

  for (var i = 0, j = taxons[nodeId].children.length; i < j; ++i) {
    count = count + countLeaves(taxons[nodeId].children[i].id);
  }

  return count;
}

function saveState() {
  var content = '';
  for (var taxon_id in taxons) {
    var taxon = taxons[taxon_id];
    if (!taxon.is_species && !taxon.expanded) {
      if (content.length > 0) content += '|';
      content += taxon.abbrev;
    }
  }

  document.cookie =
    'phyletic-tree-v2=' + content + '; max-age=' + 60 * 60 * 24 * 365;
}

function loadState() {
  var allcookies = document.cookie;
  var key = 'phyletic-tree-v2=';
  var pos = allcookies.indexOf(key);
  if (pos >= 0) {
    pos += key.length;
    var end = allcookies.indexOf(';', pos);
    var content =
      end >= 0 ? allcookies.substring(pos, end) : allcookies.substring(pos);

    var collapsed = {};
    var parts = content.split('|');
    for (var i = 0; i < parts.length; i++) {
      collapsed[parts[i]] = true;
    }
    // update taxons
    for (var taxon_id in taxons) {
      var taxon = taxons[taxon_id];
      if (taxon.abbrev in collapsed) taxon.expanded = false;
    }
  }
}

function changePPE(fromTop) {
  var txtTop = document.getElementById('query_top');
  var txtBottom = document.getElementById('query_bottom');
  if (fromTop) txtBottom.value = txtTop.value;
  else txtTop.value = txtBottom.value;
}
