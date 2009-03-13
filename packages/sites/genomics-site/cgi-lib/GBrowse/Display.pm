use strict;

sub oldChipColor { 
  my $f   = shift;
  my ($a) = $f->get_tag_values('Analysis');
  return '#00C896' if($a =~ /H3K4(.*) - Rep1/);
  return '#00C800' if($a =~ /H3K4(.*) - Rep2/);
  return '#FA9600' if($a =~ /H3K9(.*) - Rep1/);
  return '#C86400' if($a =~ /H3K9(.*) - Rep2/);
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

sub peakTitle {
  my $f  = shift;
  my $name = $f->name;
  my $score = $f->score;
  my ($analysis) = $f->get_tag_values("Analysis");
  my @data;
  push @data, [ 'Probe Id:' => $name ];
  push @data, [ 'Analysis:' => $analysis ];
  push @data, [ 'Score:' => $score ];
  hover( "ChIP-chip called peaks $name", \@data); 
}

sub peakHeight {
  my $f = shift;
  my $score = $f->score;
  return $score; 
}

sub changeType { 
  my $f = shift;
  my ($type) = $f->get_tag_values("Type");
  return "arrow" if($type eq 'scaffold');
  return "segments";
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


sub synSpanScale {
  my $f = shift;
  my ($type) = $f->get_tag_values('Type');
  return 0 if ($type =~ /gap/i);
  my $name = $f->name;
  my ($scale) = $f->get_tag_values("Scale");
  $scale = sprintf("%.2f", $scale);
  return $name; 
}


sub snpHeight {
  my $f = shift;
  my ($rend) = $f->get_tag_values("rend"); 
  my ($base_start) = $f->get_tag_values("base_start");
  my $zoom_level = $rend - $base_start; 
  return $zoom_level <= 60000? 10 : 6;
}


1;
