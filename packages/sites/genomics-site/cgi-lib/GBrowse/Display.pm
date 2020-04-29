package GBrowse::Display;

use strict;
use Data::Dumper;

#--------------------------------------------------------------------------------
#  Methods which Return 1 or 0 for determining the Label
#--------------------------------------------------------------------------------

sub geneName {
  my $f = shift;
  my ($gName) = $f->get_tag_values("gName");

  return $f->name unless $gName;
  return $f->name . "($gName)"; 
}

sub labelFromTagValue { 
  my ($f, $tag, $value) = @_;

  my ($type) = $f->get_tag_values($tag);
  return 1 if($type eq $value);
  return 0;
}

# not sure why this is returning the name ... should only be 1 or 0
sub synSpanLabel {
  my $f = shift;
  my ($type) = $f->get_tag_values('Type');
  return 0 if ($type =~ /gap/i);
  my $name = $f->name;
  my ($scale) = $f->get_tag_values("Scale");
  $scale = sprintf("%.2f", $scale);
  return $name; 
}


#--------------------------------------------------------------------------------
#  Methods For Color
#--------------------------------------------------------------------------------

sub interproDomainRainbow {
  my $f = shift;
  $main::seenPfam{$f->feature_id} ||= $main::rainbow[scalar(keys %main::seenPfam) % scalar(@main::rainbow)]; 
  return $main::seenPfam{$f->feature_id}; 
}


sub snpBgFromIsCodingAndNonSyn {
  my $f = shift;
  my ($isCoding) = $f->get_tag_values("IsCoding"); 
  my $color = 'white';
  if ($isCoding == 1 || $isCoding =~ /yes/i) {
    my ($nonSyn) = $f->get_tag_values("NonSyn"); 
    my ($nonsense) = $f->get_tag_values("Nonsense"); 
    $color = $nonsense ? 'red' : $nonSyn ? 'blue' : 'lightblue'; 
  }
  return $color; 
}


sub snpColor {
    my $f = shift;
             my ($isCoding) = $f->get_tag_values("IsCoding");
             my $color = 'white';
             my ($nonSyn) = $f->get_tag_values("NonSyn");
             if ($isCoding == 1 || $isCoding eq 'yes') {
               $color = $nonSyn? 'blue' : 'lightblue';
             }
             return $color;
     }


sub SnpBgFromMatchingReference {
       my $f = shift;
       my $var = $f->bulkAttributes();
       my $ctDiffs = 0;
       foreach my $s (@$var){
               $ctDiffs++ unless $s->{MATCHES_REFERENCE};
       }
       my $color = 'white';
       if($ctDiffs >= 4){
               $color = 'green';
       }elsif($ctDiffs >= 2){
               $color = 'lightgreen';
       }
       return $color;
}


sub SnpBgcolorForGenotyping {
#  red for 75k chip, blue 3k chip and green for barcoding.
      my $f = shift;
      my ($freq) = $f->get_tag_values('MinorAlleleFreq');
      my ($type) = $f->get_tag_values('Type');


      if ($type eq 'pfal3D7_SNP_Broad75KGenotyping_RSRC') {
          if ($freq <= 0.1) {
            return '#FF0000';
          } elsif ($freq <= 0.2) {
            return '#E00000';
          } elsif ($freq <= 0.3) {
            return '#C00000';
          } elsif ($freq <= 0.4) {
            return '#A00000';
          } else {
            return '#800000';
          }
      } elsif ($type eq 'pfal3D7_SNP_Broad3KGenotyping_RSRC') {
          if ($freq <= 0.1) {
            return '#0000FF';
          } elsif ($freq <= 0.2) {
            return '#0000E0';
          } elsif ($freq <= 0.3) {
            return '#0000C0';
          } elsif ($freq <= 0.4) {
            return '#0000A0';
          } else {
            return '#000080';
          }
      } else {  # for 'pfal3D7_SNP_BroadIsolateBarcode_RSRC'
  if ($freq <= 0.1) {
            return '#00FF00';
          } elsif ($freq <= 0.2) {
            return '#00E000';
          } elsif ($freq <= 0.3) {
            return '#00C000';
          } elsif ($freq <= 0.4) {
            return '#00A000';
          } else {
            return '#008000';
          }
      }
}


sub MassSpecScoreBgColor {
   my $f = shift;
   my ($count) = $f->get_tag_values("Count"); 
   # use shades of red, brighter as count is larger
   return '#FF0000' if ($count > 100);
   return '#E00000' if ($count > 50);
   return '#B00000' if ($count > 25 );
   return '#800000' if ($count > 10 );
   return '#500000';
}


