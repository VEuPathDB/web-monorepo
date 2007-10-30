
package GUS::Model::DoTS::NAFeature;              # table name
use strict;
use GUS::Model::DoTS::NAFeature_Row;
use GUS::Model::DoTS::NASequence;
use CBIL::Bio::SequenceUtils;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::NAFeature_Row);


my $debug = 0;

sub getFeatureSequence {
  my $self = shift;
  print STDERR $self->getClassName()."->getFeatureSequence\n" if $debug;
  if (!exists $self->{'sequence'}) {
    my $seqob = $self->getParent('DoTS::NASequence',1,['sequence']);
    #    print STDERR "Parent sequence length: ".length($seqob->getSequence())."\n";
    #    print STDERR $seqob->toXML();
    return undef unless $seqob;
    my($start,$stop,$is_reversed) = $self->getFeatureLocation();
    my $length = $stop - $start + 1;
    print STDERR "Have Location start = $start, stop = $stop, is_reversed = '$is_reversed'\n FeatureLength - $length\n" if $debug;

    ##use plsql substring method......sequence objects call this directly!!
    if ($stop) {                ##have a valid location
      print STDERR "Sequence complement: ".CBIL::Bio::SequenceUtils::reverseComplementSequence($seqob->getSubstrFromClob('sequence',$start,$length))."\n" if ($debug && $is_reversed);
      $self->{'sequence'} = $seqob->{'didNotRetrieve'}->{sequence} ?
        ( $is_reversed ? CBIL::Bio::SequenceUtils::reverseComplementSequence($seqob->getSubstrFromClob('sequence',$start,$length)) : $seqob->getSubstrFromClob('sequence',$start,$length)) :
        ( $is_reversed ? CBIL::Bio::SequenceUtils::reverseComplementSequence(substr($seqob->getSequence(),$start-1,$length)) : substr($seqob->getSequence(),$start,$length) );
    } else {
      print STDERR $self->getClassName(),"->getFeatureSequence: ERROR - Invalid location\n";
    }
  }
  return $self->{'sequence'};
}

##returns simple location...just with a start and stop and is_reversed..
##thus is a feature has multiple locations uses loc_order to sort and returns start of first
##and end of last location...
sub getFeatureLocation {
  my($self) = @_;
  my($start,$end);
  print STDERR $self->getClassName()."->getFeatureLocation\n" if $debug;
  my @loc = $self->getChildren('DoTS::NALocation',1);
  if (scalar(@loc) > 1) {
    ##complex location such as for genes exons....
    ##we are representing a hierarchical feature structure
    ##each of which should have only one location so do later
    ##return the edges (min and max) locations
    #    foreach my $l (@loc){ print $self->getSubclassView(),": ",$l->toXML(0,1); }
    my @sort = sort { $a->getLocOrder() <=> $b->getLocOrder() } @loc;
    print STDERR "Start: ",$sort[0]->toXML(0,1),"\nEnd",$sort[-1]->toXML(0,1) if $debug;
    $start = $sort[0]->get('start_min') ? $sort[0]->get('start_min') : $sort[0]->get('start_max');
    $end = $sort[-1]->get('end_max') ? $sort[-1]->get('end_max') : $sort[-1]->get('end_min');
    return ($start,$end,$loc[0]->get('is_reversed'));
  } elsif (scalar(@loc) == 1) {
    $start = $loc[0]->get('start_min') ? $loc[0]->get('start_min') : $loc[0]->get('start_max');
    $end = $loc[0]->get('end_max') ? $loc[0]->get('end_max') : $loc[0]->get('end_min');
    return ($start,$end,$loc[0]->get('is_reversed'));
  } elsif (scalar(@loc) == 0) { #return whole thing...has no location such as for RNAFeature
    $start = 1;
    $end = $self->getParent('DoTS::NASequence',1,['sequence'])->getLength();
    return($start,$end,0);
  }
  return undef;
}

sub getFuzzyLocation {
  my $self = shift;
  print STDERR "getFuzzyLocation: NOT implemented\n";
}

##for complex locations...
sub getLocations {
  my ($self) = shift;
  print STDERR "NAFEature->getLocations: NOT IMPLEMENTED YET!!\n";
}

sub getFeatureLength {
  my $self = shift;
  if (!exists $self->{'featurelength'}) {
    my($start,$end,$is_reversed) = $self->getFeatureLocation();
    $self->{'featurelength'} = $end - $start + 1;
  }
  return $self->{'featurelength'};
}


1;
