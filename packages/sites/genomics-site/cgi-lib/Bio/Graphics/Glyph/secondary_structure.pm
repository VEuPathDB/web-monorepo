package Bio::Graphics::Glyph::secondary_structure;

use strict;
use Carp qw(cluck);
use Bio::Graphics::Glyph::generic;
use vars '@ISA';
@ISA = qw(Bio::Graphics::Glyph::generic);

use constant DEBUG => 0;

# turn off description
sub description { 0 }

# turn off label
# sub label { 1 }

sub height {
  my $self = shift;
  my $font = $self->font;
  return $self->dna_fits   ? 2 * $font->height
       : $self->do_plots ? $self->SUPER::height
       : 0;
}

sub pad_top {
  my $self = shift;
  return $self->option('pad_top') || 16;
}

sub pad_bottom {
  my $self = shift;
  return $self->option('pad_bottom') || 16;
}

sub do_plots {
  my $self = shift;
  my $do_lp = $self->option('do_plots');
  return  if defined($do_lp) && !$do_lp;
  return  1;
}

sub helix_color {
  my $self = shift;
  my $hc = $self->option('helix_color') || 'darkred';
  $self->panel->translate_color($hc);
}

sub coil_color {
  my $self = shift;
  my $cc = $self->option('coil_color') || 'darkblue';
  $self->panel->translate_color($cc);
}

sub strand_color {
  my $self = shift;
  my $sc = $self->option('strand_color') || 'black';
  $self->panel->translate_color($sc);
}

sub encoding_delimitor {
  my $self = shift;
  $self->option('encoding_delimitor') || '';
}

sub draw_component {
  my $self = shift;
  my $gd = shift;
  my ($x1,$y1,$x2,$y2) = $self->bounds(@_);

  my $sec_struc_encs = eval { $self->feature->secondary_structure_encodings };

  my ($min, $max) = $self->_checkEncodings($sec_struc_encs);

  if (!$max) {
    $self->draw_spacer($gd,$x1,$y1,$x2,$y2);
  } elsif ($self->do_plots && !$self->dna_fits) {
    $self->draw_plots($gd,$sec_struc_encs,$x1,$y1,$x2,$y2,$min,$max);
  } else {
    $self->draw_colorbar($gd,$sec_struc_encs,$x1,$y1,$x2,$y2,$min,$max);
  }
}

sub draw_spacer {
  my $self = shift;
  my ($gd, $x1,$y1,$x2,$y2) = @_;
  $gd->line($x1,($y2+$y1)/2, $x2,($y2+$y1)/2, $self->fgcolor);
}

sub draw_colorbar {
  my $self = shift;

  my ($gd,$sec_struc_encs,$x1,$y1,$x2,$y2,$min,$max) = @_;
  my $pixels_per_base = $self->scale;

  # to be implemented
}