sub gsnapIntronBgColorFromSample {
  my $f = shift;

  my %colors = (#Pf-RNASeq_Newbold
                'Hour0'  => 'lightblue',
                'Hour8'  => 'mediumslateblue',
                'Hour16' => 'sandybrown',
                'Hour24' => 'brown',
                'Hour32' => 'darksalmon',
                'Hour48' => 'peachpuff',
                #Pf-RNASeq_Duffy
                '3D7'    => 'peru',
                'PL01'   => 'darkkhaki', 
                'PL02'   => 'brown',
                #Pf-RNASeq_Stunnenberg
                'Hour5'  => 'mediumslateblue', 
                'Hour10' => 'mediumblue',
                'Hour15' => 'lightblue',
                'Hour20' => 'rosybrown',
                'Hour25' => 'brown',
                'Hour30' => 'maroon',
                'Hour35' => 'sandybrown',
                'Hour40' => 'sienna',
                # pfal3D7_Su_seven_stages_rnaSeq_RSRC
                'earlyTroph'   => '#F87217',  # dark oragne1
                'gametocyteII' => '#E56717',  # dark orange2
                'gametocyteV'  => '#C35617',  # dark orange3
                'lateTroph'    => '#8A4117',  # sienna
                'ookinete'     => '#7E3517',  # sienna4
                'ring'         => '#7E3817',  # salmon4
                'schizont'     => '#C34A2C',  # coral3
                # misc others
                'NCmRNA' => 'green',
                'VEGmRNA' => 'maroon',
                'Lane6' => 'maroon',
                'ME49ncRNA' => 'tan',
                'RHncRNA' => 'yellow',
                'NCncRNA' => 'maroon', 
                'OocystmRNA' => 'green', 
                # toxo tgonME49_Gregory_VEG_mRNA_rnaSeq_RSRC
                'hour2'  => '#D4A017', # gold
                'hour4'  => '#C68E17', # goldenrod3
                'hour8'  => '#AF7817', # dark goldenrod
                'hour16' => '#F87217', # dark orange1
                'hour33' => '#E56717', # dark orange2
                'hour44' => '#C35617', # dark orange3
                'bradyzoite' => '#7E3817', # salmon4 
                # toxo ncanLIV_Gregory_Brian_rnaSeq_RSRC
                'mRNA'  => '806517',  # gold 4
                'ncRNA' => '805817',  # goldenrod4
                # toxo 
                'day0'  => '#4E9258', # forest green
                'day3'  => '#347C2C', # spring green4
                'day4'  => '#387C44', # sea green4
                'day10' => '#254117', # dark green
                );  

  my ($sample) = $f->get_tag_values('Sample'); 
  my ($canonical) = $f->get_tag_values('Canonical'); 
  if(my $color = $colors{$sample}) {
    if($canonical == 1) {
      return 'red';
    }
    return $color;
  }
  return '#F87431';  # Sienna1
} 

sub gsnapIntronBgColorFromScore {
  my $f = shift;

  my ($urs) = $f->get_tag_values('URS');
  my $sum = eval join '+', split /[,|\|]/, $urs;

  # http://www.computerhope.com/htmcolor.htm
  return '#B6B6B4' if $sum <= 4;   # Gray Cloud
  return '#F88017' if $sum <= 20;   # Dark Orange
  return '#F87217' if $sum <= 50;  # Dark Orange1
  return '#E56717' if $sum <= 100;  # Dark Orange2
  return '#C35617' if $sum <= 300;  # Dark Orange3
  return '#8A4117' if $sum <= 750; # Sienna
  return '#7E3517' if $sum <= 1500; # Sienna4
  return '#800517';   # Firebrick
}

sub gsnapIntronBgColorFromScoreAndCS {
  my $f = shift;

  my ($matchesGeneStrand) = $f->get_tag_values('MatchesGeneStrand'); 
  my ($sum) = $f->get_tag_values('TotalScore'); 

  # http://www.computerhope.com/htmcolor.htm
  return '#B6B6B4' if $matchesGeneStrand != 1;   # Gray Cloud
  return '#B6B6B4' if $sum <= 4;   # Gray Cloud
  return '#F88017' if $sum <= 20;   # Dark Orange
  return '#F87217' if $sum <= 50;  # Dark Orange1
  return '#E56717' if $sum <= 100;  # Dark Orange2
  return '#C35617' if $sum <= 300;  # Dark Orange3
  return '#8A4117' if $sum <= 750; # Sienna
  return '#7E3517' if $sum <= 1500; # Sienna4
  return '#800517';   # Firebrick
}

sub gsnapIntronColorFromStrandAndScore {
  my $f = shift;

  my ($isReversed) = $f->get_tag_values('IsReversed'); 
  my ($sum) = $f->get_tag_values('TotalScore'); 

  # http://www.computerhope.com/htmcolor.htm
  if($isReversed == 1){
    return 'rgb(255,219,219)' if $sum <= 4;
    return 'rgb(255,182,182)' if $sum <= 16;
    return 'rgb(255,146,146)' if $sum <= 64;
    return 'rgb(255,109,109)' if $sum <= 256;
    return 'rgb(255,73,73)' if $sum <= 1024; 
    return 'rgb(255,36,36)';   
  }else{
    return 'rgb(219,219,255)' if $sum <= 4;
    return 'rgb(182,182,255)' if $sum <= 16;
    return 'rgb(146,146,255)' if $sum <= 64;
    return 'rgb(109,109,255)' if $sum <= 256;
    return 'rgb(73,73,255)' if $sum <= 1024; 
    return 'rgb(36,36,255)';   
  }
}


sub gsnapIntronWidthFromScore {
  my $f = shift;

  my ($sum) = $f->get_tag_values('TotalScore'); 

  # http://www.computerhope.com/htmcolor.htm
  return 1 if $sum <= 4096; 
  return 2 if $sum <= 16000; 
  return 3;
}





sub _gsnapIntronColorFromStrandAndScore {
  my $f = shift;

  my ($isReversed) = $f->get_tag_values('IsReversed'); 
  my ($sum) = $f->get_tag_values('TotalScore'); 

  # http://www.computerhope.com/htmcolor.htm
  if($isReversed == 1){
    return '#FFCCCC' if $sum <= 4;
    return '#FF9999' if $sum <= 16;
    return '#FF6666' if $sum <= 64;
    return '#FF3333' if $sum <= 256;
    return '#FF0000' if $sum <= 1024; 
    return '#CC0000' if $sum <= 4096; 
    return '#990000' if $sum <= 16000; 
    return '#660000';   
  }else{
    return '#C2DFFF' if $sum <= 4;   # sea blue
    return '#82CAFA' if $sum <= 16;   # light sky blue
    return '#5CB3FF' if $sum <= 64;  # crystal blue
    return '#56A5EC' if $sum <= 256;  # iceberg
    return '#1589FF' if $sum <= 1024;  # dodger blue
    return '#2B65EC' if $sum <= 4096; # ocean blue
    return '#0020C2' if $sum <= 16000; # cobal
    return '#000099';   
  }
}



