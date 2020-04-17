/* global Balloon, jQuery, Wdk, apidb */

//********************************************************************************/
// Two configurations available for gene pop-ups:
//
//   1. Shows only the add/remove basket link, skips favorites
var GbrowsePopupConfig = getGbrowsePopupConfig(false, "Basket:", "Add", "Remove");
//
//   2. Shows both basket and favorites links in pop-ups
// var GbrowsePopupConfig = getGbrowsePopupConfig(true, "Save:", "Add to Basket", "Remove from Basket");
//
//********************************************************************************/

function getGbrowsePopupConfig(showFav, saveRowTitle, addBasketText, removeBasketText) {
  var config = new Object();
  config.showFavoriteLinks = showFav;
  config.saveRowTitle = saveRowTitle;
  config.addBasketText = addBasketText;
  config.removeBasketText = removeBasketText;
  return config;
}

/**
 * Record descriptor used for wdkService calls
 */
function createRecordDescriptor(sourceId, projectId) {
  return {
    id: [ { name: 'source_id', value: sourceId }, { name: 'project_id', value: projectId } ],
    recordClassName: 'GeneRecordClasses.GeneRecordClass'
  };
}

/****** Table-building utilities ******/

function table(rows) {
  return '<table border="0">' + rows.join('') + '</table>';
}

function twoColRow(left, right) {
  return '<tr><td>' + left + '</td><td>' + right + '</td></tr>';
}

function fiveColRow(one, two, three, four, five) {
  return '<tr><td>' + one + '</td><td>' + two + '</td><td>' + three + '</td><td>' + four + '</td><td>' + five + '</td></tr>';
}

/****** Favorite link functions for GBrowse ******/

var saveFavTextLink = '<img width="16" src="/a/wdk/images/favorite_gray.gif"/> Add As Favorite';
var removeFavTextLink = '<img width="16" src="/a/wdk/images/favorite_color.gif"/> Remove From Favorites';
var loadingFavTextLink = '<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> <span class="sr-only">Loading...</span>';

function applyCorrectFavoriteLink(sourceId, projectId) {
  window.ebrc.context.wdkService.getFavoriteId(createRecordDescriptor(sourceId, projectId))
    .then(function(favoriteId) {
      var isInFavorites = (favoriteId != null);
      if (isInFavorites) {
        return setSavedItemLink(projectId, sourceId, 'gbfavorite', 'removeGeneAsFavorite', removeFavTextLink);
      }
      else {
        return setSavedItemLink(projectId, sourceId, 'gbfavorite', 'addGeneAsFavorite', saveFavTextLink);
      }
    }).catch(logAndAlert);
}

function addGeneAsFavorite(projectId, sourceId) {
  if (checkLogin()) {
    setSavedItemLink(projectId, sourceId, 'gbfavorite', 'addGeneAsFavorite', loadingFavTextLink);
    window.ebrc.context.wdkService.addFavorite(createRecordDescriptor(sourceId, projectId))
      .then(function() {
        setSavedItemLink(projectId, sourceId, 'gbfavorite', 'removeGeneAsFavorite', removeFavTextLink);
      }).catch(logAndAlert);
  }
}

function removeGeneAsFavorite(projectId, sourceId) {
  if (checkLogin()) {
    setSavedItemLink(projectId, sourceId, 'gbfavorite', 'removeGeneAsFavorite', loadingFavTextLink);
    var service = window.ebrc.context.wdkService;
    service.getFavoriteId(createRecordDescriptor(sourceId, projectId))
      .then(function(favoriteId) {
        if (favoriteId != null) {
          service.deleteFavorite(favoriteId)
            .then(function() {
              setSavedItemLink(projectId, sourceId, 'gbfavorite', 'addGeneAsFavorite', saveFavTextLink);
            });
        }
      }).catch(logAndAlert);
  }
}


/****** Basket link functions for GBrowse ******/

var saveBasketTextLink = '<img width="16" src="/a/wdk/images/basket_gray.png"/> ' + GbrowsePopupConfig.addBasketText;
var removeBasketTextLink = '<img width="16" src="/a/wdk/images/basket_color.png"/> ' + GbrowsePopupConfig.removeBasketText;
var loadingBasketTextLink = '<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> <span class="sr-only">Loading...</span>';

