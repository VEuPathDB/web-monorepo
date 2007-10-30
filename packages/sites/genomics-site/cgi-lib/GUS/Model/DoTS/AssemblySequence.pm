
package GUS::Model::DoTS::AssemblySequence;       # table name
use strict;
use GUS::Model::DoTS::AssemblySequence_Row;
use CBIL::Bio::SequenceUtils;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::AssemblySequence_Row);

my $debug = 0;

##geting sequence
sub getSequence{
  my $self = shift;
  if (!exists $self->{'sequence'}) {
    ##automatically to retrieve from database if don't have the na_sequence_id
    unless($self->get('na_sequence_id')){
      $self->retrieveFromDB();
    }
    print STDERR "getSequence: retrieving ExternalNASequence obj\n" if $debug == 1;
    #    $self->retrieveParentFromDB('ExternalNASequence');
    my $nas = $self->getParent('DoTS::ExternalNASequence',1);
    my $tseq = $nas->getSequence();
    $tseq =~ tr/a-z/A-Z/;       ##upercase everything
    my $start = $self->get('sequence_start') - 1;
    my $length = ($self->get('sequence_end') - $start);
    if ($self->get('assembly_strand')) { ##is in forward orientation
      $self->{'sequence'} = substr($tseq,$start,$length);
    } else {
      $self->{'sequence'} = CBIL::Bio::SequenceUtils::reverseComplementSequence(substr($tseq,$start,$length));
    }
  }
  return $self->{'sequence'};
}

##set sequence should take in a sequence and generate the sequence_start and sequence_end against the ExternalNASequence
sub setSequence {
  my($self,$sequence) = @_;
  my $nas = $self->getParent('DoTS::ExternalNASequence',1)->getSequence();
  $nas =~ tr/a-z/A-Z/;          #3upper case it as this is what do with assemblySequence..
  $sequence =~ tr/a-z/A-Z/;
  $sequence =~ s/\s//g;
  ##there could be residual N's on the ends from blocking and trimming.....remove just in case....
  $sequence =~ s/^N*(\w*?)N*$/$1/;
  my $index = index($nas,$sequence);
  if ($index >= 0) {            ##matches forward strand...
    $self->set('assembly_strand',1);
  } else {
    $index = index($nas,CBIL::Bio::SequenceUtils::reverseComplementSequence($sequence));
    if ($index >= 0) {          ##sequence matches on reverse strand
      $self->set('assembly_strand',0);
    } else {                    ##does not match...
      print STDERR "ERROR: AssemblySequence->setSequence - sequence does not match ExternalNASequence: NOT UPDATING\n", $self->getParent('DoTS::ExternalNASequence',1)->toFasta(),"\nAssemblySequence: ",$self->getId(),"\n",CBIL::Bio::SequenceUtils::breakSequence($sequence);
      ##don't want to update this sequence!!
      $self->setUpdateable(0);
      return undef;
    }
  }

  print STDERR "Index: ",$index + 1," stop: ",$index + length($sequence),"\n" if $debug == 1;
  $self->set('sequence_start',$index + 1);
  $self->set('sequence_end',$index + length($sequence));
  $self->{'sequence'} = $sequence;
}