sub draw_plots {
  my $self     = shift;
  my $gd       = shift;
  my $sec_struc_encs = shift;
  my ($x1,$y1,$x2,$y2,$min,$max) = @_;
  my $pw = $self->option('plot_window') || 5;

  # Calculate the plots ...
  my $helixpoints  = $self->_calculateDataPoints($sec_struc_encs->{helix},  $pw, $min, $max);
  my $coilpoints   = $self->_calculateDataPoints($sec_struc_encs->{coil},   $pw, $min, $max);
  my $strandpoints = $self->_calculateDataPoints($sec_struc_encs->{strand}, $pw, $min, $max);

  # Calculate values that will be used in the layout

  my $bin_height = $y2-$y1;
  my $fgcolor    = $self->fgcolor;
  my $bgcolor    = $self->factory->translate_color($self->panel->gridcolor);
  my $axiscolor  = $self->color('axis_color') || $fgcolor;

  my $helixcolor = $self->helix_color;
  my $coilcolor = $self->coil_color;
  my $strandcolor = $self->strand_color;

  # Draw the axes
  $gd->line($x1,  $y1,        $x1,  $y2,        $axiscolor);
  $gd->line($x2-2,$y1,        $x2-2,$y2,        $axiscolor);
  $gd->line($x1,  $y1,        $x1+3,$y1,        $axiscolor);
  $gd->line($x1,  $y2,        $x1+3,$y2,        $axiscolor);
  $gd->line($x1,  ($y2+$y1)/2,$x1+3,($y2+$y1)/2,$axiscolor);
  $gd->line($x2-4,$y1,        $x2-1, $y1,       $axiscolor);
  $gd->line($x2-4,$y2,        $x2-1, $y2,       $axiscolor);
  $gd->line($x2-4,($y2+$y1)/2,$x2-1,($y2+$y1)/2,$axiscolor);
  $gd->line($x1+5,$y2,        $x2-5,$y2,        $bgcolor);
  $gd->line($x1+5,($y2+$y1)/2,$x2-5,($y2+$y1)/2,$self->factory->translate_color('silver'));
  $gd->line($x1+5,$y1,        $x2-5,$y1,        $bgcolor);
  if ($bin_height > $self->font->height*2) {
    my $heading = $self->option('heading') || 'Secondary Structure';
    $gd->string($self->font,$x1,$y1-$self->pad_top,$heading,$axiscolor);
    $gd->string($self->font,$x1+($x2-$x1)*3/6, $y2+$self->pad_top/4, 'helix: --', $helixcolor);
    $gd->string($self->font,$x1+($x2-$x1)*4/6, $y2+$self->pad_top/4, 'strand: --', $strandcolor);
    $gd->string($self->font,$x1+($x2-$x1)*5/6, $y2+$self->pad_top/4, 'coil: --', $coilcolor);
  }

  $gd->string($self->font,$x2-20,$y1,$max,$axiscolor) 
    if $bin_height > $self->font->height*2.5;
  $gd->string($self->font,$x2-20,$y2-$self->font->height,$min,$axiscolor)
    if $bin_height > $self->font->height*2.5;

  $self->_drawPlot($gd, $x1,$y1, $x2,$y2, $bin_height, $helixpoints,  $helixcolor,  $pw);
  $self->_drawPlot($gd, $x1,$y1, $x2,$y2, $bin_height, $coilpoints,   $coilcolor,   $pw);
  $self->_drawPlot($gd, $x1,$y1, $x2,$y2, $bin_height, $strandpoints, $strandcolor, $pw);
}

sub _checkEncodings {
  my ($self, $sec_struc_encs) = @_;

  my $len = length $self->feature->seq;
  &confess("no protein sequence to show secondary structure plots for") unless $len > 0;

  unless ($sec_struc_encs && $sec_struc_encs->{helix}) {
    warn("no structure information is found");
    return (0, 0);
  }

  my $delim = $self->encoding_delimitor;
  my @h = split(/$delim/, $sec_struc_encs->{helix});
  my @c = split(/$delim/, $sec_struc_encs->{coil});
  my @s = split(/$delim/, $sec_struc_encs->{strand});

  if(DEBUG) {
    &cluck("helix encoding length (" . @h .  ") and sequence length ($len) mismatch")
      unless abs($len - scalar(@h)) <= 1;

    &cluck("coil encoding length (" . @c .  ") and sequence length ($len) mismatch")
      unless abs($len - scalar(@c)) <= 1;

    &cluck("strand encoding length (" . @s .  ") and sequence length ($len) mismatch")
      unless abs($len - scalar(@s)) <= 1;
  }

  my $min = 0;
  my $max = $h[0] + $c[0] + $s[0];
  if ($max > 0.5 && $max <= 1) {
    $max = 1;
  } elsif ($max > 5 && $max <= 10) {
    $max = 10;
  } elsif ($max > 50 && $max <= 100) {
    $max = 100;
  } else {
    &cluck("suspicious encodings") if DEBUG;
  }
  return ($min, $max);
}

sub _drawPlot {
  my $self = shift;
  my ($gd, $x1,$y1, $x2,$y2, $bin_height, $datapoints, $plot_color, $plot_window) = @_;
  my $graphwidth = $x2 - $x1;
  my @datapoints = @$datapoints;
  my $scale = $graphwidth / (@datapoints + $plot_window - 1);

  for (my $i = 1; $i < @datapoints; $i++) {
    my $x = $i + $plot_window / 2;
    my $xlo = $x1 + ($x - 1) * $scale;
    my $xhi = $x1 + $x * $scale;
    my $ylo = $y2 - ($bin_height*$datapoints[$i-1]);
    my $yhi = $y2 - ($bin_height*$datapoints[$i]);

    $gd->line($xlo, $ylo, $xhi, $yhi, $plot_color);
  }
}

