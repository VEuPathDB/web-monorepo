
package GUS::Model::DoTS::TranslatedAAFeature; # table name

use strict;
use GUS::Model::DoTS::TranslatedAAFeature_Row;
use CBIL::Bio::SequenceUtils;

my $debug = 0;

use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::TranslatedAAFeature_Row);

sub translateFeatureSequenceFromNASequence {
  my($self,$codon_table) = @_;
  my $ct = $codon_table ? $codon_table : 0;
  if (!exists $self->{'transSeq'}){
    my $seq = CBIL::Bio::SequenceUtils::translateSequence($self->getFeatureNASequence(),$ct);
    $seq =~ s/\*+$//;
    $self->{'transSeq'} = $seq;
  }
  return $self->{'transSeq'};
}

sub getFeatureSequence {
  my $self = shift;
  if (!exists $self->{'sequence'}) {
    
    my $seq = $self->getParent('DoTS::AASequence',1)->getSequence();
    if(!$seq){
      $self->{sequence} = $self->translateFeatureSequenceFromNASequence()
    }else{
      my($start,$stop) = $self->getFeatureLocation();
      if ($stop) { ##have a valid location
        substr($seq,$start - 1,$stop-$start+1);
      } else {
        $self->{'sequence'} =  $seq; ##return the entire sequence..
      }
    }
  }
  return $self->{'sequence'};
}


sub getFeatureNASequence {
  my $self = shift;
  if(!$self->{featureNASequence}) {
    my @segs = sort { $a->getAaStartPos() <=> $b->getAaStartPos() } $self->getChildren('DoTS::TranslatedAAFeatSeg',1);
    if(scalar(@segs) > 0 ) {
      foreach my $s (@segs) {
        $self->{featureNASequence} .= $s->getNASequenceSegment();
      }
    } else {
      my $start = $self->getTranslationStart();
      my $stop = $self->getTranslationStop();
      my $rna = $self->getParent('DoTS::RNAFeature',1);
      if(!$start || !$stop){
        ($start,$stop) = $rna->getTranslationStartStop();
      }

      print STDERR "TranslatedAAFeature->getFeatureNASequence: \$rna->getFeatureSequence()=", $rna->getFeatureSequence(), "\n" if $debug;

      $self->{'featureNASequence'} = $self->getIsReversed() ?  CBIL::Bio::SequenceUtils::->reverseComplementSequence(substr($rna->getFeatureSequence(),$start-1,$stop-$start + 1)) : substr($rna->getFeatureSequence(),$start-1,$stop-$start + 1);
    }
  }
  return $self->{featureNASequence};

}

1;