#trimming may result from a contained assembly getting trimmed by cap4
#Atts to change:  sequence_start,sequence_end,gapped_sequence,assembly_offset
# $aStart is start position of the trim in the Assembly parent
# $aLength is length of the resulting gapped consensus from Assembly Parent
sub trimAssembledSequence {
  my($self,$aStart,$aLength) = @_;
  print STDERR $self->getId()," AssemblySequence->trimAssembledSequence($aStart,$aLength)\n" if $debug;
  #  print STDERR $self->toXML(0,1);
  ##what about if this one is entirely removed from assembly because outside the trim??
  if ($aStart >= $self->getAssemblyOffset() + $self->getGappedLength() || $aStart + $aLength <= $self->getAssemblyOffset()) {
    print STDERR " Outside bounds: Offset=".($self->getAssemblyOffset()).", length=".($self->getGappedLength())."\n" if $debug;
    ##??should I null my assembly_na_sequence_id or let Assembly do that?
    return 0;
  }

  ##first the gappedSequence
  my $gappedSeqStart = $aStart < $self->getAssemblyOffset() ? 0 : $aStart - $self->getAssemblyOffset();
  my $gappedLength = $aStart + $aLength >= $self->getAssemblyOffset() + $self->getGappedLength() ? $self->getGappedLength() - $gappedSeqStart : ($aStart + $aLength) - ($self->getAssemblyOffset() + $gappedSeqStart);
  my $gappedSeq = substr($self->getGappedSequence(),$gappedSeqStart,$gappedLength);
  #  print STDERR " gappedSeqStart=$gappedSeqStart, gappedLength=$gappedLength, gappedSeq=$gappedSeq\n  OldGappedSeq=",$self->getGappedSequence(),"\n";
  ##if gapped sequence truncated then set and trim the sequence
  if (length($gappedSeq) < length($self->getGappedSequence())) { ##has been truncated
    ##set ends first...count gaps in trimmed region and then trim by the length without gaps
    my($seqStart,$seqLength) = $self->getSeqStartLengthFromGappedSeqStart($gappedSeqStart,$gappedSeq);
    if ($self->getAssemblyStrand() == 1) { ##forward 
      ##NOTE:  sequence_start is the first base....1 = beginning and sequence_end is last base.
      $self->setSequenceStart($self->getSequenceStart() + $seqStart) unless $seqStart == 0;
    } else {                    ##reversed
      my $oldLength = $self->getSequenceEnd() - $self->getSequenceStart() + 1;
      ## not sure this is right!!
      $self->setSequenceStart($self->getSequenceStart() + ($oldLength - ($seqLength + $seqStart)));
    }
    $self->setSequenceEnd($self->getSequenceStart() + ($seqLength - 1));
    $self->setGappedSequence($gappedSeq);
  }

  ##sanity check....see if new sequence eq gappedsequence without gaps...

  
  ##the offset will be changed if $aStart > 0
  $self->setAssemblyOffset($self->getAssemblyOffset() - $aStart <= 0 ? 0 : $self->getAssemblyOffset() - $aStart) unless $aStart == 0;

  #  print STDERR $self->toXML(0,1);

  return 1;
}

##note that these are relative to the current sequence...
sub getSeqStartLengthFromGappedSeqStart {
  my($self,$gsStart,$gappedSeq) = @_;
  my $tmpLeader = substr($self->getGappedSequence(),0,$gsStart);
  $tmpLeader =~ s/-//g;

  $gappedSeq =~ s/-//g;         ##remove gaps.

  return ( length($tmpLeader), length($gappedSeq) );
}

##resets this AssemblySequence to singleton status...
sub resetAssemblySequence {
  my $self = shift;
  print STDERR "resetAsemblySequence:\n",$self->toXML(0,1) if $debug;
  ##mark the sequenceGaps deleted...note that this is important if reassembling and
  ## is a good check if new sequence as could potentially have some sequence gaps that
  ## could screw up the waterworks
  $self->setGappedSequence('') if $self->getGappedSequence(); ##set the gaps to the empty string..
  $self->setAssemblyOffset(0) if $self->getAssemblyOffset() != 0;
  $self->setAssemblyStrand(1) if($self->getAssemblyStrand() == 0); ##assemblySequence is reversecomplemented
  $self->setHaveProcessed(1) if($self->getHaveProcessed() == 0);
  $self->setAssemblyNaSequenceId("NULL") if $self->getAssemblyNaSequenceId();
  $self->setSequenceStart($self->getQualityStart) unless $self->getSequenceStart() == $self->getQualityStart();
  $self->setSequenceEnd($self->getQualityEnd) unless $self->getSequenceEnd() == $self->getQualityEnd();
  delete $self->{'sequence'}; 
  print STDERR "resetAsemblySequence...finished:\n",$self->toXML(0,1) if $debug;
}

sub toFasta{
  my($self,$type) = @_;
  if ($type) {
    return CBIL::Bio::SequenceUtils::makeFastaFormattedSequence($self->getId(),$self->getSequence());
  }
  my $p = $self->getParent('DoTS::ExternalNASequence',1);
  ##note could add in the description to make a better defline here..deal with "NULL"
  return CBIL::Bio::SequenceUtils::makeFastaFormattedSequence($p->get('source_id'),$self->getSequence());
}

