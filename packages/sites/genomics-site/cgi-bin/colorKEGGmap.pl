#!/usr/bin/perl -w

use strict;

use GD;
use CGI;
use CGI::Carp qw(fatalsToBrowser set_message);
use Switch;
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
my $projectId = $q->param('model') || $ARGV[0];
my $pathwaySourceId = $q->param('pathway') || $ARGV[1];

die "valid project_id is required\nUsage\tperl\t\tcolorKEGGmap.pl\t\t<model>\t\t<mapSourceId>\n" if (!$projectId);
die "valid pathway_source_id is required\nUsage\tperl\t\tcolorKEGGmap.pl\t\t<model>\t\t<mapSourceId>\n" if (!$pathwaySourceId);

#SET COLORS FOR ELEMENTS WHICH DECIDE COLORING EX ORGANISMS

my ($colors, @r, @g, @b);
push @r,238 ; push @g, 203 ; push @b,173;
push @r,135 ; push @g, 206 ; push @b,250;
push @r,102 ; push @g, 205 ; push @b,170;
push @r,244 ; push @g, 164 ; push @b,96;
push @r,233 ; push @g, 150 ; push @b,122;
push @r,255 ; push @g, 215 ; push @b,0;
push @r,189 ; push @g, 183 ; push @b,107;
push @r,100 ; push @g, 149 ; push @b,237;
push @r,190 ; push @g, 190 ; push @b,190;

$colors->{'red'} = \@r;
$colors->{'green'} = \@g;
$colors->{'blue'} = \@b;

#VARIABLES TO STORE COLORING FACTOR AND ITS COLOR MAP
my (@coloringFactor, $factorColorMap);

#-----MODEL PROPS TO MAKE DB CONNECTION -----#

my $c = new ApiCommonWebsite::Model::ModelConfig($projectId);

my $dbh = DBI->connect($c->getDbiDsn,$c->getLogin,$c->getPassword,
                       { PrintError => 1,
                         RaiseError => 0
                       } ) or die "Can't connect to the database: $DBI::errstr\n";



my $organismSql = "SELECT distinct organism from ApiDbTuning.GeneAttributes";
my $sth = $dbh->prepare($organismSql);
$sth->execute;

while (my $org = $sth->fetchrow_array()) {
 push @coloringFactor, $org;
}

#GET COLORMAP FOR ORGANISMS
$factorColorMap = &getColorMap(\@coloringFactor,$colors);


#EC NUMBER BASED COLORING
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
 
$sth = $dbh->prepare($ecMapSql);
$sth->execute;

my $ecOrganismMap;

while (my $ecMap = $sth->fetchrow_hashref()) {
  my $ecNumber = $$ecMap{'EC_NUMBER'};
  chomp $ecNumber;

  my @organisms = split(/,/,$$ecMap{'ORGANISMS'});
  my (@r, @g, @b);
   
  foreach my $org (@organisms){
    next unless $factorColorMap->{$org}; 
    push @r, $factorColorMap->{$org}->{'r'};   
    push @g, $factorColorMap->{$org}->{'g'};   
    push @b, $factorColorMap->{$org}->{'b'};   
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

#draw a legend
my $imgWidth = $im->width();
my $x = 270;
my $y = 1;
my $black = $im->colorAllocate(0,0,0);
$im->string(gdMediumBoldFont,200,1,'LEGEND',$black);

foreach my $factor (keys %{$factorColorMap}) {
   my $color = $im->colorAllocate($factorColorMap->{$factor}->{'r'},
                                  $factorColorMap->{$factor}->{'g'},
                                  $factorColorMap->{$factor}->{'b'});

   $im->filledRectangle($x,$y+3,($x+8),($y+8),$color);
   $im->string(gdMediumBoldFont,($x+12), $y,$factor,$black);

   if ($x + 230 > $imgWidth) {
     $y = $y + 13;
     $x = 270;
   } else {
     $x = $x + 240;
   }
}
#--end legend

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
    for (my $i = $x1; $i < ($x1+$increment); $i++) {
       for (my $j = $y1; $j < $y2; $j++) {

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

my $gifImage = $im->gif();
print "Content-type: image/gif\n\n";
print $gifImage;

#if needed at a future development
#my $outFile = "/tmp/pathwaySourceId.gif";
#open (OUT,">image.gif") || die "could not open temporary  output file for drawing\n";
#binmode (OUT);
#print OUT $gifImage;
#close OUT;


sub getColorMap {
  my ($elements,$colors) = @_;
  my $elementColorMap;

  my $r = $colors->{'red'};
  my $g = $colors->{'green'};
  my $b = $colors->{'blue'};
  my $iter = 0;

  foreach my $element (@$elements) {
    $elementColorMap->{$element}->{'r'} = $$r[$iter];
    $elementColorMap->{$element}->{'g'} = $$g[$iter];
    $elementColorMap->{$element}->{'b'} = $$b[$iter];
    $iter++;
  }
  return $elementColorMap;
}



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