sub gsnapIntronHeightFromScore {
  my $f = shift;

  my ($urs) = $f->get_tag_values('URS');
  my $sum = eval join '+', split /[,|\|]/, $urs;

  # http://www.computerhope.com/htmcolor.htm
  return 3 if $sum <= 2;   # Gray Cloud
  return 5 if $sum <= 5;   # Dark Orange
  return 6 if $sum <= 10;  # Dark Orange1
  return 7 if $sum <= 20;  # Dark Orange2
  return 8 if $sum <= 50;  # Dark Orange3
  return 9 if $sum <= 100; # Sienna
  return 10 if $sum <= 200; # Sienna4
  return 11;   # Firebrick
}

sub gsnapIntronHeightFromPercent {
  my $f = shift;
  
  my ($perc) = $f->get_tag_values('IntronPercent'); 
  
  # http://www.computerhope.com/htmcolor.htm
  return 4 if $perc <= 5;   # Gray Cloud
  return 5 if $perc <= 20;   # Dark Orange
  ##  return 6 if $score <= 10;  # Dark Orange1
  ## return 6 if $perc <= 40;  # Dark Orange2
  ##  return 8 if $score <= 50;  # Dark Orange3
  return 6 if $perc <= 60; # Sienna
  return 7 if $perc <= 80; # Sienna4
  return 8;   # Firebrick
}

sub gsnapIntronWidthFromPercent {
  my $f = shift;
  my ($perc) = $f->get_tag_values('IntronPercent'); 
  return 1 if $perc <= 20;
  return 1.5 if $perc <= 40;
  return 2 if $perc <= 60;
  return 2.5 if $perc <= 80;
  return 3;
}

sub gsnapIntronWidthFromIsAnnotated {
  my $f = shift;
  my ($perc) = $f->get_tag_values('IntronPercent'); 
  my ($annotatedIntron) = $f->get_tag_values('AnnotatedIntron'); 
  my ($matchesGeneStrand) = $f->get_tag_values('MatchesGeneStrand'); 
  return 2 if $annotatedIntron eq 'Yes';
#  return 2 if $matchesGeneStrand == 1;
  return 1;
}

sub gsnapIntronUnifiedWidth {
  my $f = shift;
  my ($scores) = $f->get_tag_values('Scores'); 
  my $sum = eval join '+', split /;/, $scores;
  return 1 if $sum <= 5;
  return 2 if $sum <= 20;
  return 3 if $sum <= 100;
  return 4;
}

sub massSpecFgColorFromExtDbName {
  my $f = shift;

  my %colors = (#ToxoDB
                'TgonME49_BoothroydBowyerOocystMembrane_Proteome_RSRC'         => 'gray',
                'TgonME49_BoothroydBowyerOocystCytosol_Proteome_RSRC'          => 'red',
                'TgonME49_BoothroydBowyerOocystWalls_Proteome_RSRC'            => 'gray' 
                   );

  $f = $f->parent if (! $f->get_tag_values('ExtDbName'));
  my ($extdbname) = $f->get_tag_values('ExtDbName');

  if(my $color = $colors{$extdbname}) {
    return $color
  }
  return 'gray';
}

sub massSpecBgColor {
  my $f = shift;

  $f = $f->parent if (! $f->get_tag_values('Color'));
  my ($color) = $f->get_tag_values('Color');

  if($color) {
    my @colors = split /;/, $color; # for post translational modification 
    return $colors[0];
  }
  return 'yellow';
}


sub unifiedPostTranslationalModBgColor {
  my $f = shift;

  my ($ontology) = $f->get_tag_values('ModificationType');

  if($ontology =~ /phosphorylation_site/i) {
    return 'dodgerblue';
  } elsif ($ontology =~ /modified_L_cysteine/i) {
    return 'deepskyblue';
  } elsif ($ontology =~ /iodoacetamide_derivatized_residue/i) {
    return 'blueviolet';
  } elsif ($ontology =~ /modified_L_methionine/i) {
    return 'steelblue';
  }
  return 'blue';
}

sub wastlingMassSpecBgColor {
  my $f = shift;
  my $extdbname;
  if(ref $f->parent =~ /GUS::Segment$/) {
    ($extdbname) = $f->get_tag_values('ExtDbName');
  } else {
    ($extdbname) = $f->parent->get_tag_values('ExtDbName');
  }
  ($extdbname =~ m/1-d/i) && return 'mediumslateblue';
  ($extdbname =~ m/mudpit/i) && return 'black';
  ($extdbname =~ m/rhoptry/i) && return 'mediumblue';
  return 'yellow';
}

sub bgColorFromStrandAndDeprecated {
  my ($f, $forward, $rev, $forDep, $revDep) = @_;
  my ($dep) = $f->get_tag_values('isDeprecated');
  if($dep == 1){
    return $f->strand == +1 ? $forDep : $revDep;
  }else{
    return $f->strand == +1 ? $forward : $rev;
  }
}

sub simpleBgColorFromStrand {
  my ($f, $first, $second) = @_;
  simpleColorFromStrand($f, $first, $second);
}

sub simpleFgColorFromStrand {
  my ($f, $first, $second) = @_;
  simpleColorFromStrand($f, $first, $second);
}

sub simpleColorFromStrand {
  my ($f, $first, $second) = @_;
  $f->strand == +1 ? $first : $second;
}

sub simpleColorFromSoTerm {
  my ($f, $first, $second) = @_;
  my ($soterm) = $f->get_tag_values('SOTerm');
  $soterm eq 'protein_coding' ? $first : $second;
}

sub colorFromBinaryColor {
  my ($f, $first, $second, $third) = @_;
  my ($binColor) = $f->get_tag_values('binaryColor');
  if(!$third) {
    $binColor == 1 ? $second : $first; 
  } else {
    $binColor == 1 ? $second : ($f->strand == +1 ? $first : $third); 
  }
}