##XML format for cap4
sub toCAML {
  my($self,$qual,$index) = @_;
  my $caml;
  my $isSinglet = $self->isSinglet();  ##identifies if singlet
  $isSinglet = 1;  ##always print as if singlet so will assemble with <CONTIG assemblies
  #  $caml  = "  <".($self->isSinglet() ? "SINGLET" : "SEQUENCE")." NAME=\"".$self->getId()."\">    <BASE>".$self->getSequence()."    </BASE>\n";
  $caml = "  <".($isSinglet ? "SINGLET" : "SEQUENCE")." LENGTH=\"".$self->getLength()."\" ".($index ? "INDEX=\"$index\" " : "")."NAME=\"".$self->getId()."\">";
  $caml .= "\n    <BASE>\n".CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),60,'      ')."    </BASE>\n";
  #  $caml .= "    <BASE>\n".CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),74,'      ')."    </BASE>\n";
  ##now quality values....20 for rna and 10 for est
  if ($qual) {
    $caml .= "    <QUALITY>\n".$self->getQualityValues()."    </QUALITY>\n";
  }
  $caml .= $isSinglet ? "  </SINGLET>\n" : "  </SEQUENCE>\n";
  return $caml;
}

sub getQualityValues {
  my ($self) = @_;
  my @qual;
	my $length = length($self->getSequence());
  if ($self->getParent('DoTS::ExternalNASequence',1)->getSequenceTypeId() == 8) { ##is est
    for (my $i = 0;$i<$length;$i++) {
      push(@qual,11);
    }
  } else {
    for (my $i = 0;$i<$length;$i++) {
      push(@qual,22);
    }
  }
  my $tmp;
  for(my $i = 0;$i < scalar(@qual);$i += 25){
    $tmp .= '      '.join(' ',@qual[$i..$i+24])."\n";
  }
  return $tmp;
}

