package GUS::Supported::Sequence;

# ----------------------------------------------------------
# Sequence.pm
# 
# Sequence-related utilities.  Distinct from SeqUtils because
# none of the methods defined in this package necessarily 
# assume that the sequence in question is a GUS sequence.
#
# Created: Mon Apr 17 13:55:43 EDT 2000
#
# Jonathan Crabtree
#
# $Revision: 2929 $ $Date: 2005-06-17 10:17:13 -0400 (Fri, 17 Jun 2005) $ $Author: sfischer $
# ----------------------------------------------------------

use strict;

use DBI;

use GUS::Model::DoTS::Assembly;
use GUS::Model::DoTS::NASequence;
use CBIL::Bio::SequenceUtils;

#require NSEQ;

##have replaced NSEQ with SequenceUtils function (reverseComplement)
#BEGIN {
#    unshift @INC, '/usr/local/lib/perl5/site_perl/sun4-solaris/auto/NSEQ/';
#    unshift @INC, '/usr/lib/perl5/site_perl/5.005/i386-linux/auto/NSEQ/';
#}

# ----------------------------------------------------------
# Reverse complement function from jschug's NSEQ module.
#
sub revcomp {
  my($seq_string) = @_;
  my @s = reverse(split(//,$seq_string));
  return join("", map {sprintf("%c",CBIL::Bio::SequenceUtils::reverseComplement(ord($_)))} @s);
#  return join("", map {sprintf("%c",NSEQ::complement(ord($_)))} @s);
}

# ----------------------------------------------------------
# parseFasta
#
# Parse a FASTA-format sequence file/database.  Returns the number
# of sequences processed or undef if an error occurs.
#
# $fName       File containing the FASTA database.
# $callback    Callback function invoked on every (defline, sequence)
#              pair read from the file.  The argument will be a hash
#              with the keys 'defline' and 'sequence'
# $lowercase   Whether to convert all the sequences read to lowercase.
# $dieIfError  Whether to halt if an error is detected (default = no)
#
sub parseFasta {
    my($fName, $callback, $lowercase, $dieIfError) = @_;
    my $nSeqs = 0;

    my $seq = undef;
    my $defline = undef;

    if ($fName =~ /\.gz$/) {
	open(FF, "zcat $fName |") || !$dieIfError || die "Unable to open $fName";
    } elsif ($fName =~ /\.zip$/) {
	open(FF, "unzip -p $fName |") || !$dieIfError || die "Unable to open $fName";
    } else {
	open(FF, $fName) || !$dieIfError || die "Unable to open $fName";
    }

    while(<FF>) {
	if (/^>/) {
	    chomp;
	    my $newDefline = $_;
	    $nSeqs += &$callback({'defline' => $defline, 'sequence' => $seq}) if (defined($seq));
	    $defline = $newDefline;
	    $seq = "";
	} 
	
	# sequence line; remove whitespace, optionally convert to lowercase
	#
	else {
	    my $line = $_;
	    $line =~ s/\s+//g;
	    $line =~ tr/[A-Z]/[a-z]/ if ($lowercase);
	    $seq .= $line;
	}
    }
    $nSeqs += &$callback({'defline' => $defline, 'sequence' => $seq}) if (defined($seq));

    close(FF);
    return $nSeqs;
}

# ----------------------------------------------------------
# getCounts()
#
# INPUT:
# $seq         Sequence with NO newlines, whitespace, or FASTA defline.
# $len         Optional length of $seq.
# $dieIfError  Whether to halt if an error is detected (default = no)
#
# OUTPUT:
# Returns the counts of 'a', 'c', 'g', 't', and 'other'
# in an anonymous hash.
#
# Modified to count string composition in STRIDE chunks,
# each chunk derived from substr() then split() into an array.   
# The motivation was to reduce calls to Perl's substr() function.
# The previous getCounts() made strlen($seq) invocations of substr(),
# which due to UTF-8 encoding of XML XML::Parser and XML::Simple,
# caused extremely long processing (> 10 hours) for sequences on
# the order of mbases in length. TC072003

use constant STRIDE => 1024*16;

sub getCounts {
    my($seq, $len, $dieIfError) = @_;
    my $lengthlocal = length($seq);
    $len = $lengthlocal unless defined($len);

    #printf STDERR "-------> getCounts() LENGTH = $lengthlocal\n";
    my %charhash = ();
    my $remaining = $lengthlocal;

    for(my $offset=0; $remaining>0; $offset += STRIDE) {
       my $substrlength = (STRIDE > $remaining) ? $remaining : STRIDE;
       my $substring = substr($seq, $offset, $substrlength);
       $remaining -= $substrlength;
       my @seqArray = split(//,$substring);
       for (my $i = 0; $i < $substrlength; $i++) {
         $charhash{lc($seqArray[$i])}++;       
       }
    }

    my $a = $charhash{'a'};
    my $c = $charhash{'c'};
    my $g = $charhash{'g'};
    my $t = $charhash{'t'};
    my $o = $lengthlocal - ($a+$c+$g+$t);

    # Sanity check
    #
    if ( ($a + $g + $t + $c + $o) != $len )  {
        my $desc = "Sum of counts does not match sequence length";
	printf STDERR "ERROR Supported::Sequence::getCounts() : $desc\n";
        printf STDERR "getCounts() counts: a=$a g=$g t=$t c=$c o=$o length=$len\n";
	die "Terminating in Supported::Sequence::getCounts()\n" if ($dieIfError);
    }

    return {'a' => $a, 'c' => $c, 'g' => $g, 't' => $t, 'o' => $o};
}

# ----------------------------------------------------------
# toFasta
#
# Create a FASTA-format sequence entry.
#
# $seq         Sequence with NO newlines, whitespace, or FASTA defline.
# $defline     Definition line for the FASTA entry (not including '>')
# $width       Width of the actual sequence in characters.
#
sub toFasta {
    my($seq, $defline, $width) = @_;

    my $rs = ">$defline\n";
    
    my $start = 0;
    my $end = length($seq);

    for (my $i = $start;$i <= $end;$i += $width) {
	if ($width + $i > $end) {
	    $rs .= substr($seq, $i, $end - $i + 1) . "\n";
	} else {
	    $rs .= substr($seq, $i, $width) . "\n";
	}
    }
    chomp($rs);
    return $rs;
}

# ----------------------------------------------------------
# maskWithSpans
#
# Mask a sequence with a set of spans of the form
# {'start' => 3, 'end' => 23}
#
# $seq      Sequence with NO newlines, whitespace, or FASTA defline.
# $spans    ref to an array of spans to mask
#
sub maskWithSpans {
    my ($seq, $spans) = @_;
    
    $seq =~ s/[\n\s]*//g;

    foreach my $span (@$spans) {
	my $s = $span->{'start'} - 1;
	my $e = $span->{'end'} - 1;
	
	for (my $i = $s;$i <= $e;++$i) {
	    substr($seq, $i, 1) = 'N';
	}
    }
    return $seq;
}

# ----------------------------------------------------------
# getMaskedSpans
#
# Retrieve MaskedSpans for a given na_sequence_id.
#
# $naSeqId    na_sequence_id
# $dbh        Sybase database login
# $type       'low complexity', 'repeat', 'vector', or 'all'
#
sub getMaskedSpans {
    my($naSeqId, $dbh, $type, $algImpID) = @_;
    
    my $sql = "select * from MaskedSpan ms where ms.na_sequence_id = $naSeqId";

    if (defined($algImpID)) {
	$sql = qq[select * 
		  from MaskedSpan ms, AlgorithmInvocation ai
		  where ms.na_sequence_id = $naSeqId
		  and ms.row_alg_invocation_id = ai.algorithm_invocation_id
		  and ai.algorithm_imp_id = $algImpID];
    }

    if (($type eq 'low complexity') || ($type eq 'repeat') || ($type eq 'vector')) {
	$sql .= " and ms.mask_type = '$type'";
    }
	
    my $sth = $dbh->prepare($sql);
    $sth->execute();
    my @spans;

    while (my $row = $sth->fetchrow_hashref('NAME_lc')) {
	push(@spans, {'start' => $row->{'mask_start'},
		      'end' => $row->{'mask_end'},
		      'type' => $row->{'mask_type'}});
    }
    $sth->finish();

    return \@spans;
}

# ----------------------------------------------------------
# getVirtualSequence
#
# Retrieve the literal sequence for a VirtualSequence
# (if possible.)  Returns undef if the sequence cannot be 
# determined.
#
# NOTE: This should be migrated into the VirtualSequence 
# class as its getSequence method.
#
# $vSeq   GUS VirtualSequence object
#
sub getVirtualSequence {
    my($vSeq, $dieIfError) = @_;

    my $vNaSeqId = $vSeq->getNaSequenceId();
    my $dbh = $vSeq->getDatabase()->getQueryHandle();

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
	
	my $piece = GUS::Model::DoTS::NASequence->new({'na_sequence_id' => $pieceNaSeqId});
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
	    $literalSeq .= &revcomp($pieceSeq);
	} else {
	    $literalSeq .= $pieceSeq;
	}
    }
    return $literalSeq;
}


# ----------------------------------------------------------
# getSequence
#
# Retrieve the literal sequence for an NASequence object.
# Special-case code is required when the sequence is a
# singleton Assembly.
#
# $naSeq
#
sub getSequence {
    my($naSeq, $dieIfError) = @_;

    my $subclass = $naSeq->get('subclass_view');
    my $result;

    if ($subclass eq 'Assembly') {
	my $ass = GUS::Model::DoTS::Assembly->new({'na_sequence_id' => $naSeq->get('na_sequence_id')});
	$ass->retrieveFromDB();
	$result = $ass->getSequence();
    } else {
	$result = $naSeq->getSequence();
    }

    if ((not defined($result)) || ($result =~ /^\s*$/)) {
	print STDERR "Sequence: unable to retrieve sequence for na_sequence_id = ", 
	$naSeq->getNaSequenceId(), "\n";
	die if ($dieIfError);
    }
    return $result;
}

1;