function applyCorrectBasketLink(sourceId, projectId) {
  var record = createRecordDescriptor(sourceId, projectId);
  window.ebrc.context.wdkService.getBasketStatus(record.recordClassName, [record])
    .then(function(isInBasketArray) {
      if (isInBasketArray[0]) {
        setSavedItemLink(projectId, sourceId, 'gbbasket', 'removeGeneFromBasket', removeBasketTextLink);
      }
      else {
        setSavedItemLink(projectId, sourceId, 'gbbasket', 'addGeneToBasket', saveBasketTextLink);
      }
    }).catch(logAndAlert);
}

function addGeneToBasket(projectId, sourceId) {
  if (checkLogin()) {
    setSavedItemLink(projectId, sourceId, 'gbbasket', 'addGeneToBasket', loadingBasketTextLink);
    var record = createRecordDescriptor(sourceId, projectId);
    window.ebrc.context.wdkService.updateBasketStatus(true, record.recordClassName, [record])
      .then(function() {
        setSavedItemLink(projectId, sourceId, 'gbbasket', 'removeGeneFromBasket', removeBasketTextLink);
      }).catch(logAndAlert);
  }
}

function removeGeneFromBasket(projectId, sourceId) {
  if (checkLogin()) {
    setSavedItemLink(projectId, sourceId, 'gbbasket', 'removeGeneFromBasket', loadingBasketTextLink);
    var record = createRecordDescriptor(sourceId, projectId);
    window.ebrc.context.wdkService.updateBasketStatus(false, record.recordClassName, [record])
      .then(function() {
        setSavedItemLink(projectId, sourceId, 'gbbasket', 'addGeneToBasket', saveBasketTextLink);
      }).catch(logAndAlert);
  }
}


/****** Utility link functions for GBrowse ******/

function logAndAlert(error) {
  console.error(error);
  alert('Unable to complete the action.');
}

function isGuestUser() {
  var user = window.ebrc.context.store.getState().globalData.user;
  if (user == null) {
    console.warn('Cannot find current user. Assuming user is guest.');
    return false;
  }
  return user.isGuest;
}

function checkLogin() {
  var isGuest = isGuestUser();
  if (isGuest) {
    // Balloon is not used on gene pages
    if ('Balloon' in window) Balloon.prototype.hideTooltip(1);
    window.ebrc.context.store.dispatch(Wdk.Actions.UserSessionActions.showLoginForm())
  }
  return !isGuest;
}

function setSavedItemLink(projectId, sourceId, selectionSuffix, nextFunction, nextLinkText) {
  jQuery('#' + sourceId + '_' + selectionSuffix).html(
    '<button' +
      ' type="button"' +
      ' onclick="' + nextFunction + '(\'' + projectId + '\',\'' + sourceId + '\')"' +
      ' style="width: 105px">' + nextLinkText + '</button>');
}

function getSaveRowLinks(projectId, sourceId) {
  var saveRowLinks;
  var isGuest = isGuestUser();
  if (!isGuest) {
    // enable saving as favorite or to basket
    var favoriteLink = "<span id=\"" + sourceId + "_gbfavorite\"><button style=\"width: 105px\" type=\"button\" onclick=\"addGeneAsFavorite('" + projectId + "','" + sourceId + "');\">" + loadingFavTextLink + "</button></span>";
    var basketLink = "<span id=\"" + sourceId + "_gbbasket\"><button style=\"width: 105px\" type=\"button\" onclick=\"addGeneToBasket('" + projectId + "','" + sourceId + "');\">" + loadingBasketTextLink + "</button></span>";

    if (GbrowsePopupConfig.showFavoriteLinks) {
      saveRowLinks = favoriteLink + " | " + basketLink;
      // now set appropriate links based on whether gene is already in basket/favorites
      applyCorrectBasketLink(sourceId, projectId);
      applyCorrectFavoriteLink(sourceId, projectId);
    } else {
      // only show basket link
      saveRowLinks = basketLink;
      applyCorrectBasketLink(sourceId, projectId);
    }

  } else {
    // prompt user to log in if he wants to to save genes
    saveRowLinks = "<a onclick=\"checkLogin()\" href=\"javascript:void(0)\">Log in</a> to save genes.";
  }
  return saveRowLinks;
}


/****** Pop-up functions for various record types ******/