sub parseCap4Caml {
  my($self,$caml) = @_;
  #  print STDERR "AssemblySequence ",$self->getId(),"->parseCap4Caml($caml)\n";
  if ($caml =~ /^\s*\<SEQUENCE (.*?)\>(.*)\<\/SEQUENCE\>/) {
    $self->setSinglet(0);
    my $seqAtts = $self->getCamlAtts($1);
    my $seq = $2;
    ##now need to set stuff from atts...
    ##note that need to not set if not changed...just getting to work for now
    $self->setAssemblyOffset($seqAtts->{OFFSET}) unless $self->getAssemblyOffset == $seqAtts->{OFFSET};
    my $strand = $seqAtts->{ORIENT} =~ /for/i ? "1" : "0";
    $self->setAssemblyStrand($strand) unless $self->getAssemblyStrand() == $strand;
    my $sequenceStart = ($self->getSequenceStart() ? $self->getSequenceStart() : 1) + ($strand ? $seqAtts->{LEFTCLIP} : $seqAtts->{LENGTH} - 1 - $seqAtts->{RIGHTCLIP});
    $self->setSequenceStart($sequenceStart) unless $self->getSequenceStart() == $sequenceStart;
    my $sequenceEnd = $self->getSequenceStart() + $seqAtts->{RIGHTCLIP} - $seqAtts->{LEFTCLIP};
    $self->setSequenceEnd($sequenceEnd) unless $sequenceEnd == $self->getSequenceEnd();
    ##marked as chimera...update $self
    ##only happens if is  SINGLET
    #    if($seqAtts->{CHIMERA}){
    #      $self->setNaSequenceId('NULL');
    #      $self->setProcessedCategory("CHIMERA=$seqAtts->{CHIMERA}");
    #    }

    ##critical to remove te existing sequence as is cached and  old will be used...will be 
    ##regenerated when needed from above values..
    #    delete $self->{sequence}; ##note ... am setting below as is needed to generate gappedSequence
    #    print STDERR "Getting Attributes for AssemblySequence: \n  $seq\n";
    while ($seq =~ m/\<(\w+)\s*(.*?)\>(.*?)\<\/(\w+)\>/g) { ##should get next att...
      my($bTag,$atts,$val,$eTag) = ($1,$2,$3,$4);
      #      print STDERR "AssemblySequence: nextAttribute ($bTag,$atts,$val,$eTag)\n";
      if ($bTag ne $eTag) {
        #        print STDERR "ERROR: AssemblySequence->parseCap4Caml - tag mismatch '$bTag', '$eTag'\n";
        next;
      }
      ##known possibles: BASE, QUALITY, GAPS
      if ($bTag eq 'BASE') {
        $val =~ s/\s//g;
        #        print STDERR "Setting Sequence: $val\n";
        #        print STDERR "Sequence ",$self->getId(),":\n",substr($val,$seqAtts->{LEFTCLIP},$seqAtts->{RIGHTCLIP} - $seqAtts->{LEFTCLIP} + 1),"\n";
        ##note: this is failproof but doesn't allow for parsing assemblies that don't have an externalnasequence
        #        $self->setSequence(substr($val,$seqAtts->{LEFTCLIP},$seqAtts->{RIGHTCLIP} - $seqAtts->{LEFTCLIP} + 1));  ##this is the inputsequence not the resulting seq..
        $self->{sequence} = substr($val,$seqAtts->{LEFTCLIP},$seqAtts->{RIGHTCLIP} - $seqAtts->{LEFTCLIP} + 1); ##this is the inputsequence not the resulting seq..
      }
      if ($bTag eq 'GAPS') {
        my @gaps = split(' ',$val);
        my @tmp;
        #        print STDERR "Setting Gaps: $val\n";
        for (my $i = 0;$i<scalar(@gaps) - 1;$i += 2) {
          my $gap = $gaps[$i+1] == 1 ? $gaps[$i] : "$gaps[$i],$gaps[$i+1]";
          #          print STDERR "  $i: '$gap'\n";
          push(@tmp, $gap) if $gaps[$i];
        }
        if(scalar(@tmp) > 0){
          $self->setGappedSequence($self->addGapsToSequence($self->getSequence(),join(' ',@tmp)));
        }else{
          $self->setGappedSequence($self->getSequence());
        }
      }
      #      print STDERR "Parsing Atts: $bTag finished\n";
    }
  } else {
    print STDERR "ERROR: AssemblySequence->parseCap4Caml - incorrect format '$caml'\n"; return undef;
  }
  return 1;
}
##method for returning name, value pairs for xml attributes
sub getCamlAtts {
  my($self,$atts) = @_;
  ##error checking to make certain does not contain any other tags...
  if ($atts =~ /(\<|\>)/) {
    print STDERR "getCamlAtts: ERROR - att string contains (<|>)\n";
    return undef;
  }
  my @a = split(' +',$atts);
  my %hash;
  foreach my $a (@a) {
    my($att,$val) = split('=',$a);
    $val =~ s/\"//g;
    $val =~ s/\'//g;
    $hash{$att} = $val;
  }
  return \%hash;
}

##methods for caml to indicate if a singlet
sub setSinglet {
  my($self,$s) = @_;
  $self->{isSinglet} = $s;
}

sub isSinglet {
  my $self = shift;
  return $self->{isSinglet};
}

##sets the sequence and builds the NASeq objects
##should only be set from the gappedSequence
#sub setGapsFromGappedSequence{
#	my($self) = @_;
#	$self->setSequenceGaps($self->makeGapsFromGappedSequence());
#}

##note that this reverse complements the sequence that is cached and sets it...
##this also needs to reverse complement the gaps and set the assembly_strand and assembly_offset.
sub reverseComplement{
  my($self) = shift;
  print STDERR "ReverseComplementing ",$self->getId(),"\n" if $debug == 1;
  ##need to also toggle the assembly_strand
  $self->set('assembly_strand',($self->get('assembly_strand') ? 0 : 1));
  ##sequence
  if (exists $self->{'sequence'}) { ##don't retrieve it if it doesn't exists
    $self->{'sequence'} = CBIL::Bio::SequenceUtils::reverseComplementSequence($self->getSequence());
  }
  ##gappedSequence if it exists then revcomp and set gaps from it else need to revcomp the gaps and set them
  if ($self->get('gapped_sequence')) {
    $self->setGappedSequence(CBIL::Bio::SequenceUtils::reverseComplementSequence($self->get('gapped_sequence')));
  }
  ##lastly, need to reset the assembly_offset
  if ($self->getParent('DoTS::Assembly')) {
    $self->set('assembly_offset',$self->getParent('DoTS::Assembly')->getGappedLength() - ($self->getGappedLength() + $self->get('assembly_offset')));
  } else {
    $self->set('assembly_offset',0);
  }
}

