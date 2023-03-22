package Bio::Graphics::Glyph::processed_transcript_gtu;

# gtu = Grey Thin UTR

use strict;
use base qw(Bio::Graphics::Glyph::processed_transcript);

use constant DEFAULT_UTR_COLOR => '#D0D0D0';

sub utr_color {
  my $self = shift;
#  return $self->SUPER::bgcolor if $self->thin_utr;
  return $self->color('utr_color') if $self->option('utr_color');
  return $self->factory->translate_color(DEFAULT_UTR_COLOR);
}

1;