// Gene title
function gene_title (tip, projectId, sourceId, chr, loc, soTerm, product, taxon, utr, gbLinkParams, orthomcl, geneId, baseUrl, baseRecordUrl, aaseqid ) {

  // In ToxoDB, sequences of alternative gene models have to be returned
  var ignore_gene_alias = 0;
  if (projectId == 'ToxoDB') {
    ignore_gene_alias = 1;
  }

  // expand minimalist input data
  var cdsLink = "<a href='" + baseUrl + "/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences' target='_blank'>CDS</a>"
  var proteinLink = "<a href='" + baseUrl + "/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&endAnchor3=End&go=Get+Sequences' target='_blank'>protein</a>"
  var recordLink = '<a href="' + baseRecordUrl + '/app/record/gene/' + geneId + '">Gene Page</a>';
  var gbLink = "<a href='" + baseUrl + "/cgi-bin/gbrowse/" + projectId.toLowerCase() + "/?" + gbLinkParams + "'>GBrowse</a>";
  var orthomclLink = "<a href='https://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=" + orthomcl + "'>" + orthomcl + "</a>";

  // format into html table rows
  var rows = new Array();
    if (taxon != '') {rows.push(twoColRow('Species:', taxon))};
    if (sourceId != '') { rows.push(twoColRow('ID:', sourceId))};
    if (geneId != '') { rows.push(twoColRow('Gene ID:', geneId))};
    if (soTerm != '') { rows.push(twoColRow('Gene Type:', soTerm))};
    if (product != '') { rows.push(twoColRow('Description:', product))};

  var exon_or_cds = 'Exon:';

  if (soTerm =='Protein Coding') {
    exon_or_cds = 'CDS:';
  }

  if (loc != '') {
    rows.push(twoColRow(exon_or_cds, loc)) ;
  }
  if(utr != '') {
    rows.push(twoColRow('UTR:', utr));
  }
  // TO FIX for GUS4
  //  rows.push(twoColRow(GbrowsePopupConfig.saveRowTitle, getSaveRowLinks(projectId, sourceId)));
  if (soTerm =='Protein Coding' && aaseqid) {
    rows.push(twoColRow('Download:', cdsLink + " | " + proteinLink));
    if ( orthomcl != '') {
      rows.push(twoColRow('OrthoMCL', orthomclLink));
    }
  }
    if (geneId != '') { rows.push(twoColRow('Links:', gbLink + " | " + recordLink))};

  //tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'Annotated Gene ' + sourceId;
  return table(rows);
}


// Gene title
function gene_title_gff (tip, projectId, sourceId, chr, loc, soTerm, product, taxon, utr, gbLinkParams, orthomcl, geneId, baseUrl, baseRecordUrl, aaseqid, samples, scores, totScore, fiveSample, fiveUtr, fiveScore, threeSample, threeUtr, threeScore) {

  // In ToxoDB, sequences of alternative gene models have to be returned
  var ignore_gene_alias = 0;
  if (projectId == 'ToxoDB') {
    ignore_gene_alias = 1;
  }

  // expand minimalist input data
  var cdsLink = "<a href='" + baseUrl + "/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences' target='_blank'>CDS</a>"
  var proteinLink = "<a href='" + baseUrl + "/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&endAnchor3=End&go=Get+Sequences' target='_blank'>protein</a>"
  var recordLink = '<a href="' + baseRecordUrl + '/app/record/gene/' + geneId + '">Gene Page</a>';
  var gbLink = "<a href='" + baseUrl + "/cgi-bin/gbrowse/" + projectId.toLowerCase() + "/?" + gbLinkParams + "'>GBrowse</a>";
  var orthomclLink = "<a href='https://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=" + orthomcl + "'>" + orthomcl + "</a>";

  // format into html table rows
  var rows = new Array();
    if (taxon != '') {rows.push(twoColRow('Species:', taxon))};
    if (sourceId != '') { rows.push(twoColRow('ID:', sourceId))};
    if (totScore != '') { rows.push(twoColRow('Score:', totScore))};
    if (geneId != '') { rows.push(twoColRow('Gene ID:', geneId))};
    if (soTerm != '') { rows.push(twoColRow('Gene Type:', soTerm))};
    if (product != '') { rows.push(twoColRow('Description:', product))};

  var exon_or_cds = 'Exon:';

  if (soTerm =='Protein Coding') {
    exon_or_cds = 'CDS:';
  }

  if (loc != '') {
    rows.push(twoColRow(exon_or_cds, loc)) ;
  }
  if(utr != '') {
    rows.push(twoColRow('UTR:', utr));
  }
  // TO FIX for GUS4
  //  rows.push(twoColRow(GbrowsePopupConfig.saveRowTitle, getSaveRowLinks(projectId, sourceId)));
  if (soTerm =='Protein Coding' && aaseqid) {
    rows.push(twoColRow('Download:', cdsLink + " | " + proteinLink));
    if ( orthomcl != '') {
      rows.push(twoColRow('OrthoMCL', orthomclLink));
    }
  }
    if (geneId != '') { rows.push(twoColRow('Links:', gbLink + " | " + recordLink))};

    //samples and scores for models
    if (samples != '') { rows.push(twoColRow('Samples:', samples))};
    if (scores != '') { rows.push(twoColRow('Scores:', scores))};
    if (fiveSample != '') { rows.push(twoColRow('5\' UTR Samples:', fiveSample))};
    if (fiveUtr != '') { rows.push(twoColRow('5\' UTR Locations:', fiveUtr))};
    if (fiveScore != '') { rows.push(twoColRow('5\' UTR Scores:', fiveScore))};
    if (threeSample != '') { rows.push(twoColRow('3\' UTR Samples:', threeSample))};
    if (threeUtr != '') { rows.push(twoColRow('3\' UTR Locations:', threeUtr))};
    if (threeScore != '') { rows.push(twoColRow('3\' UTR Scores:', threeScore))};
    

  //tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'Annotated Gene ' + sourceId;
  return table(rows);
}

