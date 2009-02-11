#!/usr/bin/perl

use strict;
use Getopt::Long;

my @organisms;  # array of organisms for which gbrowse conf file is to be made
my %examples;   # hash of examples for each organisms

my ($model);
&GetOptions("model=s"=> \$model);

#get params from config file
my $outDir   = "$ENV{GUS_HOME}/../conf/gbrowse.conf/";
my $confFile = $outDir . "gbrowseOrganisms.params";

open(FILE,"$confFile") || die "Unable to open input file $confFile\n";
while (<FILE>) {
  # get  organism list
  if ($_ =~/$model\.organisms\=(.*)/){
    chomp;
    my $orgs = $1;
    @organisms = split(/,/, $orgs);
  }
  # gather examples for all organisms
  if ($_ =~/examples\.(.*)\=(.*)/){
    $examples{$1} = $2;
  }
}
close(FILE);


$model =~ tr/[A-Z]/[a-z]/;
my $inFile = $outDir . $model . ".conf";

foreach my $organism (@organisms){
  my $outFile = $outDir . $organism .'.conf';

  open(IN,"$inFile") || die "Unable to open input file $inFile\n";
  open(OUT,">$outFile") || die "Unable to open output file $outFile\n";

  my $flag = 1;
  my $setTitle = 0;

  while (<IN>) {
    # set the data source name
    if (!$setTitle &&  ($_ =~/^description/)) {
      chomp $_;
      $_ .= " - $organism \n";
      $setTitle = 1;
    }

    # revise examples 
    if ($_ =~/^examples =/){
      if ($examples{$organism}) {
	print (OUT 'examples =' . $examples{$organism}) ;
      } else {
	print (OUT $_);   # if no examples in params file, use input file
      }
      next;
    }

    # extract track configuration depending on organism
    if ($_ =~/filterOrganism=/) {
      $flag = 0;
      if ($_ =~/$organism/) {
	$flag = 1 if ($_ =~/$organism/);
      } else {
	$flag=0;
      }
    }
    print (OUT $_) if ($flag);
  }
  print "made: $outFile\n";
}
close(IN);
close(OUT);
