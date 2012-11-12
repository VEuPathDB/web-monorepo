#!/usr/bin/perl -w

use strict;

use GD;
use Switch;
use Data::Dumper;
use IO::File;
use CBIL::Util::PropertySet;
use DBD::Oracle qw(:ora_types);
use ApiCommonWebsite::Model::ModelConfig;
use ApiCommonData::Load::TuningConfig::Utils;

#------------------------------------------------------------------------------
if (!@ARGV) {
die "Usage\tperl\t\tcolorKEGGmap.pl\t\t<model>\t\t<mapSourceId>\n";
}


my $model = $ARGV[0];
my $c = new ApiCommonWebsite::Model::ModelConfig($model);
my $dbh = DBI->connect($c->getDbiDsn,$c->getLogin,$c->getPassword,
                       { PrintError => 1,
                         RaiseError => 0
                       } ) or die "Can't connect to the database: $DBI::errstr\n";



my $pathwaySourceId = $ARGV[1];

my $ecMapSql = "SELECT DISTINCT ec.ec_number,apidb.tab_to_string(set(cast(COLLECT(gf.organism) AS apidb.varchartab))) as organisms,
                       pn.x, pn.y,pn.width, pn.height
                FROM   apidbTuning.GeneAttributes gf, ApidbTuning.GenomicSequence gs,
                       dots.Transcript t, dots.translatedAaFeature taf,apidb.pathway p, apidb.pathwaynode pn,
                       dots.aaSequenceEnzymeClass asec, sres.enzymeClass ec,ApidbTuning.GeneAttributes ga
                WHERE  gs.na_sequence_id = gf.na_sequence_id
                AND    ga.source_id = gf.source_id
                AND    gf.na_feature_id = t.parent_id
                AND    t.na_feature_id = taf.na_feature_id
                AND    taf.aa_sequence_id = asec.aa_sequence_id
                AND    asec.enzyme_class_id = ec.enzyme_class_id
                AND    p.pathway_id = pn.parent_id
                AND    ec.ec_number = pn.display_label
                AND    p.source_id = '$pathwaySourceId'
                group by ec.ec_number, pn.x, pn.y,pn.width, pn.height";
 
my $sth=$dbh->prepare($ecMapSql);
$sth->execute;

my $ecOrganismMap;

while (my $ecMap = $sth->fetchrow_hashref()) {
  my $ecNumber = $$ecMap{'EC_NUMBER'};
  chomp $ecNumber;

  my @organisms = split(/,/,$$ecMap{'ORGANISMS'});
  my (@r, @g, @b);
  
  foreach my $org (@organisms){ 
    switch ($org) {
       case /falciparum 3D7/       {push @r,238 ; push @g, 203 ; push @b,173}
       case /vivax SaI-1/          {push @r,135   ; push @g, 206 ; push @b,250}
       case /falciparum IT/        {push @r,102 ; push @g, 205 ; push @b,170}
       case /cynomolgi strain B/   {push @r,244 ; push @g,164 ; push @b,96}
       case /yoelii yoelii YM/     {push @r,233 ; push @g, 150 ; push @b,122}
       case /berghei ANKA/         {push @r,255 ; push @g, 215  ; push @b,0}
       case /yoelii yoelii 17XNL/  {push @r,189 ; push @g, 183 ; push @b,107}
       case /chabaudi chabaudi/    {push @r,100 ; push @g, 149 ; push @b,237}
       case /knowlesi strain H/    {push @r,190 ; push @g, 190  ; push @b,190}
     }
  }

  $ecOrganismMap->{$ecNumber}->{'red'} = \@r;
  $ecOrganismMap->{$ecNumber}->{'green'} = \@g;
  $ecOrganismMap->{$ecNumber}->{'blue'} = \@b;
  $ecOrganismMap->{$ecNumber}->{'x'} =  $$ecMap{'X'};
  $ecOrganismMap->{$ecNumber}->{'y'} = $$ecMap{'Y'};
  $ecOrganismMap->{$ecNumber}->{'height'} = $$ecMap{'HEIGHT'};
  $ecOrganismMap->{$ecNumber}->{'divisions'} = @r;
  $ecOrganismMap->{$ecNumber}->{'width'} = $$ecMap{'WIDTH'};
  
}

#print Dumper  $ecOrganismMap;

my $sql = "select IMAGE from ApiDB.PathwayImage where pathway_source_id = '$pathwaySourceId'";

$dbh->{LongReadLen} = 500*1024;
$dbh->{LongTruncOk} = 0;
$sth=$dbh->prepare($sql,{ora_pers_lob=>1});
$sth->execute;


my $pngImage;
while (my $ref = $sth->fetchrow) {
 $pngImage .= $ref;
}

my $im = GD::Image->newFromPngData($pngImage) || die "cannot read png image";

foreach my $ecNumber (keys %{$ecOrganismMap}){

  my $x = $ecOrganismMap->{$ecNumber}->{'x'};
  my $y = $ecOrganismMap->{$ecNumber}->{'y'};
  my $width = $ecOrganismMap->{$ecNumber}->{'width'};
  my $height = $ecOrganismMap->{$ecNumber}->{'height'};
  my $divisions = $ecOrganismMap->{$ecNumber}->{'divisions'};
  my $red = $ecOrganismMap->{$ecNumber}->{'red'};
  my $green = $ecOrganismMap->{$ecNumber}->{'green'};
  my $blue = $ecOrganismMap->{$ecNumber}->{'blue'};

  my ($x1, $y1, $x2, $y2) = &rectangleCorners($x,$y,$width,$height);
  my $increment = ($x2-$x1)/$divisions;

  for (my $k = 0; $k < $divisions; $k++){
        my $color  = $im->colorAllocate($$red[$k],$$green[$k],$$blue[$k]); 
    for(my $i = $x1; $i < ($x1+$increment); $i++) {
       for(my $j = $y1; $j < $y2; $j++) {

        my $index = $im->getPixel($i,$j);
        my ($r,$g,$b) = $im->rgb($index);

        if (($r==252) && ($g==254) && ($b==252)) {
          $im->setPixel($i,$j,$color);
        }
      }
    }
    $x1 = $x1 + $increment;
  }
}


binmode STDOUT;
print $im->gif();


# x and y specify the center of the rectangle
sub rectangleCorners {
  my ($x, $y, $w, $h) = @_;

  my $x1 = $x - $w/2;
  my $x2 = $x + $w/2;
  my $y1 = $y - $h/2;
  my $y2 = $y + $h/2;

  return($x1, $y1, $x2, $y2);
}


1;

