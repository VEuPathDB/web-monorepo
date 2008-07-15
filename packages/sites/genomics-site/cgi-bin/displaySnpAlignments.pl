#!/usr/bin/perl

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser set_message);
use GUS::ObjRelP::DbiDatabase;
use ApiCommonWebsite::Model::ModelConfig;

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
$q->param('project_id') or die "valid 'project_id' is required";

my $snpId = $q->param('snpId') || $ARGV[0];
my $width = $q->param('width') || $ARGV[1]; # width of window on each side of SNP

my $c = new ApiCommonWebsite::Model::ModelConfig( $q->param('project_id') );
my $db = new GUS::ObjRelP::DbiDatabase(
    $c->getDbiDsn,
    $c->getLogin,
    $c->getPassword,
    0,1,undef,'core');
my $dbh = $db->getQueryHandle(0);


my @strains = ("3D7", "106_1", "7G8", "D10", "D6", "Dd2", "FCB", "FCC-2", "FCR3", "HB3", "K1", "Malayan", "RO-33", "SantaLucia", "Senegal3101", "Senegal3404", "Senegal3504", "Senegal5102", "V1_S");

my ($chrNum, $snpLocation) = getParams($snpId);
my %is_snpLocation = getSnpLocations($chrNum, $snpLocation, $width);
my $srcId;

print "Content-type: text/html\n\n";
print '<pre>';

foreach my $str (sort @strains) {
  $srcId = $str ."." . $chrNum;  # as '3D7.5' for example

  my $sql = "select source_id,substr(sequence,$snpLocation-$width,2*$width) from dots.nasequence where source_id = '$srcId'";
  my $stmt = $dbh->prepareAndExecute($sql);

  my %seqs;
  while(my ($sourceId,$sequence) = $stmt->fetchrow_array()) {
    $seqs{$sourceId} = $sequence;
  }

  foreach my $s (keys %seqs){
    my @bases = split('', $seqs{$s});

    if ($seqs{$s}=~/[ACGT]/) {
      for(my $i = 0; $i <$width*2; $i++) {
	if ($is_snpLocation{$i+$snpLocation-$width} && $bases[$i]=~ /[ACGT]/ ) {
	  $bases[$i] = "<font color=\"#FF1800\">$bases[$i]</font></b>";   # color red for SNP positions
	}
	print $bases[$i];
      }
      print "  $str<BR>";
    }
  }

}
print '</pre>';


# returns chromosome number and snp location
sub getParams{
  my ($snpSrcId) = @_;
#  my $sql = "select seq_source_id, start_min from apidb.snpattributes where source_id ='$snpSrcId'";
  my $sql = "select pfl.seq_source_id, pfl.old_location from apidb.PlasmoPfalLocations pfl, apidb.snpattributes sa where sa.source_id ='$snpSrcId' and sa.start_min=pfl.new_location and pfl.seq_source_id=sa.seq_source_id";

  my $stmt = $dbh->prepareAndExecute($sql);
  my ($srcId,$start) = $stmt->fetchrow_array();
  $srcId =~s/MAL//;  #put test to check integer found

  return ($srcId, $start);
}

# returns all SNP locations
sub getSnpLocations{
  my ($srcId, $start, $width) = @_;
  $srcId = 'MAL'.$srcId;
  my @locations;

  my $sql = "select distinct(start_min) from apidb.snpattributes where seq_source_id='$srcId' and start_min > ($start-$width) and start_min < ($start+$width) order by start_min";

  my $stmt = $dbh->prepareAndExecute($sql);
  while(my ($loc) = $stmt->fetchrow_array()){
    push(@locations,$loc);
  }
  #inverting array for speedy lookup
  my %is_snpLocation = ();
  for (@locations) { $is_snpLocation{$_} = 1; }

  return (%is_snpLocation);
}
