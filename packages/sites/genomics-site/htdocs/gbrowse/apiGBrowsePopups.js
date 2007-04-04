function table (rows) {
  return '<table border=0>' + rows.join('') + '</table>';
}

function twoColRow(left, right) {
  return '<tr><td>' + left + '</td><td>' + right + '</td></tr>';
}

// plasmodb Gene title
function pgt (tip, paramsString) {
  // split paramsString on comma
  var v = new Array();
  v = paramsString.split(',');

  const SOURCE_ID = 0;
  const CHR = SOURCE_ID + 1;
  const LOC = CHR + 1;
  const SO_TERM =  LOC + 1;
  const PRODUCT = SO_TERM + 1;
  const TAXON = PRODUCT + 1;
  const IS_PSEUDO =  TAXON + 1;

  // expand minimalist input data
  var cdsLink = "<a href=../../../cgi-bin/geneSrt?ids=" + v[SOURCE_ID]
        + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences target=_blank>CDS</a>"
  var proteinLink = "<a href=../../../cgi-bin/geneSrt?ids=" + v[SOURCE_ID]
        + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences target=_blank>protein</a>"

  var type = v[IS_PSEUDO] == '1'? v[SO_TERM] : v[SO_TERM] + " (pseudogene)";	
  var download = cdsLink + " | " + proteinLink;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Species:', v[TAXON]));
  rows.push(twoColRow('ID', v[SOURCE_ID]));
  rows.push(twoColRow('Gene Type', type));
  rows.push(twoColRow('Description', v[PRODUCT]));
  rows.push(twoColRow('Location', v[LOC]));
  rows.push(twoColRow('Download', download)); 

  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'Annotated Gene ' + v[SOURCE_ID];
  return table(rows);
}


// PlasmoDB SNP Title
function pst (tip, paramsString) {
  // split paramsString on comma
  var v = new Array();
  v = paramsString.split(',');

  var revArray = new Array();
  revArray['A'] = 'T';
  revArray['C'] = 'G';
  revArray['T'] = 'A';
  revArray['G'] = 'C';

  const IS_CODING     = 0;
  const POS_IN_CDS     = IS_CODING + 1;
  const POS_IN_PROTEIN = POS_IN_CDS + 1; 
  const REF_STRAIN    = POS_IN_PROTEIN + 1; 
  const REF_AA        = REF_STRAIN + 1; 
  const GENE         = REF_AA + 1; 
  const REVERSED     = GENE + 1; 
  const REF_NA        = REVERSED + 1; 
  const NON_SYN       = REF_NA + 1; 
  const SOURCE_ID     = NON_SYN + 1; 
  const VARIANTS     = SOURCE_ID + 1; 
  const START        = VARIANTS + 1;

  // expand minimalist input data
  var link = "<a href=/plasmo/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[SOURCE_ID] + ">" + v[SOURCE_ID] + "</a>";
 
  var type = 'Non-coding';
  var refNA = v[REVERSED]? revArray[v[REF_NA]] : v[REF_NA];
  var refAAString = '';
  if (v[IS_CODING] == '1') {
    var non = v[NON_SYN]? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[REF_AA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', v[START]));
  if (v[GENE] != '') rows.push(twoColRow('Gene', v[GENE]));
  if (v[IS_CODING]] == '1') {
    rows.push(twoColRow('Position in CDS', v[POS_IN_CDS]));
    rows.push(twoColRow('Position in Protein', v[POS_IN_PROTEIN]));
  }
  rows.push(twoColRow('Type', type));
  rows.push(twoColRow(v[REF_STRAIN] + ' (reference)', 'NA=' + refNA + refAAString));  

  // make one row per SNP allele
  var variants = new Array();
  variants = v[VARIANTS].split('|');
  for (var i=0; i<variants.length; i++) {
    var variant = new Array();
    variant = variants[i].split(':');
    var strain = variant[0];
    var na = variant[1];
    if (v[REVERSED] == '1') na = revArray[na]; 
    var aa = variant[2];
    var info = 
     'NA=' + na + (v[IS_CODING]? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    rows.push(twoColRow(strain, info));    
  }

  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows);
}
