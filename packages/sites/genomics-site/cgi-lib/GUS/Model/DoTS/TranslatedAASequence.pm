
package GUS::Model::DoTS::TranslatedAASequence; # table name
use strict;
use GUS::Model::DoTS::TranslatedAASequence_Row;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::TranslatedAASequence_Row);

sub getSequence {
  my $self = shift;
  if(!$self->get('sequence')) {
    my $tf = $self->getChild('DoTS::TranslatedAAFeature',1);
    if(!$tf){
      print STDERR "No TranslatedAAFeature for TranslatedAASequence.",$self->getId(),"\n";
      return undef;
    }
    return $tf->translateFeatureSequenceFromNASequence();
  }	
  return $self->get('sequence');
}


1;
