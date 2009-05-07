function table (rows) {
  return '<table border=0>' + rows.join('') + '</table>';
}

function twoColRow(left, right) {
  return '<tr><td>' + left + '</td><td>' + right + '</td></tr>';
}



function popup_text () {
  var items = popup_text.arguments.length;

  var tip = popup_text.arguments[0];
  var name = popup_text.arguments[1];

  var rows = new Array();

  // The first value is the name... the following values are in sets of 2
  // (name, header_0, value_0, header_1, value_1, ....)
  for (i = 2;i < items; i++) {
    var rowHeader = popup_text.arguments[i];
    i++;
    var rowValue = popup_text.arguments[i];
    rows.push(twoColRow(rowHeader, rowValue));
  }

  tip.T_TITLE = name;
  return table(rows);
}


// Gene title
function gene_title (tip, projectId, sourceId, chr, loc, soTerm, product, taxon, isPseudo) {

  // expand minimalist input data
  var cdsLink = "<a href=../../../cgi-bin/geneSrt?project_id=" + projectId
        + "&ids=" + sourceId
        + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences target=_blank>CDS</a>"
  var proteinLink = "<a href=../../../cgi-bin/geneSrt?project_id=" + projectId
        + "&ids=" + sourceId
        + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences target=_blank>protein</a>"

  var type = (isPseudo == '1')? soTerm + " (pseudogene)" : soTerm;
  var download = cdsLink + " | " + proteinLink;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Species:', taxon));
  rows.push(twoColRow('ID', sourceId));
  rows.push(twoColRow('Gene Type', type));
  rows.push(twoColRow('Description', product));
  rows.push(twoColRow('Location', loc));
  rows.push(twoColRow('Download', download)); 

//  tip.T_BGCOLOR = 'lightskyblue';
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


