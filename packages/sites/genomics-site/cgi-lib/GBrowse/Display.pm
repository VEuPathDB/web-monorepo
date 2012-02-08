package GBrowse::Display;

use strict;

#--------------------------------------------------------------------------------
#  Methods which Return 1 or 0 for determining the Label
#--------------------------------------------------------------------------------

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

# not sure why this is returning the name ... should only be 1 or 0
sub sageTagLabel {
  my $f = shift;
  my $start = $f->start;
  my $stop  = $f->stop;
  my $strand  = $f->strand;
  $start = $stop if ($strand == -1);
  my ($tag_seq) = $f->get_tag_values("Tag"); 
  my ($count) = $f->get_tag_values("Occurrence"); 
  return  $start . " [" . $count . "]"; 
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
  if ($isCoding =~ /yes/i) {
    my ($nonSyn) = $f->get_tag_values("NonSyn"); 
    $color = $nonSyn? 'blue' : 'lightblue'; 
  }
  return $color; 
}


sub snpColor {
    my $f = shift;
             my ($isCoding) = $f->get_tag_values("IsCoding");
             my $color = 'white';
             my ($nonSyn) = $f->get_tag_values("NonSyn");
             if ($isCoding eq 'yes') {
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
#  red for 75k chip, green 3k chip and blue for barcoding.
      my $f = shift;
      my ($source) = $f->get_tag_values('IsoDbName');
      my ($freq) = $f->get_tag_values('MinorAlleleFreq');

      if ($source eq 'Broad 75K genotyping chip') {
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
      } elsif ($source eq 'Broad 3K genotyping chip') {
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
      } else {  # for 'Isolate barcode data from Broad'
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

sub sageTagFgColor { 
  my $f            = shift;
  my $strand       = $f->strand; 
  my ($occurrence) = $f->get_tag_values('Occurrence'); 
  if ($strand  eq "+1") {
    return "lightblue" if ($occurrence < 3);
    return "darkblue" if ($occurrence > 5);
    return "blue";
  } else {
    return "pink" if ($occurrence < 3);
    return "darkred" if ($occurrence > 5);
    return "red";
  }
}

sub sageTagUniqueMapFgColor { 
  my $f            = shift;
  my $strand       = $f->strand; 
  my ($occurrence) = $f->get_tag_values('Occurrence'); 
  return "grey" if ($occurrence > 1);
  ($strand eq "+1") ? "blue" : "darkred";
}

sub rumIntronBgColorFromSample {
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
                'day3' => 'seagreen',
                'day4' => 'darkkhaki',
                'NCmRNA' => 'green',
                'VEGmRNA' => 'maroon',
                'Lane6' => 'maroon',
                'ME49ncRNA' => 'tan',
                'RHncRNA' => 'yellow',
                'NCncRNA' => 'maroon', 
                'OocystmRNA' => 'green', 
                );  

  my ($sample) = $f->get_tag_values('Sample'); 
  my ($canonical) = $f->get_tag_values('Canonical'); 
  if(my $color = $colors{$sample}) {
    if($canonical == 1) {
      return 'red';
    }
    return $color;
  }
  return 'yellow'; 
} 

sub rumIntronBgColorUnified {
  my $f = shift;
  my ($scores) = $f->get_tag_values('Scores'); 
  my $sum = eval join '+', split /;/, $scores;
  # http://www.computerhope.com/htmcolor.htm
  return '#FDD017' if $sum <= 5;   # Gold1
  return '#F88017' if $sum <= 20;  # Dark Orange
  return '#C35617' if $sum <= 100; # Dark Orange3
  return '#7E3517';   # Sienna4 
}

sub rumIntronUnifiedWidth {
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



sub massSpecBgColorFromExtDbName {
  my $f = shift;

  my %colors = (#ToxoDB
                'Wastling 1-D SDS PAGE Insoluble' => 'mediumslateblue',
                'Wastling 1-D SDS PAGE' => 'mediumslateblue',
                'Wastling 1-D SDS PAGE Soluble' => 'mediumslateblue',
                'Wastling MudPIT Soluble' => 'brown',
                'Wastling MudPIT Insoluble' => 'sandybrown',
                'Wastling Rhoptry' => 'mediumblue',
                'Wastling 2-D' => 'brown',
                'Wastling' => 'mediumblue',
                'Murray Conoid-enriched Fraction' =>  'maroon',
                'Murray Conoid-depleted Fraction' => 'darksalmon',
                '1D Gel Tachyzoite Membrane fraction 12-2006' => 'sandybrown',
                '1D Gel Tachyzoite Cytosolic fraction 03-2006' => 'sienna',
                '1D Gel Tachyzoite Membrane fraction 10-2006' => 'peachpuff',
                'MS Tachyzoite Membrane fraction 05-02-2006' => 'peru', 
                'MS Tachyzoite Membrane fraction 06-2006' => 'rosybrown',
                'MS Tachyzoite Membrane fraction 10-2006' => 'darkkhaki',
                'MS Tachyzoite Membrane fraction 05-10-2006' => 'brown',
                'MS Tachyzoite Membrane fraction 02-03-2006' => 'tan',
                'MS Carruthers MudPIT Twinscan hits' => 'violet',
                'MS Carruthers 2destinct peptides' => 'plum',
                'Moreno DTASelect filter sample A' => 'lime',
                'Moreno DTASelect filter sample G' => 'green',
                'Tg_Boothroyd_Elias_Moritz_Intracellular_Phosphoproteome_RSRC' => '#F62817',  #Firebrick1
                'Tg_Boothroyd_Elias_Moritz_Intracellular_Totalproteome_RSRC'   => '#250517',  #Gray18
                'Tg_Boothroyd_Elias_Moritz_Purified_Phosphoproteome_RSRC'      => '#F62817',
                'Tg_Boothroyd_Elias_Moritz_Purified_Totalproteome_RSRC'        => '#250517',
                'TgGT1_Boothroyd_Elias_Moritz_Intracellular_Phosphoproteome_RSRC' => '#F62817',  #Firebrick1
                'TgGT1_Boothroyd_Elias_Moritz_Intracellular_Totalproteome_RSRC'   => '#250517',  #Gray18
                'TgGT1_Boothroyd_Elias_Moritz_Purified_Phosphoproteome_RSRC'      => '#F62817',
                'TgGT1_Boothroyd_Elias_Moritz_Purified_Totalproteome_RSRC'        => '#250517',
                'TgGT1_Tonkin_TiO2_Bound_Mascot-based_Phosphoproteome_RSRC'       => 'tan',
                'Tg_Tonkin_TiO2_Bound_Sequest-based_Phosphoproteome_RSRC'      => 'khaki',
                'Tg_Tonkin_TiO2_Unbound_Phosphoproteome_RSRC'                  => 'darkkhaki',
                'TgonME49_BoothroydBowyerOocystMembrane_Proteome_RSRC'         => 'yellow',
                'TgonME49_BoothroydBowyerOocystCytosol_Proteome_RSRC'          => 'yellow',
                'TgonME49_BoothroydBowyerOocystWalls_Proteome_RSRC'            => 'blue',

                # TriTrypDB
                'Tcruzi Proteomics-Epimastigote' => 'black',
                'Tcruzi Proteomics-Amastigote' => 'mediumslateblue',
                'Tcruzi Proteomics-Trypomastigote' => 'green',
                'Tcruzi Proteomics-Metacyclic' => 'brown',
                'Tcruzi reservosomes-B1 fraction digested with trypsin and endoproteinase Glu-C' => 'sandybrown',
                'Tcruzi reservosomes-B1 fraction digested with trypsin' => 'tan',
                'Tcruzi reservosomes-B1M fraction digested with trypsin' => 'khaki',
                'Tcruzi Proteomics-Membrane Protein' => 'maroon',
                'Tbrucei Proteomics Procyclic Form'=> 'yellow',
                'Linfantum Proteomics PTM-acetylation' => 'slateblue',
                'Linfantum Proteomics PTM-methylation' => 'black',
                'Linfantum Proteomics SDS Amastigote' => 'mediumslateblue',
                'Lbraziliensis Proteomics Promastigote temperature and pH stressed' => 'blue',
                'Lbraziliensis Proteomics Promastigote temperature and pH non-stressed' => 'blue',
                'Lmajor Proteomics 2DGel 6-11 Amastigote' => 'mediumslateblue',
                'Linfantum Proteomics 2DGel 6-9 Amastigote' => 'mediumslateblue',
                'Lmajor Proteomics 2DGel 6-9 Amastigote' => 'mediumslateblue',
                'Lmajor Proteomics Promastigote temperature and pH stressed' => 'blue',
                'Lmajor Proteomics SDS Amastigote' => 'mediumslateblue',
                'Linfantum Proteomics 2DGel 6-9 Promastigote' => 'blue',
                'Lmajor Proteomics Promastigote temperature and pH non-stressed' => 'blue',
                'Linfantum Proteomics PTM-glycosylation' => 'brown',
                'Lmajor Proteomics Promastigote Secreted Protein' => 'blue',
                'Lmajor Proteomics 2DGel 6-9 Promastigote' => 'blue',
                'Linfantum Proteomics 2DGel 6-11 Amastigote' =>'mediumslateblue',
                'Linfantum Proteomics PTM-phosphorylation' => 'green',
                'Linfantum Proteomics 2DGel 6-11 Promastigote' => 'blue',
                'Lmajor Proteomics 2DGel 6-11 Promastigote' => 'blue',
                'Linfantum Proteomics data from Marc Ouellette' => 'lightseagreen',
                'L.major Proteomics-Exosomes' => 'crimson',
                'L. braziliensis Proteomics-Promastigotes' => 'orange',
                'Tbrucei427_Proteomics_Urbaniak_BsfProteome_RSRC' => 'maroon',
                'Tbrucei427_Proteomics_Urbaniak_BsfEnriched_RSRC' => 'red' ,
                'Tbrucei927_Proteomics_Urbaniak_BsfProteome_RSRC' => 'orange',
                'Tbrucei927_Proteomics_Urbaniak_BsfEnriched_RSRC' => 'yellow',
                # CryptoDB
                'Ferrari_Proteomics_LTQ_Oocyst_walls' => 'sandybrown',
                'Ferrari_Proteomics_LTQ_Sporozoites_merged' => 'tan',
                'Ferrari_Proteomics_LTQ_intact_oocysts_merged' => 'khaki',
                'Fiser_Proteomics_14Aug2006_1D_gel' => 'peru',
                'Fiser_Proteomics_16May2006_1D_gel' => 'rosybrown',
                'Fiser_Proteomics_24Jun2006_1D_gel' => 'peachpuff',
                'Lowery MassSpec LC-MS/MS Insoluble Excysted Fraction' => 'maroon',
                'Lowery MassSpec LC-MS/MS Insoluble Non-excysted fraction' => 'darksalmon',
                'Lowery MassSpec LC-MS/MS Soluble Excysted and Non-excysted fractions' => 'lightseagreen',
                'Wastling MassSpec 1D Gel LC-MS/MS' => 'mediumslateblue',
                'Wastling MassSpec 2D Gel LC-MS/MS' => 'green',
                'Wastling MassSpec MudPit Insoluble' => 'brown',
                'Wastling MassSpec MudPit Soluble' => 'black',
                'C. parvum mass spec data from Lorenza Putignani' => 'crimson',
                #PlasmoDB
                'Waters_female_gametes_RSRC' => 'red',
                'Waters_male_gametes_RSRC'   => 'blue',
                'Waters_mixed_gametes_RSRC'  => 'yellow',
                'Lasonder_Mosquito_salivary_gland_sporozoites_RSRC' => 'yellow',
                'Lasonder_Mosquito_oocyst_derived_sporozoites_RSRC' => 'orange',
                'Lasonder_Mosquito_Oocysts_Mass_Spec_RSRC'          => 'mediumslateblue',
                'Pf_Lasonder_Proteomics_Blood_Stages_early_gametocytes_RSRC' => 'lightblue',
                'Pf_Lasonder_Proteomics_Blood_Stages_trophozoites_RSRC' =>  'lightseagreen',
                'Pf_Lasonder_Proteomics_Blood_Stages_late_gametocytes_RSRC' => 'crimson',
                'Pyoelii_LiverStage_LS40_RSRC' => 'red',
                'Pyoelii_LiverStage_LS50_RSRC' => 'blue',
                'Florens_Life_Cycle_MassSpec_Mrz_RSRC' => 'sandybrown',
                'Florens_Life_Cycle_MassSpec_Tpz_RSRC' => 'tan',
                'Florens_PIESPs_MassSpec_RSRC'         => 'khaki',
                'Florens_Life_Cycle_MassSpec_Gmt_RSRC' => 'yellow',
                'Florens_Life_Cycle_MassSpec_Spz_RSRC' => 'brown',
                'Pf_Bowyer_Proteomics_42hrs_Post_Infection_RSRC' => 'yellow',
                'Pf_Bowyer_Proteomics_48hrs_Post_Infection_RSRC' => 'orange',
                'Pf_Boothroyd_Elias_Moritz_Phosphoproteome_RSRC' => '#F62817',  #Firebrick1
                'Pf_Boothroyd_Elias_Moritz_Totalproteome_RSRC'   => '#250517',  #Gray18
                'Pf_Voss_trophs_stages_F5_RSRC' => '#FF0000',
                'Pf_Voss_trophs_stages_F4_RSRC' => '#FFFF00',
                'Pf_Voss_trophs_stages_F3_RSRC' => '#009900',
                'Pf_Voss_trophs_stages_F2_RSRC' => '#0000FF',
                'Pf_Voss_trophs_stages_F1_RSRC' => '#990099',
                'Pf_Voss_schizonts_stages_F5_RSRC' => '#660000',
                'Pf_Voss_schizonts_stages_F4_RSRC' => '#FF6600',
                'Pf_Voss_schizonts_stages_F3_RSRC' => '#003300',
                'Pf_Voss_schizonts_stages_F2_RSRC' => '#000033',
                'Pf_Voss_schizonts_stages_F1_RSRC' => '#330066',
                'Pf_Voss_ring_stages_F5_RSRC' => '#CC3333',
                'Pf_Voss_ring_stages_F3_RSRC' => '#FF9900',
                'Pf_Voss_ring_stages_F1_RSRC' => '#66FF66',
                'Pf_Voss_ring_stages_F4_RSRC' => '#3399FF',
                'Pf_Voss_ring_stages_F2_RSRC' => '#FF99FF',
                'Pvivax_Cui_Schizont_Proteomics_RSRC' => 'blue',
                #AmoebaDB
                'Ehistolytica_Glycosylation_RSRC' => 'yellow',
                'Phagosome Proteomics data from Huston - 0 mins' => 'yellow',
                'Phagosome Proteomics data from Huston - 30 mins' => 'tan',
                'Phagosome Proteomics data from Huston - 5 mins' => 'khaki',
                'Phagosome Proteomics data from Huston - 10 mins' => 'orange',
                'Phagosome Proteomics data from Huston - 60 mins' => 'sandybrown',
                'Ehistolytica_Markiewicz_Proteomics_RSRC' => 'blue',
                'Ehistolytica_Marion_Proteomics_Wild_Type_RSRC' => 'lightgreen',
                'Ehistolytica_Marion_Proteomics_MyoIB_5Min_RSRC'=> 'green',
                'Ehistolytica_Marion_Proteomics_MyoIB_15Min_RSRC' => 'darkgreen',
                   );

  $f = $f->parent if (! $f->get_tag_values('ExtDbName'));
  my ($extdbname) = $f->get_tag_values('ExtDbName');


  if(my $color = $colors{$extdbname}) {
    return $color
  }
  return 'yellow';
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


sub glyphFlipBgColor { 
  my ($f, $glyph) = @_;
  my $flip = $glyph->{flip};
  $f->strand == ($flip ? -1 : 1) ? "navy" : "maroon";
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


sub colorByRnaSeq {
  my ($f, $optColor) = @_;
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
    return 'mediumslateblue';
  }
  # neg strand multiple align = pink
  if($isReversed eq '1' && $multiple eq '1') {
    return 'hotpink';
  }

  if($multiple eq '0' && $optColor) {
    return $optColor;
  }

  # multiple aligners w/o strand info
  if($multiple eq '1' || $score < 0) {
    return 'lightslategray';
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
  my $strand = $f->strand;

  if ($strand eq '+'){
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
  my ($t) = $f->get_tag_values('Treatment');
  my ($r) = $f->get_tag_values('Rep');
  my ($g) = $f->get_tag_values('Genotype');
  my ($anls) = $f->get_tag_values('Analysis');

  return '#D80000' if($anls eq 'H4_schizont');
  return '#006633' if($anls eq 'H4_trophozoite');
  return '#27408B' if($anls eq 'H4_ring');
  return '#524818' if($anls eq 'H3K9ac_troph');

  return '#000080' if($a eq 'CenH3_H3K9me2');
  return '#B0E0E6' if($a eq 'CenH3');

  return '#0A7D8C' if ($g =~ /wild_type/i && ($a =~ /H3K/i || $a =~ /H4K/i));
  return '#FF7C70' if ($g =~ /sir2KO/i && ($a =~ /H3K/i || $a =~ /H4K/i));

  return '#00FF00' if($a =~ /H3K4me3/ && $r == 1);
  return '#00C896' if($a =~ /H3K4me3/ && $r == 2);
  return '#0033FF' if($a =~ /H3K4me1/ && $r == 1);
  return '#0066FF' if($a =~ /H3K4me1/ && $r == 2);

  return '#C86400' if($a =~ /H3K9/ && $r == 1);
  return '#FA9600' if($a =~ /H3K9/ && $r == 2);

  return '#4B0082' if($t =~ /DMSO/ );
  return '#F08080' if($t =~ /FR235222/ );

  #return '#175487' if ($g =~ /wild_type/i && ($a =~ /H3K/i || $a =~ /H4K/i));
  #return '#54B5B5' if ($g =~ /sir2KO/i && ($a =~ /H3K/i || $a =~ /H4K/i));

  return '#00C800' if($anls =~ /replicate/i && $r =~ /replicate1/i);
  return '#FA9600' if($anls =~ /replicate/i && $r =~ /replicate2/i);
  return '#884C00' if($anls =~ /replicate/i && $r =~ /replicate3/i);

  return '#B22222' if($anls =~ /early_log/i);
  return '#4682B4' if($anls =~ /stationary/i);

  return '#00C800' if($a =~ /H3K4me3/i);
  return '#FA9600' if($a =~ /H3K9Ac/i);
  return '#57178F' if($a =~ /H3K9me3/i );
  return '#E6E600' if($a =~ /H3/i );
  return '#F00000' if($a =~ /H4K20me3/i);

  return '#600000' if($a =~ /SET8/i && $r == 1 );
  return '#600000' if($a =~ /TBP1/i && $r == 1 );
  return '#600000' if($a =~ /TBP2/i && $r == 1 );
  return '#600000' if($a =~ /RPB9_RNA_pol_II/i && $r == 1);

  return '#C00000' if($a =~ /SET8/i && $r == 2 );
  return '#C00000' if($a =~ /TBP1/i && $r == 2 );
  return '#C00000' if($a =~ /TBP2/i && $r == 2 );
  return '#C00000' if($a =~ /RPB9_RNA_pol_II/i && $r == 2 );


  return '#B84C00';
}


sub ChromosomeFgcolor {
    my $f = shift;
    my ($chr) =$f->get_tag_values("Chromosome");
    my ($syntype) =$f->get_tag_values("SynType");
    if ($syntype =~ /contig/) { 
      my ($col) = $f->get_tag_values("ChrColor");
      return $col if $col;
      return "orange" if ($f->strand == 1); 
      return "darkseagreen";
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
  return $score unless $addBase;
  return (2 + $score);
}

sub heightBySOTerm {
  my ($f, $term, $val1, $val2) = @_;
  my ($soterm) = $f->get_tag_values('SOTerm');
  return ($soterm eq $term) ? $val1 : $val2;
}

sub heightByCount {
  my ($f, $height) = @_;
  $f = $f->parent if (! $f->get_tag_values('Count'));
  my ($count) = $f->get_tag_values("Count"); 
  return (log($count*$height)/log(2));
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
  my ($off) = $f->get_tag_values("SynStart"); 
  my ($scale) = $f->get_tag_values("Scale");
  return int($off*$scale+0.5);
}


sub synSpanScale { 
  my $f = shift; 
  my ($scale) = $f->get_tag_values("Scale");
  return int($scale+0.5);
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
  my $txt = "<font color='red'><b>NOTE</b>: If you load tracks and they appear empty</font>, you can try two things to resolve this issue:<br>1. Make sure you are viewing the correct species/strain to which the data was mapped.<br>2. Reset gbrowse by clicking on the red <a href='/cgi-bin/gbrowse/$project/?reset=1'><b><u><font color='red'>Reset</font></u></b></a> link, then try again.<br/><br/>";

  return $txt;
}

#--------------------------------------------------------------------------------
#  Citations
#--------------------------------------------------------------------------------

sub dustCitation {
  return "Selecting this option displays regions of low compositional complexity, as defined by the DUST algorithm of Tatusov and Lipman.  For more information on DUST click <a href=\"ftp://ftp.ncbi.nlm.nih.gov/pub/agarwala/windowmasker/windowmasker_suppl.pdf\">here</a>.";
}

sub rumIntronCitation {
  return <<EOL;
  Mouse-over column description: <br/><br/>
SCORE: 
  The number of reads which map across the junction that (a) map uniquely,
  (b) have at least 8 bases on either side, and (c) have a characterized
  splice signal.  So if the splice signals are not characterized the score
  is zero.
  <br/><br/>
LONG_OVERLAP_UNIQUE_READS: 
  The number of reads mapping across the junction for which their alignment
  is unique and they have at least 8 bases on each side of the junction.
  These are the ones that count towards the "score". 
  <br/><br/>
SHORT_OVERLAP_UNIQUE_READS:
  The number of reads mapping across the junction for which their alignment
  is unique and they have less than 8 bases on one (or both) sides of the
  junction 
  <br/><br/>
LONG_OVERLAP_NU_READS:
  The number of reads mapping across the junction for which their alignment
  is not unique and they have at least 8 bases on each side of the junction
  <br/><br/>
SHORT_OVERLAP_NU_READS:
  The number of reads mapping across the junction for which their alignment
  is not unique and they have less than 8 bases on one (or both) sides of
  the junction
EOL

} 

1;