sub rnaseqColorFromBigWig {
  my $f = shift;

  my ($strand) = $f->get_tag_values('strand');
  my ($alignment) = $f->get_tag_values('alignment');

  ######## strand specific RNA-Seq ######

  # pos strand unique = BLUE
  if($strand eq 'forward' && $alignment eq 'unique') {
    return 'blue';
  }
  # neg strand unique = RED
  if($strand eq 'reverse' && $alignment eq 'unique') {
    return 'red';
  }

  # pos strand unique = grey
  if($strand eq 'forward' && $alignment eq 'non-unique') {
    return 'grey';
  }
  # neg strand unique = lightgrey
  if($strand eq 'reverse' && $alignment eq 'non-unique') {
    return 'lightgrey';
  }

  ######## non strand specific RNA-Seq ######
  if($alignment eq 'black') {
    return 'blue';
  }
  if($alignment eq 'non-unique') {
    return 'grey';
  }

  return 'black';
} 

sub tssColorFromBigWig {
    my $f = shift;

    my ($track) = $f->get_tag_values('display_name');
    print STDERR Dumper $track;

    if ($track =~ m/fwd/) { return 'blue'; }
    if ($track =~ m/rev/) { return 'red'; }
    return 'black';
}

sub colorByRnaSeq {
  my $f = shift;
  my ($isReversed) = $f->get_tag_values('is_reversed');
  my ($multiple) = $f->get_tag_values('multiple');
  my $score = $f->score();

  # pos strand unique = BLUE
  if($isReversed eq '0' && $multiple eq '0') {
    return 'blue';
  }
  # neg strand unique = BLUE
  if($isReversed eq '1' && $multiple eq '0') {
    return 'red';
  }

  # pos strand multiple align = lightblue
  if($isReversed eq '0' && $multiple eq '1') {
    return 'grey';
  }
  # neg strand multiple align = pink
  if($isReversed eq '1' && $multiple eq '1') {
    return 'lightgrey';
  }

  # multiple aligners w/o strand info
  if($multiple eq '1' || $score < 0) {
    #return 'lightslategray';
    return 'wheat';
  }

  if(!$isReversed) {  # is_reversed is null - refer to bug #12335 
    return 'blue';
  }

  return 'black';
}



sub colorFromBinaryColorScore {
  my ($f, $first, $second) = @_;
  my ($binColor) = $f->get_tag_values('binaryColor');
  $f->score < 0 ? $second : $first; 
}

sub colorFromTriColor {
  my ($f, @colors) = @_;
  my ($triColor) = $f->get_tag_values('triColor');
  return $colors[$triColor];
}

sub bgColorForSpliceSites {
  my ($f, $first, $second, $third, $fourth) = @_;
  my $strand = $f->strand;
  my ($count) = $f->get_tag_values('count');
  my ($gm) = $f->get_tag_values('genome_matches');
  return 'white' if $gm > 1;
  if($strand == +1){
    return 'blue' if $count > 10;
    return 'lightskyblue' if $count == 1;
    return 'cornflowerblue';
  }else{
    return 'firebrick' if $count > 10;
    return 'tomato' if $count == 1;
    return 'red';
  } 
}

sub fgColorForSpliceSites {
  my ($f, $first, $second, $third, $fourth) = @_;
  my $strand = $f->strand;
  my ($count) = $f->get_tag_values('count');
  my ($gm) = $f->get_tag_values('genome_matches');
  if($strand == +1){
    return 'blue' if $count > 10;
    return 'lightskyblue' if $count == 1;
    return 'cornflowerblue';
  }else{
    return 'firebrick' if $count > 10;
    return 'tomato' if $count == 1;
    return 'red';
  } 
}

sub bgColorForPolyASites {
  my ($f, $first, $second, $third, $fourth) = @_;
  my $strand = $f->strand;
  my ($count) = $f->get_tag_values('count');
  my ($gm) = $f->get_tag_values('genome_matches');
  return 'white' if $gm > 1;
  if($strand == +1){
    return 'green' if $count > 10;
    return 'lightgreen' if $count == 1;
    return 'limegreen';
  }else{
    return 'purple' if $count > 10;
    return 'orchid' if $count == 1;
    return 'darkorchid';
  } 
}

sub fgColorForPolyASites {
  my ($f, $first, $second, $third, $fourth) = @_;
  my $strand = $f->strand;
  my ($count) = $f->get_tag_values('count');
  my ($gm) = $f->get_tag_values('genome_matches');
  if($strand == +1){
    return 'green' if $count > 10;
    return 'lightgreen' if $count == 1;
    return 'limegreen';
  }else{
    return 'purple' if $count > 10;
    return 'orchid' if $count == 1;
    return 'darkorchid';
  } 
}

sub fgColorForSpliceAndPaSites {
  my ($f) = @_;
  my $strand = $f->strand;
  my ($count) = $f->get_tag_values('count');
  if($strand eq '+1'){
    return 'blue' if $count > 10;
    return 'lightskyblue' if $count == 1;
    return 'cornflowerblue';
  }else{
    return 'firebrick' if $count > 10;
    return 'tomato' if $count == 1;
    return 'red';
  } 
  return 'lightslategray';
}

sub bgColorForSpliceAndPaSites {
  my ($f) = @_;
  my $strand = $f->strand;
  my ($count) = $f->get_tag_values('count');
  my ($gm) = $f->get_tag_values('genome_matches');
  return 'white' if $gm > 1;
  if($strand eq '+1'){
    return 'blue' if $count > 10;
    return 'lightskyblue' if $count == 1;
    return 'cornflowerblue';
  }else{
    return 'firebrick' if $count > 10;
    return 'tomato' if $count == 1;
    return 'red';
  }
  return 'lightslategray';
}


