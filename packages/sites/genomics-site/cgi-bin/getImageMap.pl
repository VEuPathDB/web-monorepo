#!/usr/bin/perl -w

use strict;

use GD;
use CGI;
use CGI::Carp qw(fatalsToBrowser set_message);
use Data::Dumper;
use IO::File;
use CBIL::Util::PropertySet;
use DBD::Oracle qw(:ora_types);
use ApiCommonWebsite::Model::ModelConfig;

#------------------------------------------------------------------------------
BEGIN {
    # Carp callback for sending fatal messages to browser
    sub handle_errors {
        my $msg = shift;
        print "<h3>Oops</h3>";
        print "<p>Got an error: <pre>$msg</pre>";
    }
    set_message(\&handle_errors);
}

my $q = new CGI;
my $projectId = $q->param('model');
my $pathwaySourceId = $q->param('pathway');
my $geneList = $q->param('geneList');
my $compoundList = $q->param('compoundList');

die "valid project_id is required\nUsage\tperl\t\tcolorKEGGmap.pl\t\t<model>\t\t<mapSourceId>\t\t<geneList> (comma separated - Optional)\t\t<compoundList> (comma separated - Optional)\n" if (!$projectId);
die "valid pathway_source_id is required\nUsage\tperl\t\tcolorKEGGmap.pl\t\t<model>\t\t<mapSourceId>\t\t<geneList> (comma separated - Optional)\t\t<compoundList> (comma separated - Optional)\n" if (!$pathwaySourceId);

my ($appendSQL, $appendCmpdSQL);

if ($geneList) {
  $geneList =~ s/,/','/g;
  $geneList = "'$geneList'";
  $appendSQL = "AND ga.source_id in ($geneList) AND";
} else {
  $appendSQL = "AND";
}

if ($compoundList) {
  $compoundList =~ s/,/','/g;
  $compoundList = "'$compoundList'";
  $appendCmpdSQL = "AND pn.display_label in ($compoundList) AND";
} else {
  $appendCmpdSQL = "AND";
}

#-----MODEL PROPS TO MAKE DB CONNECTION -----#

my $c = new ApiCommonWebsite::Model::ModelConfig($projectId);

my $dbh = DBI->connect($c->getDbiDsn,$c->getLogin,$c->getPassword,
                       { PrintError => 1,
                         RaiseError => 0
                       } ) or die "Can't connect to the database: $DBI::errstr\n";


my $ecMapSql = "SELECT DISTINCT p.source_id as source_id,  ec.ec_number as display_label, ec.description,
                       (pn.x - (pn.width/2)) as x1, (pn.y - (pn.height/2)) as y1,
                       (pn.x + (pn.width/2)) as x2, (pn.y + (pn.height/2)) as y2,
                       apidb.tab_to_string(set(cast(COLLECT(ga.organism) AS apidb.varchartab)), ', ') as organisms,
                       apidb.tab_to_string(set(cast(COLLECT(ga.source_id) AS apidb.varchartab)), ', ') as genes
                FROM    ApidbTuning.GenomicSequence gs,
                       dots.Transcript t, dots.translatedAaFeature taf,apidb.pathway p, apidb.pathwaynode pn,
                       dots.aaSequenceEnzymeClass asec, sres.enzymeClass ec,ApidbTuning.GeneAttributes ga
                WHERE  gs.na_sequence_id = ga.na_sequence_id  $appendSQL ga.na_feature_id = t.parent_id
                AND    t.na_feature_id = taf.na_feature_id
                AND    taf.aa_sequence_id = asec.aa_sequence_id
                AND    asec.enzyme_class_id = ec.enzyme_class_id
                AND    p.pathway_id = pn.parent_id
                AND    ec.ec_number = pn.display_label
                AND    p.source_id = '$pathwaySourceId'
                group by p.source_id, ec.ec_number, ec.description, pn.x, pn.y,pn.width, pn.height";

my $sth = $dbh->prepare($ecMapSql);
$sth->execute;


print "Content-type: text/html\n\n"; 

while (my $ecMap = $sth->fetchrow_hashref()) {

  my $popUp = "<table>".
                "<tr>".
                  "<td>EC No:</td>".
                  "<td><a href=\"processQuestion.do?questionFullName=GeneQuestions.InternalGenesByEcNumber&array%28organism%29=all&array%28ec_number_pattern%29=".$$ecMap{'DISPLAY_LABEL'}."&questionSubmit=Get+Answer\">".$$ecMap{'DISPLAY_LABEL'} . " (" . $$ecMap{'DESCRIPTION'} .")</a></td>".
                 
                "</tr><tr>".
                  "<td>Organisms:</td>".
                  "<td>".$$ecMap{'ORGANISMS'}."</td>".
                "</tr><tr>".
                  "<td>Genes:</td>".
                  "<td>".$$ecMap{'GENES'}."</td>".
                "</tr>".
              "</table>";

  print "<area shape='rect' coords='$$ecMap{'X1'},$$ecMap{'Y1'},$$ecMap{'X2'},$$ecMap{'Y2'}' alt='$popUp'>\n";
}


my $cpdLabelSql = "Select p.source_id, pc.compound_source_id,
                     pn.display_label, pn.x, pn.y, pn.height as radius 
              From   ApiDB.Pathway p, ApiDB.PathwayNode pn, ApiDBTuning.PathwayCompounds pc
              Where  p.pathway_id = pn.parent_id
              And    pn.pathway_node_type_id = 2 $appendCmpdSQL pn.display_label = pc.compound
              AND    p.source_id = '$pathwaySourceId'";

$sth = $dbh->prepare($cpdLabelSql);
$sth->execute;

while (my $cpdMap = $sth->fetchrow_hashref()) {
  
  my $popUp = "<table><tr><td>Compound:  </td><td><a href=\"showRecord.do?name=CompoundRecordClasses.CompoundRecordClass\&source_id=".$$cpdMap{'COMPOUND_SOURCE_ID'}."\&project_id=".$projectId."\">".$$cpdMap{'DISPLAY_LABEL'}."</a></td></tr></table>";

  print "<area shape='circle'  coords='$$cpdMap{'X'},$$cpdMap{'Y'},$$cpdMap{'RADIUS'}' alt='$popUp'>\n"; 
}


