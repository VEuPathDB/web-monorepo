
package GUS::Model::DoTS::RNA; # table name
use strict;
use GUS::Model::DoTS::RNA_Row;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::RNA_Row);

my $debug = 0;

##this is the set of RNA classes that will get submitted automatically upon cleanUp() or submit()
my $naClasses = ['Assembly','ExternalNASequence','NASequence']; ##others will get added dynamically if they are retrieved.

sub getNASequences{
	my($self,$naClass,$retrieve,$getDeletedToo,$where) = @_;
	my @ass;
	print STDERR "RNA->getRNAs\($naClass,$retrieve,$getDeletedToo\)\n" if $debug == 1;
	foreach my $rs ($self->getChildren('DoTS::RNAInstance',$retrieve,$getDeletedToo,$where)){
		print STDERR $rs->toString() if $debug == 1;
		print STDERR $rs->getId()," $rs\n" if $debug == 2;
		my $f = $rs->getParent('DoTS::NAFeature',$retrieve);
		return undef unless $f;
		print STDERR $f->toString() if $debug == 1;
		print STDERR $f->getId()," $f\n" if $debug == 2;
		my $ass = $f->getParent($naClass,$retrieve);
		print STDERR $ass->toString() if $debug == 1 && $ass;
		print STDERR $ass->getId()," $ass\n" if $debug == 2 && $ass;
		push(@ass,$ass) if $ass;
	}
	##add the rna to the rnaClass if have retrieve something that was not there...
	if(scalar(@ass) > 0 && !grep(/^$naClass$/,@{$naClasses})){
		push(@{$naClasses},$naClass);
	}
	return @ass;
}

sub getNASequence {
	my($self,$naClass,$retrieve,$getDeletedToo,$where) = @_;
	my @tmp = $self->getNASequences($naClass,$retrieve,$getDeletedToo,$where);
	return $tmp[0];
}

## override submit so submits all NASequences....
sub submit{
  my($self,$notDeep,$noTran,$noNASequences) = @_;

	$self->manageTransaction($noTran,'begin');

	##submit all NAsequences that have....
	##need to do first so if there are deleted ones can still get to them....delete removes parent pointers.
	if(!$noNASequences){  ##only submit these if not suppressing naseuqences
		foreach my $na (@{$naClasses}){
			foreach my $a ($self->getNASequences($na,undef,1)){ ##also get the ones marked deleted...
				next unless $a;
				print STDERR "Submitting $a: ".$a->getId()."\n" if $debug;
				$a->submit($notDeep,1);
			}
		}
	}

	##submit self using super then submit each assembly...
	$self->SUPER::submit($notDeep,1); ##already in transaction..

	$self->manageTransaction($noTran,'commit');

}
1;
