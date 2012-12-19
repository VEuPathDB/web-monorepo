package Bio::DB::BigWigSetEuPath;

use strict;
use base qw(Bio::DB::BigWigSet);

sub new {
    my $class = shift;
    my %opts = $_[0] =~ /^-/ ? @_ : (-dir=>shift);
    my $self  = $class->_new();
    $self->readdir($opts{-dir})         if $opts{-dir};

    if ($opts{-index} && $opts{-bigwigdir}) {
      $self->read_index($ENV{GUS_HOME}. '/lib/gbrowse/metadata/'. $opts{-index}, $opts{-bigwigdir})    
    } elsif ($opts{-index}) {
      $self->read_index($opts{-index});   
    }

    $self;
}

1;
