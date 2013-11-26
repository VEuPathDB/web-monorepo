wdk.namespace('eupathdb.orthologPattern', function(ns, $) {
  var includedSpeciesName;
  var excludedSpeciesName;
  var profilePatternName;

  var urls = ['dc.gif', 'yes.gif', 'no.gif', 'yes.gif', 'unk.gif'];

  var state;
  var children;
  var parent;
  var abbrev;
  var parents = [0];

  ns.init = init;
  ns.toggle = toggle;

  function init(element, attrs){
    var includes, excludes, pattern;

    state = new Array(attrs.taxaCount);
    children = new Array(attrs.taxaCount);
    parent = new Array(attrs.taxaCount);

    for (var i = 0 ; i < attrs.taxaCount ; i++) {
      state[i] = 0;
      children[i] = [];
      parent[i] = null;
    }

    abbrev = attrs.abbrev;

    var lastIndent = 0;
    attrs.abbrev.forEach(function(sp, idx) {
      // 'All Organisms'
      if (idx === 0) return;

      var indent = attrs.indentMap[sp];
      if (indent > lastIndent) {
        parents.push(idx - 1);
      } else if (indent < lastIndent) {
        for(var i = indent; i < lastIndent; i++) {
          parents.pop();
        }
      }
      parent[idx] = parents[parents.length - 1];
      lastIndent = indent;
    });

    parent.forEach(function(p, idx) {
      if (p !== null)
        children[p][children[p].length] = idx;
    });


    includedSpeciesName = attrs.includedSpeciesName;
    excludedSpeciesName = attrs.excludedSpeciesName;
    profilePatternName = attrs.profilePatternName;

    includes = element.find('input[name="value(' + includedSpeciesName + ')"]').val().split(/,\s*/);
    excludes = element.find('input[name="value(' + excludedSpeciesName + ')"]').val().split(/,\s*/);
    pattern = element.find('input[name="value(' + profilePatternName  + ')"]').val();

    $("#orthology-profile-tree").jstree({
      "plugins" : [ "html_data", "themes" ],
      "themes" : { "theme" : "classic", "icons" : false }
    }).bind("loaded.jstree", function() {
      $(this).jstree("close_all").jstree("open_node", "> ul > li").show();
      initializeTree(includes, excludes);
    });
  }

  function initializeTree(includes, excludes) {
    includes.forEach(function(include) {
      if (include === 'n/a' || !include) return;
      toggle(abbrev.indexOf(include));
    });

    excludes.forEach(function(exclude) {
      if (exclude === 'n/a' || !exclude) return;
      toggle(abbrev.indexOf(exclude));
      toggle(abbrev.indexOf(exclude));
    });
  }

  function setstate (imgidx, urlidx, dofixparent) {
      state[imgidx] = urlidx;
      $("img#img" + imgidx).attr('src',"images/" + urls[urlidx]);
      for (var i = 0 ; i < children[imgidx].length ; i++) {
    setstate(children[imgidx][i], urlidx == 3 ? 0 : urlidx, 0);
      }
      
      if (dofixparent) {
    fixparent(imgidx, urlidx);
      }
  }

  function fixparent (imgidx, urlidx) {

      var parentidx = parent[imgidx];
      if (parentidx != null) {
    var allmatch = 1;
    if (urlidx == null) {
        allmatch = 0;
    } else {
        for (var i = 0 ; i < children[parentidx].length ; i++) {
      if (state[children[parentidx][i]] != urlidx) {
          allmatch = 0;
          break;
      }
        }    
    }
    if (allmatch) {
        state[parentidx] = urlidx;
        $("img#img" + parentidx).attr('src', "images/" + urls[urlidx]);
        fixparent(parentidx, urlidx);
    } else {
        state[parentidx] = null;
        $("img#img" + parentidx).attr('src', "images/" + urls[4]);
        fixparent(parentidx, null);
    }
      }
  }

  function toggle (imgidx) {
      var urlidx = 0;
      if (state[imgidx] != null) {
    urlidx = (state[imgidx] + 1) % 3;
      }
      setstate(imgidx, urlidx, 1);
      calctext();
  }

  function calctext () {
      var tree = new Array();

      var includeClause = new Array();
      var excludeClause = new Array();
      var includeClauseSQL = new Array();
      var excludeClauseSQL = new Array();

      tree[tree.length] = 0;
      while (tree.length) {
    var parent = tree.shift();
    var leafabbrev = abbrev[parent];
    var leaflist = new Array();
    if (state[parent] == null) {
        // need to walk children
        for (var j = 0 ; j < children[parent].length ; j++) {
      tree[tree.length] = children[parent][j];
        }
    } else if (state[parent] == 1) {
        includeClause.push(leafabbrev);
        if(children[parent].length) {
      var childlist = listchildren(parent);
      for (var i = 0 ; i < childlist.length ; i++) {
          includeClauseSQL.push(childlist[i] + ":Y");
      }
        } else {
      includeClauseSQL.push(leafabbrev + ":Y");
        }
    } else if (state[parent] == 2) {
        excludeClause.push(leafabbrev);
        if(children[parent].length) {
      var childlist = listchildren(parent);
      for (var i = 0 ; i < childlist.length ; i++) {
          excludeClauseSQL.push(childlist[i] + ":N");
      }
        } else {
      excludeClauseSQL.push(leafabbrev + ":N");
        }
    }

       // this is a remnant of orthomcl-db behavior, allowing
       // parental "any" inclusion without specifying leaves:
       //
       // } else if (state[parent] == 3) { clause[clause.length] =
       //     leafabbrev + ">=1T";
       // }

      }
      var includedStr = 'n/a'; if (includeClause.length > 0) includedStr = includeClause.join(", ");
      $("form[name='questionForm'] input:hidden[name='value(" + includedSpeciesName + ")']").attr('value', includedStr);
      var excludedStr = 'n/a'; if (excludeClause.length > 0) excludedStr = excludeClause.join(", ");
      $("form[name='questionForm'] input:hidden[name='value(" + excludedSpeciesName + ")']").attr('value', excludedStr);

      var bothClauseSQL = includeClauseSQL.concat(excludeClauseSQL);
      $("form[name='questionForm'] input:hidden[name='value(" + profilePatternName + ")']").attr('value',
    bothClauseSQL.length ? "%" + bothClauseSQL.sort().join("%") + "%" : "%");
  }

  function countchildren (parent) {
      var count = 0;
      for (var i = 0 ; i < children[parent].length ; i++) {
    if(children[children[parent][i]].length) {
        count += countchildren(children[parent][i]);
    } else {
        count += 1;
    }
      }
      return count;
  }

  function listchildren (parent) {
      var list = new Array();
      for (var i = 0 ; i < children[parent].length ; i++) {
    if(children[children[parent][i]].length) {
        newlist = listchildren(children[parent][i]);
        for (var j = 0 ; j < newlist.length ; j++) {
      list[list.length] = newlist[j];
        }
    } else {
        list[list.length] = abbrev[children[parent][i]];
    }
      }
      return list;
  }

});