############################################################
# methods for dealing with gaped sequence....
############################################################


sub addGapsToSequence {
  my($self,$seq,$gaps) = @_;
  $seq =~ s/\s//g;
  my $i = 0;
  my $gseq;
  foreach my $gap (split(' ',$gaps)) {
    if ($gap =~ /^(\d+),(\d+)$/) {
      $gseq .= substr($seq,$i,$1-$i);
      for ($a=0;$a<$2;$a++) {
        $gseq .= "-";
      }
      $i += $1-$i;              ##do I need $gap + 1 here??
    } else {
      $gseq .= substr($seq,$i,$gap-$i) . "-";
      $i += $gap-$i;            ##do I need $gap + 1 here??
    }
  }
  $gseq .= substr($seq,$i);     #do I need to specify length if want to get end??
  return $gseq;
}

sub getGappedSequence{
  my($self) = @_;
  return $self->get('gapped_sequence') ? $self->get('gapped_sequence') : $self->getSequence();
}

sub setGappedSequence {
  my($self,$gs) = @_;
  chomp $gs;
  $self->set('gapped_sequence',$gs);
  #	$self->{'gappedSequence'} = $gs;
}

sub addToGappedSequence {
  my($self,$gs) = @_;
  chomp $gs;
  $self->set('gapped_sequence',$self->get('gapped_sequence') . $gs);
}

sub getLength {
  my $self = shift;
  if (!exists $self->{'length'}) {
    $self->{'length'} = $self->get('sequence_end') - $self->get('sequence_start') + 1;
  }
  return $self->{'length'};
}

sub getGappedLength {
  my $self = shift;
  return length($self->getGappedSequence());
}

#sub reverseComplementGaps {
#  my($self) = @_;
#
#  my @newGaps;
#	my $length = $self->getLength();
#  my @revGaps = reverse(split(' ',$self->getSequenceGaps()));
#  foreach my $gap (@revGaps){
#    if($gap =~ /^(\d+),(\d+)$/){
#      push(@newGaps, ($length - $1) . "," . $2);
#    }else{
#      push(@newGaps, ($length - $gap));
#    }
#  }
#	return join(' ',@newGaps);
#}

##need to have string of spaces....
my $spaces = "                                                                                                    ";

sub makeCap2SequenceLine {
  my($self,$index,$idType,$suppressNumbers,$snps) = @_;
  my $offset = $self->get('assembly_offset');
  my $startPos = $index - $offset;

  if ($startPos <= -60 || $startPos >= $self->getGappedLength()) { ##not in the region of this sequence
    return undef;
  }
  my $strLength = 60;
  my $ins = "";
  my $id = $idType ? $self->getParent('DoTS::ExternalNASequence',1)->get('source_id') : $self->getId();
  $id = substr($id,0,10);
  my $insSpace = 12 - (length($id) + 1);
  #	print STDERR "Making the cap2 sequence line for ",$self->getId(),"\n" if $debug == 1;
  my @SNP;
  my $adjust = 0;
  if ($index < $offset) {       ##need to add spaces up to offset
    $adjust = $offset - $index;
    $insSpace += $adjust;       #add these spaces to the existing ones
    $strLength = 60 - $adjust;
    $startPos = 0;              ##start at beginning of sequence
    ##need to deduct from the gaps if exist $insSpace
    foreach my $g (@{$snps}) {
      next if $g < $offset;
      push(@SNP,$g - $offset);
    }
  } elsif ($snps) {
    foreach my $g (@{$snps}) {
      push(@SNP,$g - $offset);
    }
  }
  if ($debug && @SNP) {
    print $self->getId().":$index: Incoming SNPs: (".join(', ',@{$snps}).")...";
    print "SNPS: (".join(', ',@SNP).")\n";
  }
  #	print STDERR "getting the gappedSequence\n" if $debug == 1;
  #	print $self->toString() if $debug == 1;
  #	print "{'gappedSequence'} = $self->{'gappedSequence'}\n" if $debug == 1;
  my $seq;
  if (@SNP) {
    my $start = $startPos;
    foreach my $s (@SNP) {
      $seq .= substr($self->getGappedSequence(),$start,$s-$start);
      $seq .= '<font color="#FF0000">'.substr($self->getGappedSequence(),$s,1).'</font>';
			
      $start = $s + 1;
    }
    $seq .= substr($self->getGappedSequence(),$start,($startPos + $strLength - 1) - $SNP[-1]);
  } else {
    $seq = substr($self->getGappedSequence(),$startPos,$strLength);
  }
  my $endSpace = 0;
  my $totseq;
  if ($startPos == 0) {
    $totseq = $seq;
  } else {
    $totseq = substr($self->getGappedSequence(),0,$startPos + 60);
  }
  $endSpace = 60 - (length(substr($self->getGappedSequence(),$startPos,$strLength)) + $adjust);
  $totseq =~ s/-//g;
  return $id . ($self->get('assembly_strand') ? "+" : "-") . substr($spaces,0,$insSpace) . $seq . substr($spaces,0,$endSpace) . ($suppressNumbers ? "\n" : "  " . length($totseq) . "\n");
}

