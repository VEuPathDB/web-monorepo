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

sub snpBgFromIsCodingAndNonSyn {
  my $f = shift;
  my ($isCoding) = $f->get_tag_values("IsCoding"); 
  my $color = 'white';
  if ($isCoding) {
    my ($nonSyn) = $f->get_tag_values("NonSyn"); 
    $color = $nonSyn? 'blue' : 'lightblue'; 
  }
  return $color; 
}

sub MassSpecScoreBgColor {
   my $f = shift;
    my ($count) = $f->get_tag_values("score"); 
   return 'red' if ($count > 50); #darkgray
   return 'blue' if ($count > 25 );
   return 'green' if ($count > 10 );
   return 'gray'; #antiquegray
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


sub massSpecBgColorFromExtDbName {
  my $f = shift;

  my %colors = ('Wastling 1-D SDS PAGE Insoluble' => 'mediumslateblue',
                'Wastling 1-D SDS PAGE' => 'mediumslateblue',
                'Wastling 1-D SDS PAGE Soluble' => 'mediumslateblue',
                'Wastling MudPIT Soluble' => 'black',
                'Wastling MudPIT Insoluble' => 'black',
                'Wastling Rhoptry' => 'mediumblue',
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
                'Tcruzi Proteomics-Epimastigote' => 'black',
                'Tcruzi Proteomics-Amastigote' => 'mediumslateblue',
                'Tcruzi Proteomics-Trypomastigote' => 'green',
                'Tcruzi Proteomics-Metacyclic' => 'brown',
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
                'Lmajor Proteomics 2DGel 6-11 Promastigote' => 'blue'
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

sub chipColor { 
  my $f   = shift;
  my ($a) = $f->get_tag_values('Antibody');
  my ($r) = $f->get_tag_values('Rep');
  return '#00C800' if($a =~ /H3K4/ && $r == 1);
  return '#00C896' if($a =~ /H3K4/ && $r == 2);
  return '#C86400' if($a =~ /H3K9/ && $r == 1);
  return '#FA9600' if($a =~ /H3K9/ && $r == 2);
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
  my $f = shift;
  my $score = $f->score;
  return $score; 
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
   return ($count/2)+$height;
}


#--------------------------------------------------------------------------------
#  Other Display
#--------------------------------------------------------------------------------


sub changeType { 
  my $f = shift;
  my ($type) = $f->get_tag_values("Type");
  return "arrow" if($type eq 'scaffold');
  return "segments";
}

sub synSpanRelativeCoords { 
  my $f = shift; 
  my ($off) = $f->get_tag_values("SynStart"); 
  my ($scale) = $f->get_tag_values("Scale");$off*$scale;
}


sub synSpanScale { 
  my $f = shift; 
  my ($scale) = $f->get_tag_values("Scale");
}



1;