sub colorBySpliceSiteCount {
  my ($f,$fg) = @_;
  $f = $f->parent if (! $f->get_tag_values('count_per_mill'));
  my ($count) = $f->get_tag_values('count_per_mill');
  my ($dom) = ($f->get_tag_values('is_dominant'));
  my ($type) = ($f->get_tag_values('type'));
  my $strand = $f->strand;

  if (($strand eq '+' && $type eq 'SpliceSite') || ($strand eq '-' && $type eq 'Poly A')) {
    if ($dom && $fg){
      # if splice site is dominant, return red for foreground color
      return 'red';
    } elsif ($count < 2) {
      return 'lightskyblue';
    } elsif ($count < 10) {
      return 'cornflowerblue';
    } elsif ($count < 100) {
      return 'blue';
    } elsif ($count < 1000) {
      return 'navy';
    } else {
      return 'black';
    }
  } else {
    if ($dom && $fg){
      # if splice site is dominant, return black for foreground color
      return 'black';
    } elsif ($count < 2) {
      return '#FFCCCC';
    } elsif ($count < 10) {
      return 'pink';
    } elsif ($count < 100) {
      return 'orange';
    } elsif ($count < 1000) {
      return 'tomato';
    } else {
      return 'firebrick';
    }
  }
}

sub colorBySpliceSiteUnifiedCount {
  my $f = shift;

  my ($ctpm) = $f->get_tag_values('count_per_mill');
  my $count = eval join '+', split /,/, $ctpm;
  my $strand = $f->strand;

  if ($strand eq '+' || $strand eq '1'){
    if ($count < 2) {
      return 'lightskyblue';
    } elsif ($count < 10) {
      return 'cornflowerblue';
    } elsif ($count < 100) {
      return 'blue';
    } elsif ($count < 1000) {
      return 'navy';
    } else {
      return 'black';
    }
  } else {
    if ($count < 2) {
      return '#FFCCCC';
    } elsif ($count < 10) {
      return 'pink';
    } elsif ($count < 100) {
      return 'orange';
    } elsif ($count < 1000) {
      return 'tomato';
    } else {
      return 'firebrick';
    }
  }
}

sub colorForSpliceSites {
  my ($f) = @_;
  my ($name) = $f->get_tag_values('sample_name');

  # T brucei Nilsson
  return 'red' if $name eq 'T.brucei Long Slender SLT';
  return 'orange' if $name eq 'T.brucei Short Stumpy SLT';
  return 'limegreen' if $name eq 'T.brucei bloodstream 427 SLT';
  return 'green' if $name eq 'T.brucei procyclic_late SLT';
  return 'cornflowerblue' if $name eq 'T.brucei Alba 1 non-induced SLT';
  return 'blue' if $name eq 'T.brucei Alba 1 induced SLT';
  return 'darkorchid' if $name eq 'T.brucei Alba 3 and 4 non-induced SLT';
  return 'purple' if $name eq 'T.brucei Alba 3 and 4 induced SLT';

  # Leish. Myler
  return 'green' if $name eq 'L. infantum procyclic promastigotes SL - NSR';
  return 'lightgreen' if $name eq 'L. major procyclic promastigotes SL - NSR';
  return 'darkgreen' if $name eq 'L. major procyclic promastigotes SL - Random';
  return 'red' if $name eq 'L. major procyclic promastigotes PolyA';

  # T cruzi Nilsson
  return 'red' if $name eq 'Tcruzi ama wt SLT';
  return 'orange' if $name eq 'Tcruzi ama J1 ko SLT';
  return 'limegreen' if $name eq 'Tcruzi epi wt SLT';
  return 'green' if $name eq 'Tcruzi epi J1 ko SLT';
  return 'cornflowerblue' if $name eq 'Tcruzi meta wt SLT';
  return 'blue' if $name eq 'Tcruzi meta J1 ko SLT';
  return 'darkorchid' if $name eq 'Tcruzi trypo wt SLT';
  return 'purple' if $name eq 'Tcruzi trypo J1 ko SLT';

  return 'lightslategray';
}


sub colorForBindingSitesByPvalue{
  my ($f) = @_;
  my $strand = $f->strand;
  my ($pvalue) = $f->get_tag_values('Score');
  if($strand eq '+1'){
    return 'mediumblue' if $pvalue <= 1e-5;
    return 'royalblue' if $pvalue <= 5e-5;
    return 'dodgerblue' if $pvalue <= 1e-4;
    return 'skyblue';
  }else{
    return 'darkred' if $pvalue <= 1e-5;
    return 'crimson' if $pvalue <= 5e-5;
    return 'red' if $pvalue <= 1e-4;
    return 'tomato';
  }
  return 'lightslategray';
}

sub colorForSevenSampleRNASeq{
  my $f = shift;
  my ($sample) = $f->get_tag_values('sample');
  return 'orange' if $sample eq 'Hour0';
  return 'aqua' if $sample eq 'Hour8';
  return 'blue' if $sample eq 'Hour16';
  return 'lawngreen' if $sample eq 'Hour24';
  return 'forestgreen' if $sample eq 'Hour32';
  return 'magenta' if $sample eq 'Hour40';
  return 'firebrick' if $sample eq 'Hour48';
  return 'lightslategray';
}

sub haploColor { 
  my $f   = shift;
  my ($boundary) = $f->get_tag_values('Boundary');

  return 'darkseagreen' if($boundary eq 'Liberal');
  return 'darkgreen' if($boundary eq 'Conservative');
}

sub haploHeight { 
  my $f   = shift;
  my ($boundary) = $f->get_tag_values('Boundary');

  #return 20  if($boundary eq 'Liberal');
  return 20  if($boundary eq 'Conservative');
}