sub getPositionAtIndex {
  my($self,$index) = @_;
  my $pos = $index - $self->get('assembly_offset') + 1;
  if ($pos < 1 || $pos > $self->getGappedLength()) {
    return undef;
  }
  return $pos;
}

sub getNaSequencePosition {
  my($self,$pos) = @_;
  my $tmp = substr($self->getGappedSequence,0,$pos);  ##note that $pos here is equivalent to length as indexed from 1
  $tmp =~ s/-//g;  ##remove gapped chars..
  my $length = length($tmp);
  my $loc = $self->getSequenceStart - 1 + $length;
  if($self->getAssemblyStrand()){  ##is forward
#    print STDERR $self->getParent('DoTS::ExternalNASequence',1)->getSourceId(),": \$pos=$pos, +$loc..NANuc '",substr($self->getParent('DoTS::ExternalNASequence')->getSequence(),$loc - 1,5),"'\n";
    return $loc;
  }else{
    my $nalen = $self->getParent('DoTS::ExternalNASequence',1)->getLength();
    my $naloc = $nalen - ($length + ($nalen - $self->getSequenceEnd() - 1));
#    print STDERR $self->getParent('DoTS::ExternalNASequence')->getSourceId(),": \$pos=$pos, -$naloc..NANuc '",substr($self->getParent('DoTS::ExternalNASequence')->getSequence(),$naloc - 1,5),"'\n";
    return $naloc;
  }
}

sub getNucAtIndex {
  my($self,$index) = @_;
  my $start = $self->getPositionAtIndex($index);
  return $start ? substr($self->getGappedSequence(),$start - 1,1) : undef;
}

#insertGap should insert both into the array and the string
sub insertGap {
  my($self,$index) = @_;
  my $offset = $self->get('assembly_offset');
  my $start = $index - $offset;
  if ($index <= $offset) {
    $self->set('assembly_offset',$offset + 1);
  } elsif ($start < $self->getGappedLength()) {
    $self->setGappedSequence(substr($self->getGappedSequence(),0,$start) . "-" . substr($self->getGappedSequence(),$start));
  }
}

##checking to see if orientation in assembly is consistent with p_end
sub isOrientationConsistent {
  my $self = shift;
  ##first check if mRNA....if so should be +
  print STDERR "AssSeq->isOrientationConsistent\n" if $debug;
  my $exnaseq = $self->getParent('DoTS::ExternalNASequence',1);
  if ($exnaseq->get('sequence_type_id') == 7 || $exnaseq->get('sequence_type_id') == 2) { ##check this number
    return $self->get('assembly_strand') ? 2 : -2; ##will be either 2 if correct or -2 if not...
  } else {
    my $query = "select p_end from DoTS.EST e " .
      "where e.na_sequence_id = " . $exnaseq->getNaSequenceId();
    print STDERR "Query: $query\n" if $debug;
    my $dbh = $self->getDbHandle();
    my $stmt = $dbh->prepareAndExecute($query);
    if (my($p_end) = $stmt->fetchrow_array()) {
      if ($p_end !~ /(5|3)/) {
        return -1;
      } elsif (($p_end =~ /5/ && $self->get('assembly_strand') == 1) || ($p_end =~ /3/ && $self->get('assembly_strand') == 0)) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return -1;
    }
  }
}
#select p_end from ExternalNASequence n,image..sequence s
# where n.na_sequence_id = 5107432
# and n.source_id = s.accession


1;