sub _calculateDataPoints {
  my $self = shift;
  my ($enc, $plot_window, $min, $max) = @_;
  my @datapoints;
  my $delim = $self->encoding_delimitor;
  my @scores = split(/$delim/, $enc);

  my $p = 0;
  for (my $i = 0 ; $i < @scores && $i < $plot_window ; $i++) {
    $p += $scores[$i] || 0;
  }

  my $content = $p / $plot_window;
  push @datapoints, $content;

  for (my $i = $plot_window; $i < @scores; $i++) {
    $p -= $scores[$i-$plot_window] || 0;
    $p += $scores[$i] || 0;
    $content = $p / $plot_window;
    push @datapoints, $content;
  }

  my $scale = $max - $min;
  foreach (my $i = 0; $i < @datapoints; $i++) {
    $datapoints[$i] = ($datapoints[$i] - $min) / $scale;
  }

  return \@datapoints;
}

1;

__END__

=head1 NAME

Bio::Graphics::Glyph::protein - The "protein" glyph

=head1 SYNOPSIS

  See L<Bio::Graphics::Panel> and L<Bio::Graphics::Glyph>.

=head1 DESCRIPTION

This glyph draws protein sequences.  At high magnifications, this
glyph will draw the actual amino acids of the sequence.  At low
magnifications, the glyph will plot the Kyte-Doolite hydropathy.  By
default, the KD plot will use a window size of 9 residues, but this
can be changed by specifying the kd_window option.

For this glyph to work, the feature must return a protein sequence
string in response to the seq() method.

=head2 OPTIONS

The following options are standard among all Glyphs.  See
L<Bio::Graphics::Glyph> for a full explanation.

  Option      Description                      Default
  ------      -----------                      -------

  -fgcolor      Foreground color	       black

  -outlinecolor	Synonym for -fgcolor

  -bgcolor      Background color               turquoise

  -fillcolor    Synonym for -bgcolor

  -linewidth    Line width                     1

  -height       Height of glyph		       10

  -font         Glyph font		       gdSmallFont

  -connector    Connector type                 0 (false)

  -connector_color
                Connector color                black

  -label        Whether to draw a label	       0 (false)

  -description  Whether to draw a description  0 (false)

  -hilite       Highlight color                undef (no color)

In addition to the common options, the following glyph-specific
options are recognized:

  Option      Description               Default
  ------      -----------               -------

  -do_kd      Whether to draw the Kyte-  true
              Doolittle hydropathy plot
              at low mags

  -kd_window  Size of the sliding window  9
  	      to use in the KD hydropathy 
	      calculation.

  -axis_color Color of the vertical axes  fgcolor
              in the KD hydropathy plot


=head1 BUGS

Please report them.

=head1 SEE ALSO

L<Bio::Graphics::Panel>,
L<Bio::Graphics::Glyph>,
L<Bio::Graphics::Glyph::arrow>,
L<Bio::Graphics::Glyph::cds>,
L<Bio::Graphics::Glyph::crossbox>,
L<Bio::Graphics::Glyph::diamond>,
L<Bio::Graphics::Glyph::dna>,
L<Bio::Graphics::Glyph::dot>,
L<Bio::Graphics::Glyph::ellipse>,
L<Bio::Graphics::Glyph::extending_arrow>,
L<Bio::Graphics::Glyph::generic>,
L<Bio::Graphics::Glyph::graded_segments>,
L<Bio::Graphics::Glyph::heterogeneous_segments>,
L<Bio::Graphics::Glyph::line>,
L<Bio::Graphics::Glyph::pinsertion>,
L<Bio::Graphics::Glyph::primers>,
L<Bio::Graphics::Glyph::rndrect>,
L<Bio::Graphics::Glyph::segments>,
L<Bio::Graphics::Glyph::ruler_arrow>,
L<Bio::Graphics::Glyph::toomany>,
L<Bio::Graphics::Glyph::transcript>,
L<Bio::Graphics::Glyph::transcript2>,
L<Bio::Graphics::Glyph::translation>,
L<Bio::Graphics::Glyph::triangle>,
L<Bio::DB::GFF>,
L<Bio::SeqI>,
L<Bio::SeqFeatureI>,
L<Bio::Das>,
L<GD>

=head1 AUTHOR

Y. Thomas Gan, based on the "dna" glyphy by Lincoln Stein
E<lt>lstein@cshl.orgE<gt> and Peter Ashton E<lt>pda@sanger.ac.ukE<gt>.

This library is free software; you can redistribute it and/or modify
it under the same terms as Perl itself.  See DISCLAIMER.txt for
disclaimers of warranty.

=cut