sub chipColor { 
  my $f   = shift;
  my ($a) = $f->get_tag_values('Antibody');
  ($a) = (defined $a) ? $a : $f->get_tag_values('immunoglobulin complex, circulating');
  my ($t) = $f->get_tag_values('Compound');
  my ($r) = $f->get_tag_values('Replicate');
  my ($g) = $f->get_tag_values('Parasite genotype');
  my ($l) = $f->get_tag_values('Parasite lifecycle stage');
  my ($anls) = $f->get_tag_values('name');

  #print STDERR Dumper $f;
  print STDERR Dumper $r;
  print STDERR Dumper $l;
  print STDERR Dumper $g;
  print STDERR Dumper $anls;

  # plasmo - Winzeler Westenberger
  return '#D80000' if($anls eq 'H4_schizont_smoothed (ChIP-chip)');
  return '#006633' if($anls eq 'H4_trophozoite_smoothed (ChIP-chip)');
  return '#27408B' if($anls eq 'H4_ring_smoothed (ChIP-chip)');
  return '#524818' if($anls eq 'H3K9ac_troph_smoothed (ChIP-chip)');

  # toxo - Einstein_centromeres
  return '#000080' if($a =~ /CenH3_H3K9me2/i);
  return '#B0E0E6' if($a =~ /CenH3/i);

  # plasmo - Artur Scherf
  return '#0A7D8C' if ($g =~ /Wild type/i && ($a =~ /H3K/i || $a =~ /H4K/i));
  return '#FF7C70' if ($g =~ /sir2KO/i && ($a =~ /H3K/i || $a =~ /H4K/i));

  # toxo - Einstein + Einstein_ME1
  return '#00FF00' if($a =~ /H3K4me3/i && $r eq 'Replicate 1');
  return '#00C896' if($a =~ /H3K4me3/i && $r eq 'Replicate 2');
  return '#0033FF' if($a =~ /H3K4me1/i && $r eq 'Replicate 1');
  return '#0066FF' if($a =~ /H3K4me1/i && $r eq 'Replicate 2');
  return '#C86400' if($a =~ /H3K9/i && $r eq 'Replicate 1');
  return '#FA9600' if($a =~ /H3K9/i && $r eq 'Replicate 2');

  # toxo - Hakimi Ali
  return '#4B0082' if($t =~ /DMSO/i );
  return '#F08080' if($t =~ /FR235222/i );

  # tryp - Peter Myler
  return '#00C800' if($r eq 'Replicate 1');
  return '#FA9600' if($r eq 'Replicate 2');
  return '#884C00' if($r eq 'Replicate 3');
  return '#B22222' if($l =~ /early-log promastigotes/i);
  return '#4682B4' if($l =~ /stationary promastigotes/i);

  # plasmo - Artur Scherf (obsolete?)
  return '#00C800' if($a =~ /H3K4me3/i);
  return '#FA9600' if($a =~ /H3K9Ac/i);
  return '#57178F' if($a =~ /H3K9me3/i );
  return '#E6E600' if($a =~ /H3/i );
  return '#F00000' if($a =~ /H4K20me3/i);

  # toxo Hakimi Ali 2
  return '#600000' if($a =~ /SET8/i && $r eq 'Replicate 1' );
  return '#600000' if($a =~ /TBP1/i && $r eq 'Replicate 1' );
  return '#600000' if($a =~ /TBP2/i && $r eq 'Replicate 1' );
  return '#600000' if($a =~ /RPB9_RNA_pol_II/i && $r eq 'Replicate 1' );
  return '#C00000' if($a =~ /SET8/i && $r eq 'Replicate 2' );
  return '#C00000' if($a =~ /TBP1/i && $r eq 'Replicate 2' );
  return '#C00000' if($a =~ /TBP2/i && $r eq 'Replicate 2' );
  return '#C00000' if($a =~ /RPB9_RNA_pol_II/i && $r eq 'Replicate 2' );


  return '#B84C00';
}


sub ChromosomeFgcolor {
    my $f = shift;
    my ($chr) =$f->get_tag_values("Chromosome");
    my ($syntype) =$f->get_tag_values("SynType");
    if ($syntype =~ /span/) { 
      my ($col) = $f->get_tag_values("ChrColor");
      return $col if $col;
      return "orange" if ($f->strand == 1); 
      return "darkseagreen";
    } else {
      return "blue" if ($f->strand == 1); 
      return "red";
    }
}  

sub gapFgcolor { 
  my $f = shift; 
  my ($type) = $f->get_tag_values("Type");
  if ($type eq "fgap") {
    return "white";
  } else {
    my $orient = $f->strand;
    if ($orient eq "+1") {
      return "orange";
    } elsif ($orient eq "-1") {
      return "darkseagreen";
    } else {
      return "red";
    }
  }
} 

sub gapBgcolor { 
  my $f = shift;
  my ($type) = $f->get_tag_values("Type");
  return "white" if ($type eq "fgap");
  return "red" if ($type eq "sgap");
}

sub bacsBgcolor { 
    my $f = shift;
    my ($extdbname) = $f->get_tag_values('ExtDbName');
    if ($extdbname =~ m/PAC/) { 
    return 'green';
    } else {
      return 'orange';
    }
 }


sub cghBgcolor { 
    my $f = shift;
    my ($type) = $f->get_tag_values('Type');
    my ($dir) = $f->get_tag_values('Direction');
    
    if (($type eq 'Type 1') && ($dir eq 'amplification')) { 
      return 'green';
    } elsif (($type eq 'Type 2') && ($dir eq 'amplification')){
      return 'maroon';
    } elsif (($type eq 'Type 2') && ($dir eq 'deletion')){
      return 'maroon';
    } elsif (($type eq 'Type 1') && ($dir eq 'deletion')){
      return 'green';
    }
 }

sub riteshMSBgcolor { # content color
  my $f = shift;
  my ($psm) = $f->get_tag_values('PSM');

  if($psm > 1) {
    return "#F62217";  # ruby red
  } else {
    return "#59E817";  # nebula green
  } 
}

sub riteshMSFgcolor { # border color
  my $f = shift;
  my ($psm) = $f->get_tag_values('PSM');

  if($psm > 1) {
    return "red";  
  } else {
    return "#52D017"; # yellow green 
  } 
} 

# used to flag (in red) cosmids that whose length suggests misassembly
# (anything outside the range of 35-45 kb
sub alignmentConnectColor {
  my $f = shift;
  my ($len) = $f->get_tag_values('alignLength');

  if ( ($len >= 35000) && ($len <= 45000) ) {
    return 'navy';
  } else {
    return 'red';
  }
}

