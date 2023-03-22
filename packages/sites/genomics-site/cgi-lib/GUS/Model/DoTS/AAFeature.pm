
package GUS::Model::DoTS::AAFeature;              # table name
use strict;
use GUS::Model::DoTS::AAFeature_Row;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::AAFeature_Row);

sub getFeatureSequence {
  my $self = shift;
  if (!exists $self->{'sequence'}) {
    my $seqob = $self->getParent('DoTS::AASequence',1);
    my($start,$stop) = $self->getFeatureLocation();
    if ($stop) {                ##have a valid location
      $self->{'sequence'} = $seqob->{'didNotRetrieve'}->{'sequence'} ? $seqob->getSubstrFromClob('sequence',$start,$stop-$start+1) : substr($seqob->getSequence(),$start-1,$stop-$start+1);
    } else {
      $self->{'sequence'} =  $seqob->{'didNotRetrieve'}->{'sequence'} ? $seqob->getSubstrFromClob('sequence',1,$seqob->getLength()) : $seqob->getSequence(); ##return the entire sequence..
    }
  }
  return $self->{'sequence'};
}

##returns simple location...just with a start and stop and is_reversed..
sub getFeatureLocation {
  my($self) = @_;
  my($start,$end);
  my @loc = $self->getChildren('DoTS::AALocation',1);
  if (scalar(@loc) > 1) {
    ##complex location such as for genes exons....
    ##we are representing a hierarchical feature structure
    ##each of which should have only one location so do later
    print STDERR $self->getClassName()."->getLocation: complex location....returning undef\n";
    return undef;
  } elsif (scalar(@loc) == 1) {
    $start = $loc[0]->get('start_min') ? $loc[0]->get('start_min') : $loc[0]->get('start_max');
    $end = $loc[0]->get('end_max') ? $loc[0]->get('end_max') : $loc[0]->get('end_min');
    return ($start,$end);
  }
  return undef;
}

sub getFuzzyLocation {
  my $self = shift;
  print STDERR "getFuzzyLocation: NOT implemented\n";
}

##for complex locations...
sub getLocations {
  my $self = shift;
  print STDERR "getLocations: NOT implemented\n";
}


1;