// EST title
function est (tip, paramsString) {
  // split paramsString on asterisk (to avoid library name characters)
  var v = new Array();
  v = paramsString.split('*');

  var ACCESSION = 0;
  var START = ACCESSION + 1;
  var STOP = START + 1;
  var PERC_IDENT = STOP + 1;
  var LIB =  PERC_IDENT + 1;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Accession:', v[ACCESSION]));
  rows.push(twoColRow('Location:', v[START] + "-" + v[STOP]));
  rows.push(twoColRow('Identity:', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Library:', v[LIB]));

  tip.T_TITLE = 'EST ' + v[ACCESSION];
  return table(rows);
}


// Syntetic Gene title
function syn_gene_title (tip, projectId, sourceId, taxon, geneType, desc, location, gbLinkParams, orthomcl, baseRecordUrl) {

  var gbLink = '<a href="../../../../cgi-bin/gbrowse/' + projectId.toLowerCase() + '/?' + gbLinkParams + '">GBrowse</a>';
  var recordLink = '<a href="' + baseRecordUrl + '/app/record/gene/' + sourceId + '">Gene Page</a>';

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Gene:', sourceId));
  rows.push(twoColRow('Species:', taxon));
  rows.push(twoColRow('Gene Type:', geneType));
  rows.push(twoColRow('Description:', desc));
  rows.push(twoColRow('Location:', location));
  rows.push(twoColRow(GbrowsePopupConfig.saveRowTitle, getSaveRowLinks(projectId, sourceId)));
  rows.push(twoColRow('Links:', gbLink + ' | ' + recordLink));

  if (geneType =='Protein Coding') {
    rows.push(twoColRow('OrthoMCL', orthomcl));
  }


  tip.T_TITLE = 'Syntenic Gene: ' + sourceId;
  return table(rows);
}

// BLAST title
function blt (tip, paramsString) {
  // split paramsString on asterisk (to avoid defline characters)
  var v = new Array();
  v = paramsString.split('*');

  var ACCESSION = 0;
  var DEFLINE = ACCESSION + 1;
  var START = DEFLINE + 1;
  var STOP = START + 1;
  var PERC_IDENT = STOP + 1;
  var EXPECT = PERC_IDENT + 1;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Accession:', "gi|" + v[ACCESSION]));
  rows.push(twoColRow('Description:', v[DEFLINE]));
  rows.push(twoColRow('Location:', v[START] + "-" + v[STOP]));
  rows.push(twoColRow('Identity:', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Positive:', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Expect:', v[EXPECT]));

  tip.T_TITLE = 'BLASTX: ' + "gi|" + v[ACCESSION];
  return table(rows);
}


// SNP Title
function pst (tip, paramsString) {
  // split paramsString on ampersand
  var v = new Array();
  v = paramsString.split('&');

  var revArray = new Array();
  revArray['A'] = 'T';
  revArray['C'] = 'G';
  revArray['T'] = 'A';
  revArray['G'] = 'C';

  var POS_IN_CDS     = 0;
  var POS_IN_PROTEIN = POS_IN_CDS + 1;
  var REF_STRAIN     = POS_IN_PROTEIN + 1;
  var REF_AA         = REF_STRAIN + 1;
  var REVERSED       = REF_AA + 1;
  var REF_NA         = REVERSED + 1;
  var SOURCE_ID      = REF_NA + 1;
  var VARIANTS       = SOURCE_ID + 1;
  var START          = VARIANTS + 1;
  var GENE           = START + 1;
  var IS_CODING      = GENE + 1;
  var NON_SYN        = IS_CODING + 1;
  var WEBAPP         = NON_SYN + 1;

  // expand minimalist input data
  var link = "<a href=/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[SOURCE_ID] + ">" + v[SOURCE_ID] + "</a>";

  var type = 'Non-coding';
  var refNA = (v[REVERSED] == '1')? revArray[v[REF_NA]] : v[REF_NA];
  var refAAString = '';
  if (v[IS_CODING] == 'yes') {
    var non = (v[NON_SYN] == 'yes')? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[REF_AA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', v[START]));
  if (v[GENE] != '') rows.push(twoColRow('Gene', v[GENE]));
  if (v[IS_CODING] == 'yes') {
    rows.push(twoColRow('Position&nbsp;in&nbsp;CDS', v[POS_IN_CDS]));
    rows.push(twoColRow('Position&nbsp;in&nbsp;protein', v[POS_IN_PROTEIN]));
  }
  rows.push(twoColRow('Type', type));
  rows.push(twoColRow(v[REF_STRAIN] + '&nbsp;(reference)', 'NA=' + refNA + refAAString));

  // make one row per SNP allele
  var variants = new Array();
  variants = v[VARIANTS].split('|');
  for (var i=0; i<variants.length; i++) {
    var variant = new Array();
    variant = variants[i].split(':');
    var strain = variant[0];
    if (strain == v[REF_STRAIN]) continue;
    var na = variant[1];
    if (v[REVERSED] == '1') na = revArray[na];
    var aa = variant[2];
    var info =
      'NA=' + na + ((v[IS_CODING] == 'yes')? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    rows.push(twoColRow(strain, info));
  }

  //  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows);
}


// htsSNP Title
function htspst (tip, paramsString) {
  // split paramsString on ampersand
  var v = new Array();
  v = paramsString.split('&');

  var revArray = new Array();
  revArray['A'] = 'T';
  revArray['C'] = 'G';
  revArray['T'] = 'A';
  revArray['G'] = 'C';

  var POS_IN_CDS     = 0;
  var POS_IN_PROTEIN = POS_IN_CDS + 1;
  var REF_STRAIN     = POS_IN_PROTEIN + 1;
  var REF_AA         = REF_STRAIN + 1;
  var REVERSED       = REF_AA + 1;
  var REF_NA         = REVERSED + 1;
  var SOURCE_ID      = REF_NA + 1;
  var VARIANTS       = SOURCE_ID + 1;
  var START          = VARIANTS + 1;
  var GENE           = START + 1;
  var IS_CODING      = GENE + 1;
  var NON_SYN        = IS_CODING + 1;
  var WEBAPP         = NON_SYN + 1;

  // expand minimalist input data
  var link = "<a href=/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[SOURCE_ID] + ">" + v[SOURCE_ID] + "</a>";

  var type = 'Non-coding';
  var refNA = (v[REVERSED] == '1')? revArray[v[REF_NA]] : v[REF_NA];
  var refAAString = '';
  if (v[IS_CODING] == 'yes') {
    var non = (v[NON_SYN] == 'yes')? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[REF_AA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', v[START]));
  if (v[GENE] != '') rows.push(twoColRow('Gene', v[GENE]));
  if (v[IS_CODING] == 'yes') {
    rows.push(twoColRow('Position&nbsp;in&nbsp;CDS', v[POS_IN_CDS]));
    rows.push(twoColRow('Position&nbsp;in&nbsp;protein', v[POS_IN_PROTEIN]));
  }
  rows.push(twoColRow('Type', type));

  var strains = new Array();
  strains.push(fiveColRow('<b>Strain</b>','<b>Allele</b>','<b>Product</b>','<b>Coverage</b>','<b>Allele&nbsp;%</b>'));
  strains.push(fiveColRow(v[REF_STRAIN] + '&nbsp;(reference)',refNA,v[REF_AA],'&nbsp;','&nbsp;'));
  // make one row per SNP allele
  var variants = new Array();
  variants = v[VARIANTS].split('|');
  for (var i=0; i<variants.length; i++) {
    var variant = new Array();
    variant = variants[i].split('::');
    var strain = variant[0];
    if (strain == v[REF_STRAIN]) continue;
    var na = variant[1];
    if (v[REVERSED] == '1') na = revArray[na];
    var aa = variant[2];
    var info =
      'NA=' + na + ((v[IS_CODING] == 'yes')? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    strains.push(fiveColRow(strain, na, (v[IS_CODING] == 'yes') ? aa : '&nbsp;',variant[3],variant[4]));
  }

  //  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows) + table(strains);
}