sub colorSegmentByScore {
    my $f = shift;
    my ($score) = $f->score;
     # use shades of red, brighter as score is larger
         return '#FF0000' if ($score > 60);
         return '#FF8000' if ($score > 50);
         return '#00FF00' if ($score > 40 );
         return '#0000FF' if ($score > 30 );
         return '#000000';
}

sub bgColorForBamTracks {
    my $f = shift;
    my $strand = $f->query->strand;
    return $strand == 1 ? 'cornflowerblue' : 'coral';
    }

sub mismatchColorForBamTracks {
    my $f = shift;
    my $strand = $f->query->strand;
    return $strand == 1 ? 'coral' : 'cornflowerblue';
    }


#--------------------------------------------------------------------------------
#  Methods For Height
#--------------------------------------------------------------------------------

sub snpHeight {
  my $f = shift;
  my ($rend) = $f->get_tag_values("rend"); 
  my ($base_start) = $f->get_tag_values("base_start");
  my $zoom_level = $rend - $base_start; 
  return $zoom_level <= 60000? 10 : 6;
}

sub peakHeight {
  my ($f,$addBase) = @_;
  my $score = $f->score;
  my $logScore = 2*(log($score)/log(2));
  return $logScore unless $addBase;
  return (2 + $logScore );
}

sub heightBySOTerm {
  my ($f, $term, $val1, $val2) = @_;
  my ($soterm) = $f->get_tag_values('SOTerm');
  return ($soterm eq $term) ? $val1 : $val2;
}

sub heightByCount {
  my ($f, $height) = @_;

  return 5;

  $f = $f->parent if (! $f->get_tag_values('Count'));
  my ($count) = $f->get_tag_values("Count");
  my $numeric_count = ($count =~ m/Unavailable/i) ? 1 : $count;
  return (log(($numeric_count)*($height))/log(2));
}

sub heightBySpliceSiteCount {
  my ($f, $height) = @_;
  $f = $f->parent if (! $f->get_tag_values('count_per_mill'));
  my ($count) = $f->get_tag_values('count_per_mill');

  if ($count < 2) {
    return 3;
  } elsif ($count < 10) {
    return 5;
  } elsif ($count < 100) {
    return 7;
  } elsif ($count < 1000) {
    return 9;
  } else {
    return 11;
  }
}


#--------------------------------------------------------------------------------
#  Other Display
#--------------------------------------------------------------------------------


sub changeType { 
  my $f = shift;
  my ($type) = $f->get_tag_values("Type");
  return "arrow" if($type eq 'scaffold');
  return "arrow" if($type eq 'contig');
  return "segments";
}

sub synSpanRelativeCoords { 
  my $f = shift; 

  my ($leftAnchSyntenicLoc) = $f->get_tag_values("LeftAnchSyntenicLoc"); 
  my ($rightAnchSyntenicLoc) = $f->get_tag_values("RightAnchSyntenicLoc"); 
  my ($leftAnchRefLoc) = $f->get_tag_values("LeftAnchRefLoc"); 
  my ($rightAnchRefLoc) = $f->get_tag_values("RightAnchRefLoc"); 
  my ($leftAnchPrevRefLoc) = $f->get_tag_values("LeftAnchPrevRefLoc"); 
  my ($rightAnchNextRefLoc) = $f->get_tag_values("LeftAnchNextRefLoc"); 

  my ($scale) = $f->get_tag_values("Scale");

  my $strand = $f->strand();
  my $start = $f->start();
  my $end = $f->end();

  # Forward Span Starts w/in Window;  Left anchor syntenic loc is exact position
  if($strand == 1 && $leftAnchPrevRefLoc == -9999999999) {
    return $leftAnchSyntenicLoc;
  }

  # Reverse Span Starts w/in Window;  Right anchor syntenic loc is exact position
  if($strand == -1 && $rightAnchNextRefLoc == 9999999999) {
    return $rightAnchSyntenicLoc;
  }

  if($strand == 1) {
    return ($leftAnchSyntenicLoc - ($leftAnchRefLoc - $start) / $scale) * $scale;
  }

  if($strand == -1) {
    return ($rightAnchSyntenicLoc + ($end - $rightAnchRefLoc) / $scale) * $scale;
  }

}


sub synSpanScale { 
  my $f = shift; 
  my ($scale) = $f->get_tag_values("Scale");
  return $scale;
}

sub synSpanOffset { 
  my $f = shift; 
  my ($syn_start) = $f->get_tag_values("SynStart");
  return $syn_start;
}


#--------------------------------------------------------------------------------
#  Help! notes
#--------------------------------------------------------------------------------

sub warnNote {
  my ($f, $project) = @_;
	my $eupathStyle = "margin:4px;padding:3px;border:1px solid black;border-radius:6px;";
  my $txt = "<table width='100%' style='margin:5px'><tr>" .
			"<td width='50%'>" .
			"<div style='display:inline-block;" . $eupathStyle . "padding:10px;'>" .
			"<span style='font-size:110%;font-weight:bold;'>" .
      "To save or share track configurations," . 
      "</span>" .
      " select 'Generate URL' from File menu (above) and cut and paste resulting URL" .
      "<br><br>" .
     	"<span style='font-size:110%;font-weight:bold;'>" .
			"If you load tracks and they appear empty, please try two things:" .
			"</span>" .
			"<br>1. Make sure you are viewing the correct species/strain to which the data was mapped." .
			"<br>2.<a style='font-weight:bold' href='/cgi-bin/gbrowse/$project/?reset=1'> Reset your GBrowse</a> and try again." .
			"</div></td>" .
			"<td style='font-size:120%;font-weight:bold;text-align:center;vertical-align:middle'><a onclick='poptastic(this.href); return false;' target='_blank' href='http://www.youtube.com/watch?v=jxA6VMN97Y8'>EuPathDB GBrowse Tutorial <img border='0' src='/a/images/smallYoutube-icon.png' alt='YouTube icon' style='vertical-align:middle' title='YouTube tutorial'></a></td></tr></table>";

  return $txt;
}

#--------------------------------------------------------------------------------
#  Citations
#--------------------------------------------------------------------------------

