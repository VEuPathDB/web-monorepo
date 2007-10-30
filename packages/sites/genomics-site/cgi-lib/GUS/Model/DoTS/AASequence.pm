
package GUS::Model::DoTS::AASequence; # table name
use strict;
use GUS::Model::DoTS::AASequence_Row;
use CBIL::Bio::SequenceUtils;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::AASequence_Row);

my $debug = 0;

sub setSequence{
	my($self,$sequence) = @_;
	print STDERR "setting sequence for ",$self->getClassName()," ",$self->getId(),"\nNew: $sequence\n\nOld: ",$self->get('sequence'),"\n\n" if $debug;
	$sequence =~ s/\s//g; ##removes any returns
	$self->set('length',length($sequence)) if $self->getLength != length($sequence);
	$sequence =~ tr/a-z/A-Z/;
  if($self->get('sequence') ne $sequence){
    $self->set('sequence',$sequence); 
  }
}

# this method is bogus: using incorrect attributes...
sub toFasta {
	my($self,$type) = @_;
	if( ! $self->hasSequence()){
		print STDERR $self->getClassName()."toFasta: not a valid method for this class\n";
		return undef;
	}
	my $defline;
	if($type){  ##use GUS id
		$defline = ">".$self->getId()."\|".$self->get('source_id').($self->get('secondary_identifier') ? "\|" . $self->get('secondary_identifier') : "")." ";
		$defline .= $self->get('description') if $self->get('description');
	}else{ $defline = ">".$self->getId(); }
	return "$defline\n" . CBIL::Bio::SequenceUtils::breakSequence($self->getSequence());
}

1;
