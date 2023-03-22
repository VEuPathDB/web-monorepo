
package GUS::Model::DoTS::VirtualSequence; # table name
use strict;
use GUS::Model::DoTS::VirtualSequence_Row;
use GUS::Supported::Sequence;

use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::VirtualSequence_Row);

sub getSequence {
    my($self, $dieIfError) = @_;

    my $vNaSeqId = $self->getNaSequenceId();
    my $dbh = $self->getDatabase()->getQueryHandle();
    my $sql = ("select * from SequencePiece " .
	       "where virtual_na_sequence_id = $vNaSeqId " .
	       "order by sequence_order asc ");

    my $sth = $dbh->prepare($sql);
    $sth->execute();
    
    my $literalSeq = "";
    my @results;

    while (my $row = $sth->fetchrow_hashref('NAME_lc')) {
	my %copy = %$row;
	push(@results, \%copy);
    }

    $sth->finish();
    my $lastCoord = 1;

    foreach my $row (@results) {
	my $strand = $row->{'strand_orientation'};
	my $distFromLeft = $row->{'distance_from_left'};
	my $uncertainty = $row->{'uncertainty'};
	my $pieceNaSeqId = $row->{'piece_na_sequence_id'};
	
	my $piece = NASequence->new({'na_sequence_id' => $pieceNaSeqId});
	$piece->retrieveFromDB();
	my $pieceSeq = $piece->getSequence();
	
	if (not defined($pieceSeq)) {
	    die "Unable to determine sequence for NASequence $pieceNaSeqId" if ($dieIfError);
	    return undef;
	}

	# If distance_from_left is defined, fill in the gap between
	# the previous sequence and this one with Ns.
	#
	if (defined($distFromLeft) && (not $distFromLeft =~ /null/i)) {
	    for (my $i = $lastCoord;$i < $distFromLeft;++$i) {
		$literalSeq .= 'N';
	    }
	    $lastCoord = $distFromLeft + length($pieceSeq);
	} else {
	    $lastCoord += length($pieceSeq);
	}
	
	# Return undef if $uncertainty is specified;
	# don't know how to handle this cases yet.
	#
	if (defined($uncertainty) && (not $uncertainty =~ /null/i)) {
	    die "Unable to handle non-null uncertainty" if ($dieIfError);
	    return undef;
	}
	
	if ($strand eq 'reverse') {
	    $literalSeq .= &Sequence::revcomp($pieceSeq);
	} else {
	    $literalSeq .= $pieceSeq;
	}
    }
    return $literalSeq;
}

1;