sub dustCitation {
  return "Selecting this option displays regions of low compositional complexity, as defined by the DUST algorithm of Tatusov and Lipman.  For more information on DUST click <a href=\"ftp://ftp.ncbi.nlm.nih.gov/pub/agarwala/windowmasker/windowmasker_suppl.pdf\">here</a>.";
}

sub _gsnapIntronCitation {
  return <<EOL;
Note that annotated introns are indicated with bold (wider) glyphs.
   <br/><br/>
<b>Intron Spanning Reads (ISR)</b>: 
  The total number of uniquely mapped reads (all samples) which map across the junction and are on the appropriate strand.  GSNAP uses splice site consensus sequences to determine strand of the mapped read. 
  <br/><br/>
<b>ISR per million (ISRPM)</b>: 
  Intron Spanning Reads Per Million intron spanning reads and thus represents a normalized count of unique reads.
  <br/><br/>
<b>% of Most Abundant Intron (MAI)</b>:
  The percentage (ISRPM of this junction / ISRPM of maximum junction for this gene) of this junction over the maximum for this gene.
  <br/><br/>
<b>Most abundant in</b>:
   The experiment and sample that has the highest ISRPM for this gene.
  <br/><br/>
<b>ISRPM, (ISR / coverage)</b>:
  ISRPM from sample with highest ISRPM and the ISR/coverage for that same sample. 
  <br/><br/>
  The table shows all experiments and samples that provide evidence for this intron junction.  Note that the values for each row are based on each specific sample.
  <br/><br/>
The color of the glyph changes with the Score as follows:
  <p><table width="50%">
  <tr><th align="left">Reverse</th><th align="left">Forward</th></tr>
  <tr><td bgcolor='white'><font color="#FFCCCC"><b>less than 5</b></font></td><td bgcolor='white'><font color="#C2DFFF"><b>less than 5</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#FF9999"><b>5-15</b></font></td><td bgcolor='white'><font color="#82CAFA"><b>5-15</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#FF6666"><b>17-64</b></font></td><td bgcolor='white'><font color="#5CB3FF"><b>17-64</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#FF3333"><b>65-256</b></font></td><td bgcolor='white'><font color="#56A5EC"><b>65-256</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#FF0000"><b>257-1024</b></font></td><td bgcolor='white'><font color="#1589FF"><b>257-1024</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#CC0000"><b>1025-4096</b></font></td><td bgcolor='white'><font color="#2B65EC"><b>1025-4096</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#990000"><b>4097-16000</b></font></td><td bgcolor='white'><font color="#0020C2"><b>4097-16000</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#660000"><b>greater than 16000</b></font></td><td bgcolor='white'><font color="#000099"><b>greater than 16000</b></font></td></tr>
</table>
EOL
}


sub gsnapIntronCitation {
  return <<EOL;
<b>Intron Spanning Reads (ISR)</b>: 
  The total number of uniquely mapped reads (all samples) which map across the junction and are on the appropriate strand.  GSNAP uses splice site consensus sequences to determine strand of the mapped read. 
  <br/><br/>
<b>ISR per million (ISRPM)</b>: 
  Intron Spanning Reads Per Million intron spanning reads and thus represents a normalized count of unique reads.
  <br/><br/>
<b>% of Most Abundant Intron (MAI)</b>:
  The percentage (ISRPM of this junction / ISRPM of maximum junction for this gene) of this junction over the maximum for this gene.
  <br/><br/>
<b>Most abundant in</b>:
   The experiment and sample that has the highest ISRPM for this gene.
  <br/><br/>
<b>ISRPM, (ISR / coverage)</b>:
  ISRPM from sample with highest ISRPM and the ISR/coverage for that same sample. 
  <br/><br/>
  The table shows all experiments and samples that provide evidence for this intron junction.  Note that the values for each row are based on each specific sample.
  <br/><br/>
The color of the glyph changes with the Score as follows:
  <p><table width="50%">
  <tr><th align="left">Reverse</th><th align="left">Forward</th></tr>
  <tr><td bgcolor='white'><font color="#FFDBDB">less than 5</font></td><td bgcolor='white'><font color="#DBDBFF">less than 5</font></td></tr>
  <tr><td bgcolor='white'><font color="#FFB6B6">5-16</font></td><td bgcolor='white'><font color="#B6B6FF">5-16</font></td></tr>
  <tr><td bgcolor='white'><font color="#FF9292">17-64</font></td><td bgcolor='white'><font color="#9292FF">17-64</font></td></tr>
  <tr><td bgcolor='white'><font color="#FF6D6D">65-256</font></td><td bgcolor='white'><font color="#6D6DFF">65-256</font></td></tr>
  <tr><td bgcolor='white'><font color="#FF4949">257-1024</font></td><td bgcolor='white'><font color="#4949FF">257-1024</font></td></tr>
  <tr><td bgcolor='white'><font color="#FF2424">1025-4096</font></td><td bgcolor='white'><font color="#2424FF">1025-4096</font></td></tr>
  <tr><td bgcolor='white'><font color="#FF2424" ><b>4097-16000</b></font></td><td bgcolor='white'><font color="#2424FF"><b>4097-16000</b></font></td></tr>
  <tr><td bgcolor='white'><font color="#FF2424" size="4"><b>greater than 16000</b></font></td><td bgcolor='white'><font color="#2424FF" size="4"><b>greater than 16000</b></font></td></tr>
</table>
EOL
}


sub massSpecKey {
  my $projectId = $ENV{PROJECT_ID};

  return 'T.gondii MS/MS Peptides - Unified' if ($projectId =~ /ToxoDB/i);
  return 'Unified MS/MS Peptides (see <10k region for details)';
}

sub combinedRumKey {
  my $projectId = $ENV{PROJECT_ID};
  return 'T.gondii Splice Site Junctions - Unified' if ($projectId =~ /ToxoDB/i);
  return 'Splice Site Junctions - Combined';

}

1;
