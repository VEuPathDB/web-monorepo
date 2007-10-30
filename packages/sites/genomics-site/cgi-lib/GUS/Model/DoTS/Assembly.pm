
package GUS::Model::DoTS::Assembly;               # table name
use strict;
use GUS::Model::DoTS::Assembly_Row;
use GUS::Model::DoTS::AssemblySequence;
use GUS::Model::DoTS::AssemblySNP;
use GUS::Model::DoTS::AssemblySequenceSNP;
use GUS::Model::DoTS::RNAFeature;
use GUS::Model::DoTS::TranslatedAAFeature;
use GUS::Model::DoTS::TranslatedAASequence;
use GUS::Model::DoTS::RNAFeature;
use GUS::Model::DoTS::RNAInstance;
use GUS::Model::DoTS::RNA;
use GUS::Model::DoTS::Protein;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::Assembly_Row);


############################################################
# Methods specific go here
############################################################

my $debug = 0;
my $setDefaultsOnSubmit = 0;
my $snpStmt;

sub setAssemblyDebugging {
  my($self,$d) = @_;
  $debug = $d;
}

sub getGene{
  my($self,$retrieve) = @_;
  my $rna = $self->getRNA($retrieve);
  my $gene = $rna->getParent('DoTS::Gene',$retrieve);
  print STDERR $gene->toString() if $debug == 1 && $gene;
  return $gene;
}

sub getRNA {
  my($self,$retrieve,$getDeletedToo) = @_;
  my $naf = $self->getChild('DoTS::RNAFeature',$retrieve,$getDeletedToo);
  return undef unless $naf;
  print STDERR $naf->toXML() if $debug == 1;
  my $rs = $naf->getChild('DoTS::RNAInstance',$retrieve,$getDeletedToo);
  return undef unless $rs;
  print STDERR $rs->toXML() if $debug == 1;
  my $rna = $rs->getParent('DoTS::RNA',$retrieve);
  print STDERR $rna->toXML() if $debug == 1 && $rna;
  return $rna;
}

sub markFromRNAToSelfDeleted {
  my($self) = @_;
  my $rna = $self->getRNA(1,1);
  if ($rna) {
    ##need to delete all children...
    $rna->retrieveAllChildrenFromDB(1);
    $rna->markDeleted(1);
  }
  $self->markDeleted(1);
}

sub getTranslatedAASequences {
  my($self,$retrieve,$getDeletedToo) = @_;
  my @tmp;
  foreach my $rf ( $self->getChildren('DoTS::RNAFeature',$retrieve,$getDeletedToo)){
    print STDERR $rf->toXML() if $debug == 1;
    foreach my $tf ( $rf->getChildren('DoTS::TranslatedAAFeature',$retrieve,$getDeletedToo)){
      print STDERR $tf->toXML() if $debug == 1;
      my $ts = $tf->getParent('DoTS::TranslatedAASequence',$retrieve);
      print STDERR $ts->toXML() if $debug == 1 && $ts;
      push(@tmp,$ts) if $ts;
    }
  }
  return @tmp;
}

##note that this one will also need to deal with the predictions such as GOFunction..
##What about IndexWordSimLInk and IndexWordLink?
##Similarities and Evidence should be OK....objects take care of this.
sub markFromAASequenceToSelfDeleted {
  my($self,$aas) = @_;
  $aas->retrieveAllChildrenFromDB(1);
  $aas->markDeleted(1);
  $self->markDeleted(1);
}

##for incremental update so  can  delete the Assembly when it  gets merged..
##note that am already dealing with the AssemblySequences and don't want to 
##get the NAFeature...as will have the RNAFeature..
sub retrieveAllChildrenExceptAssSeqsFromDB {
  my ($self,$recursive,$resetIfHave) = @_;
  my %supers;                   ##superclasses
  my %subs;                     ##subclasses
  foreach my $className ($self->getChildList()) {
    $supers{$className} = 1 if $self->isImpClass($className);
  }
  foreach my $super (keys%supers) {
    #		print STDERR "Getting superclass children for $super\n";
    foreach my $s ($self->getSubClasses($super)) {
      $subs{$s} = 1;
    }
    $self->retrieveChildrenFromDB($super,$resetIfHave);
  }
  foreach my $className ($self->getChildList()) {
    next if $className eq 'GUS::Model::DoTS::AssemblySequence' || $self->isImpClass($className) || exists $subs{$className}; ##have already done these!!
    $self->retrieveChildrenFromDB($className,$resetIfHave);
  }
  if($recursive){
    foreach my $c ($self->getAllChildren()){
      $c->retrieveAllChildrenFromDB($recursive,$resetIfHave);
    }
  }else{  ##getthe assemblysequencesnps
    foreach my $snp ($self->getChildren('DoTS::AssemblySNP')){
      $snp->retrieveChildrenFromDB('DoTS::AssemblySequenceSNP');
    }
  }
}

##method to create empty objects for features down to TranslateedAASequence
sub createFeaturesAndAASequence {
  my $self = shift;

  ##first the NAFeature...
  my $rnaf = GUS::Model::DoTS::RNAFeature->new({'name' => 'assembly' });
  $rnaf->setParent($self); 

  ##next the TranslatedAAFeature...
  my $aaf = GUS::Model::DoTS::TranslatedAAFeature->
	new({'subclass_view' => 'TranslatedAAFeature',
		                              'is_simple' => 1,
			                      'review_status_id' => 1,
				              'is_predicted' => 1
                                     });
  $aaf->setParent($rnaf);

  ##the TranslatedAASequence
  my $aas = GUS::Model::DoTS::TranslatedAASequence->new({'subclass_view' => 'TranslatedAASequence',
                                       'sequence_version' => 1,
                                       'is_simple' => 0 });
  $aas->addChild($aaf);
  return 1;
}

sub createNewRNAToSelf {
  my($self) = @_;

  ##first the NAFeature...
  my $naf = GUS::Model::DoTS::RNAFeature->new({'name' => 'assembly' });

  $naf->setParent($self); 
  ##now the RNAInstance
  my $rs = GUS::Model::DoTS::RNAInstance->new({'review_status_id' => 1,
                         'is_reference' => 0,
                         'rna_instance_category_id' => 0 });

  $naf->addChild($rs);
  ##last the RNA
  my $rna = GUS::Model::DoTS::RNA->new({'review_status_id' => 1,
                           'name' => ($self->get('number_of_contained_sequences') == 1 ? 'Singleton EST' : 'DOTS assembly')});
  $rna->addChild($rs);

  ##need to also create a protein entry so can do GOFunction predictions..
  my $prot = GUS::Model::DoTS::Protein->new({ 'review_status_id' => 1 });
  $rna->addChild($prot);

  return $rna;
}

############################################################
##methods for managing class cache 
##note that all objects have access to the cache!!
my $sCache;                     ##class variable for cacheing objects
my $tmpCacheId = 1000;          ##class incrementor to generator unique cache temp ids when needed
##NOTE that is responsibility of the calling pgm to manage cache..specifically to flush when finished...
sub cacheAssembly {
  my($self,$as) = @_;
  print STDERR "Cacheing ".$as->toXML()."\n" if $debug;
  my $id = $as->getCacheId();
  $sCache->{$id} = $as;
}

sub assemblyIsCached {
  my($self,$id) = @_;
  if (exists $sCache->{$id}) {
    return 1;
  }
  return undef;
}

sub getCachedAssembly {
  my($self,$id) = @_;
  return $sCache->{$id};
}
sub getAllCachedAssemblies {
  my($self,$getAll) = @_;
  my @tmp;
  foreach my $id (keys %{$sCache}) {
    my $a = $self->getCachedAssembly($id);
    print STDERR "getAllCachedAssemblies(): id='$id' ".$a->toXML() if $debug == 1;
    push(@tmp,$a);              # if (!$a->isMarkedDeleted() || $getAll);
  }
  return @tmp;
}

sub flushAssemblyCache {
  my($self) = @_;
  ##	first remove all pointers for things in the cache...
  #	foreach my $a ($self->getAllCachedAssemblies()){
  #		$a->cleanUp() if $a;
  #	}
  undef %{$sCache};
}

sub removeCachedAssembly {
  my($self,$as) = @_;
  delete $sCache->{$as->getCacheId()};
}

sub getCacheId {
  my($self) = @_;
  if (!exists $self->{'cacheId'}) {
    if ($self->getId()) {
      $self->{'cacheId'} = $self->getId();
    } else {
      $self->{'cacheId'} = "t" . $tmpCacheId;
      $tmpCacheId++;
    }
  }
  return $self->{'cacheId'};
}

############################################################


##methods for managing class cache of assemblieSequences in working progress
my $ASCache;                    ##class variable for cacheing assemblieSequencess...
##NOTE that is responsibility of the calling pgm to manage cache..specifically to flush when finished...
sub cacheAssemblySequence{
  my($self,$as) = @_;
  my $id;
  if ($as->getId()) {
    $id = $as->getId();
  } else {
    print STDERR "ERROR: AssemblySequence does not have an ID\n".$as->toXML();
  }
  $ASCache->{$id} = $as;
}

sub assemblySequenceIsCached{
  my($self,$id) = @_;
  if (exists $ASCache->{$id}) {
    return 1;
  }
  return undef;
}

sub getCachedAssemblySequence {
  my($self,$id) = @_;
  return $ASCache->{$id};
}

sub getAllCachedAssemblySequences {
  my $self = shift;
  my @tmp;
  foreach my $id (keys %{$ASCache}) {
    push(@tmp,$self->getCachedAssemblySequence($id));
  }
  return @tmp;
}

sub flushAssemblySequenceCache {
  my $self = shift;
  undef %{$ASCache};
}

sub removeCachedAssemblySequence {
  my($self,$as) = @_;
  delete $ASCache->{$as->getId()};
}

##methods for dealing with contained assemblies....
sub addContainedAssembly{
  my($self,$id,$assSeq,$assembly) = @_;
  $self->{'oldAssemblies'}->{$id} = [$assSeq,$assembly];
}

sub getContainedAssembly {
  my($self,$id) = @_;
  return $self->{'oldAssemblies'}->{$id};
}

sub getContainedAssemblyIds {
  my $self = shift;
  return keys%{$self->{'oldAssemblies'}};
}

sub getContainedAssemblies {
  my $self = shift;
  return $self->{'oldAssemblies'};
}

sub countContainedAssemblies {
  my $self = shift;
  return scalar(keys%{$self->{'oldAssemblies'}});
}

##note that only valid ids for a cap2 alignment are assembly_sequence_ids or Dna_sequence_id(assembly)
##store pointer to the AssemblySequence in $self->{'align'}....note that store DT. ids with the D prefix 
##included asemblies get stored in $self->{'includedAssemblies'} as hash with assembly na_sequence_id as key
sub parseCap2Alignment {
  my($self,$alignment) = @_;
  ##ready for new alignment
  $self->deleteGappedValues();
  my $assemblyName = $self->getTable()->getClassName();

  my @alignment = split("\n", $alignment);
  my $bk = 0;                   #block number of alignment
  my $as;
  my %align;
  foreach (@alignment) {
    #		print STDERR "$_\n";
    if (/^(\S+)([\+-])\s+/) {
      my $id = $1; 
      my $strand = $2;
      if (!exists $align{$id}) {
				##note that need to deal with consensus sequences (DT.(\d+)
				##add child ..make certain to retrieve from DB
        print STDERR "New id: $id\n" if $debug == 1;
        if ($self->assemblySequenceIsCached($id)) {
          $as = $self->getCachedAssemblySequence($id);
          print STDERR "Getting AssemblySequence $id from cache\n" if $debug;
        } else {
          print STDERR "Getting new Assembly Sequence $id from db....\n" if $debug;
          $as = GUS::Model::DoTS::AssemblySequence->new({'assembly_sequence_id' => $id});
          $as->retrieveFromDB() unless $id =~ /^D/;
        }
        $self->addChild($as);
        $align{$id} = $as;
        if ($id =~ /DT?\.?(\w+)/) { ##is an included assembly...
          my $dtid = $1;
          print STDERR "The Id is '$id' and dtid is '$dtid'\n" if $debug;
          my $oldAss;
          if ($self->assemblyIsCached($dtid)) {	##...is cached
            $oldAss = $self->getCachedAssembly($dtid);
            print STDERR "Getting assembly $dtid from cache...\n" if $debug;
          } else {
            print STDERR "Retrieving old assembly from db\n" if $debug;
            $oldAss = $assemblyName->new({'na_sequence_id' => $dtid});
            $oldAss->retrieveFromDB();
            print STDERR "Old Assembly:".$oldAss->toXML()."\n" if $debug;
          }
          if ($strand eq "-") {
            $oldAss->reverseComplementAssembly();
          }                     ##reverse complement here if "-" strand
          $self->addContainedAssembly($id,$as,$oldAss);
        }	
				##set the assembly_strand
        $as->set('assembly_strand',($strand eq "+" ? 1 : 0));
				##set the assembly_offset for the child...
        if (/^............(\s*)(\S+)\s*$/) {
          print STDERR "Spaces = ",length($1)," sequence = $2\n" if $debug == 1;
          $as->set('assembly_offset',($bk*60)+length($1));
          $as->setGappedSequence($2);
        } else {
          print STDERR "ERROR: cap2 parse Error!!\n\"$_\"";
        }
      } else {
        if (/^............(\s*)(\S+)\s*$/) {
          $align{$id}->addToGappedSequence($2);
        } else {
          print STDERR "ERROR: cap2 parse Error!!\n\"$_\"";
        }
      }
    } elsif (/^consensus\s+(\S+)\s*$/) {
      $self->{'gappedConsensus'} .= $1;
      $bk++;
    }
  }
  print STDERR "Finished parsing...tidying up\n" if $debug;
  ##should do finish up things here like setting the gaps and could set gappedLength here once!!
  foreach my $c ($self->getChildren('DoTS::AssemblySequence')) { ##could also get from {'align'}
    #		print STDERR $c->toXML();
    #		print STDERR "GappedSequence: ",$c->getGappedSequence(),"\n";
    $c->setGappedLength(length($c->getGappedSequence()));
    $c->setGapsFromGappedSequence(); ##Note that this uses the gapped sequence to generate the gaps...
  }
  ##also set the number of contained sequences
  $self->set('number_of_contained_sequences',scalar($self->getChildren('DoTS::AssemblySequence')));

  ##not sure should set the sequence...is set upon submitting....
  $self->setSequence($self->makeConsensus()); # unless ($self->countContainedAssemblies() == 1 && $self->get('number_of_contained_sequences') == 1); ##don't set if only constains an old assembly and no others...will barf and am finished..
  $self->setGappedLength(length($self->getGappedConsensus()));
}

##for parsing cap4 caml output
##note: parsing as if on one line!!!
sub parseCap4Caml {
  my($self,$caml,$doNotRetrieve) = @_;
  $caml =~ s/\n//g;             ##just to make certain!!
  my $contigAtts;               ##hash reference of attributes of contig
  my $consensusAtts;            ##hash reference of attributes of consensus 
  if ($caml =~ /\<CONTIG\s(.*?)\>/) {
    $contigAtts = $self->getCamlAtts($1);
  }
  my $assemblyName = $self->getTable()->getClassName();
  ##now the consensus stuff
  if ($caml =~ /^.*?\<CONSENSUS (.*?)\>(.*)\<\/CONSENSUS\>/) {
    $consensusAtts = $self->getCamlAtts($1);
    my $cons = $2;
    while ($cons =~ m/\<(\w+)\s*(.*?)\>(.*?)\<\/(\w+)\>/g) { ##should get next att...
      my($bTag,$atts,$val,$eTag) = ($1,$2,$3,$4);
      if ($bTag ne $eTag) {
        print STDERR "ERROR: parseCap4Caml - tag mismatch '$bTag', '$eTag'\n";
        next;
      }
      ##known possibles: BASE, QUALITY, DISAGREEMENT
      if ($bTag eq 'BASE') {
        $val =~ s/\s//g;
        ##sanity check on length
        if ($consensusAtts->{LENGTH} != length($val)) {
          print STDERR "ERROR: parseCap4Caml - reported lengths differ '$consensusAtts->{LENGTH}', '",length($val),"'\n";
        }
        $self->setGappedConsensus($val);
        $self->setGappedLength(length($val));
        my $seq = $self->makeConsensus();
        $self->setLength(length($seq)); ##important if reassembling again for checking trimming
        $self->setSequence($seq);
      } elsif ($bTag eq 'QUALITY') {
        $self->{'quality'} = $val;
        $self->setQualityValues($val);
      }
      ##what about disagreement...not currently using.
    }
  }
  my @delAssSeqs;
  while ($caml =~ m/(\<SEQUENCE .*?\<\/SEQUENCE\>)/g) {
    my $seqString = $1;
    #    print STDERR "SequenceString: $seqString\n";
    my $as;
    if ($seqString =~ /NAME=\"(\S*?)\"/) {
      my $id = $1;
      if ($id =~ /DT?\.?(\w+)/) { ##is an included assembly...
        my $dtid = $1;
        print STDERR "The Id is '$id' and dtid is '$dtid'\n" if $debug;
        my $oldAss;
        $as = GUS::Model::DoTS::AssemblySequence->new({'assembly_sequence_id' => $id});
        $self->addChild($as);
        $as->parseCap4Caml($seqString);
        if ($self->assemblyIsCached($dtid)) { ##...is cached
          $oldAss = $self->getCachedAssembly($dtid);
          print STDERR "Getting assembly $dtid from cache...\n" if $debug;
        } else {
          $oldAss = $self->getFromDbCache('Assembly',$dtid); ##have already retrieved from DB..happens when reassembling
          if(!$oldAss){
            print STDERR "Retrieving old assembly from db\n" if $debug;
            $oldAss = $assemblyName->new({'na_sequence_id' => $dtid});
            $oldAss->retrieveFromDB() unless $doNotRetrieve;
          }
          print STDERR "Old Assembly:".$oldAss->toXML()."\n" if $debug;
        }

        ##trim the assembly 
        @delAssSeqs = $oldAss->trimAssembly($as);

        ##reverse complement here if "-" strand.. 
        if ($as->getAssemblyStrand() == 0) {
          $oldAss->reverseComplementAssembly();  
        }
        
        $self->addContainedAssembly($id,$as,$oldAss);
      } else {
        if ($self->assemblySequenceIsCached($id)) {
          $as = $self->getCachedAssemblySequence($id);
          print STDERR "Getting AssemblySequence $id from cache\n" if $debug;
        } else {
          print STDERR "Getting new Assembly Sequence $id from db....\n" if $debug;
          $as = GUS::Model::DoTS::AssemblySequence->new({'assembly_sequence_id' => $id});
          $as->retrieveFromDB() unless $doNotRetrieve; 
        }
        $self->addChild($as);
        $as->parseCap4Caml($seqString);
      }
    } else {
      print STDERR "ERROR: parseCap4Caml - no sequence id for assemblySequence\n$seqString\n";
      next;
    }
  }
  ##set the number of contained sequences..
  $self->set('number_of_contained_sequences',scalar($self->getChildren('DoTS::AssemblySequence')));
  ##little bit of error checking
  if ($debug) {
    my @q = split(' +',$self->getQualityValues());
    print STDERR "parseCap4Caml: gappedConsensus length: ",length($self->getGappedConsensus()),", qualityValues: ",scalar(@q),"\n";
    open(T, ">testAssParse");
    print T $self->toCAML(1);
    close T;
  }

  return @delAssSeqs;
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

##trims the assembly if it is contained in another one....must trim each of the 
##input sequences.
##quality_values,gapped_consensus,sequence,length,each AssemblySequence
##NOTE:  the left and right clips will reflect the consensus sequence which must be
## adjusted with gaps  for trimming the assembly sequences.
## will to trimming with respect to the Assembly rather than the consensus sequence
sub trimAssembly {
  my($self,$as) = @_;
  print STDERR "Trimming Assembly: Length=",$self->getLength()," AssSeq start-end(",$as->getSequenceStart()," - ",$as->getSequenceEnd(),")\n" if $debug;
  return unless $as;
  ##don't need to trim if following true
  return if $as->getSequenceStart() == 1 && $self->getLength() == $as->getSequenceEnd(); 
  my($assemblyStart,$assemblyLength) = $self->getTrimLocationInAssembly($as->getSequenceStart() - 1,$as->getSequenceEnd() - $as->getSequenceStart() + 1);
  print STDERR "AssemblyStart = $assemblyStart, AssemblyLength = $assemblyLength\n" if $debug;
  ##self attributes..
  ##AssemblySequences
  my @deletedAssSeqs;
  foreach my $aseq ($self->getChildren('DoTS::AssemblySequence',1)) {
    if ($aseq->trimAssembledSequence($assemblyStart,$assemblyLength) == 0) {
      ##this one is outside the current assembly bounds...what to do?
      ##reset to input....should I retrieve it from the db first incase has been
      ##trimmed in a previous round?
      print STDERR "trimAssembly: AssemblySequence ",$aseq->getId()," removed entirely\n";
      my $tmpAseq = GUS::Model::DoTS::AssemblySequence->new({'assembly_sequence_id' => $aseq->getId()});
      $tmpAseq->retrieveFromDB();
      $tmpAseq->resetAssemblySequence(); ##resets for no Assembly parent
      $self->removeChild($aseq);
      $self->removeCachedAssemblySequence($aseq); 
      push(@deletedAssSeqs,$tmpAseq);
    }
  }

  ##gappedConsensus
  $self->setGappedConsensus(substr($self->getGappedConsensus(),$assemblyStart,$assemblyLength));
  ##quality values
  my @tmpQual = split(' ',$self->getQualityValues());
  $self->setQualityValues(join(' ',@tmpQual[$assemblyStart..$assemblyStart + $assemblyLength]));

  ##with 1 as arg, does not delete the gappedconsensus
  $self->deleteGappedValues(1);

  ##sequence
  $self->setSequence($self->makeConsensus());
  ##length is setin setSequence method
  return @deletedAssSeqs;
}

## returns the ($start,$gappedlength) positions in the gappedconsensus (assembly)
## where $start is an array index (0 = beginning) and $length is length
## or resulting assembly (also the gapped consensus)
## takes in the 5 prime clip and length of consensus sequence
sub getTrimLocationInAssembly {
  my($self,$fivep,$length) = @_;
  print STDERR "Getting trimLocation: ($fivep,$length)\n" if $debug;
  my $start;
  my @gs = split('',$self->getGappedConsensus());
  ##alternatively could just do with substrings....
  my $haveStart = 0;
  my $ctLength = 0;
  my $outi = 0;
  my $ctBases = 0;
  my $lastNonGap = 0;
  for (my $i = 0;$i<$self->getGappedLength();$i++) {
    if ($gs[$i] ne '-') {
      $ctBases++;
      $lastNonGap = $i;
    }

    if ($haveStart) {
      $ctLength++ if $gs[$i] ne '-';
    } elsif ($fivep == $ctBases - 1) {
      $haveStart = 1;
      $start = $lastNonGap;
      $ctLength++;
    }
    if ($ctLength == $length) {
      $outi = $i; last;
    }
  }
  return ($start,$outi - $start + 1);
}

=pod

=head1 buildCompleteAlignment()

Method that builds the complete alignment if the alignment contains existing DOTS identifiers.
Assumes that the parseAlignment method has already identified these and put them in
the correct data structure.

=cut

##need to go through the alignment and adjust the gaps...
sub buildCompleteAlignment{
  my $self = shift;

  ##should just return if there are no contained DT. ids
  if ($self->countContainedAssemblies() == 0) {
    return;
  }

  print STDERR "Building Complete alignment: AssemblySequences (".join(', ',$self->getChildren('DoTS::AssemblySequence')).")\n" if $debug;

  ##first, make the gappedConsensus and adjust the offsets of the ass sequences according tot he new offset...
  #	my $old = $self->{'oldAssemblies'};  ##make copy for convenience
  my $old = $self->getContainedAssemblies();
  print STDERR "buildCompleteAlignment: ",scalar(keys%$old)," old sequences\n" if $debug;
  ##FIRST: set the offsets to reflect new position in assembly...
  foreach my $k (keys%{$old}) {
    $old->{$k}->[1]->getGappedConsensus(); ##Generates gapped consensus before adjusting offsets if it doesn't exist..
    print STDERR "$k GappedConsensus: ".$old->{$k}->[1]->getGappedConsensus()."\n" if $debug;
    ##need to first trim the contained assembliesequences....
    ##note thatam trimming in the parse method as need to trim before reverse complementing...?
    ## $old->{$k}->[1]->trimAssembly($old->{$k}->[0]);

    ##then adjust the offsets
    $old->{$k}->[1]->adjustOffsets($old->{$k}->[0]->get('assembly_offset'));
  }

  ##now go through the assembly and do the gap adjustment
  ##rules:
  ## foreach old assembly....note that generate gappedCons at each index position....
  ## if gap in gappedCons but not in newAlignment
  ##   causes gap to be inserted in all the other sequences (unless they would cause an insertion)
  ## elsif no gap in gappedCons but is gap in newAlignment
  ##   insert gap in all sequences of oldAlignment

  ##note:  need to add something to the quality values....when insert gap into self...
  my %insInOthers;
  my %insInSelf;
  my $stop = $self->getGappedLength();
  for (my $i = 0; $i < $stop; $i++) {
    ##need to run through and determine if causes gap insertio in others or self..
    ##only need to go until there are no more old sequences in index......
    undef %insInOthers;
    undef %insInSelf;
    foreach my $k (keys %{$old}) {
      my $nuc = $old->{$k}->[0]->getNucAtIndex($i); ##nucleotide in new alignment...
      next unless $nuc;         ##is either before or past this assembly...
      my $cons = $old->{$k}->[1]->getConsNucAtIndex($i); ##the consensus nucleotide at htis index...
      if ($nuc ne "-" && $cons eq "-") { ##will need to add gap to all new ass seqs of this new consensus
        print STDERR "$k: inserting in others at $i\n" if $debug == 1;
        $insInOthers{$k} = 1;
        $stop++;                ##increment as will need to go one further to reach the end...
      } elsif ($nuc eq "-" && $cons ne "-") {
        print STDERR "$k: inserting in self at $i\n" if $debug == 1;
        $insInSelf{$k} = 1;
      }
    }
    ##now do the right thing...!
    ##first insert gaps in new sequences caused by old assemblies..
    if (%insInOthers) {
      ##inserts a gap into this assembly thus need to insert a quality value here...make it low as is gap
      $self->insertGapInQualityValues($i);
      foreach my $as ($self->getChildren('DoTS::AssemblySequence')) {
        my $id = $as->getId();
        $as->insertGap($i) ;    #unless exists $insInOthers{$id};  ##insert gap unless causing it to be inserted in others
        if (exists $old->{$id} && !exists $insInOthers{$id}) { ##insert gaps in assemblies...
          $old->{$id}->[1]->insertGapInAssembly($i);
        }
      }
    }
    ##now insert gaps in assemblies that need it...
    foreach my $id (keys %insInSelf) {
      $old->{$id}->[1]->insertGapInAssembly($i);
    }
  }
  ##at end need to transfer all children to self
  ##remove children in %old
  ##calculate new gappedConsensus...
  foreach my $k (keys%{$old}) {
    print STDERR "adding all $k children...\n" if $debug == 1;
    $self->addChildren($old->{$k}->[1]->getChildren('DoTS::AssemblySequence'));
    print STDERR "Removing $k child...\n" if $debug == 1;
    $self->removeChild($old->{$k}->[0]);
  }
  $self->makeGappedConsensus(); ##generates new gappedConsensus
  $self->setGappedLength(length($self->getGappedConsensus()));
  $self->set('number_of_contained_sequences',scalar($self->getChildren('DoTS::AssemblySequence'))); ##important before setting sequence
  $self->setSequence($self->makeConsensus());
}

sub insertGapInQualityValues {
  my($self,$i) = @_;
  print STDERR $self->getCacheId(),": insertGapInQualityValues($i)\n" if $debug;
  my @tq = split(' ',$self->getQualityValues());
  my $ln = scalar(@tq);
  return if $ln == 0;  ##doesn't have quality values so just  return...
  if ($ln < $self->getGappedLength() - 1) {
    print STDERR $self->getCacheId(),": length of quality values ($ln) too short for gappedLength (",$self->getGappedLength(),")\n"; # if $debug;
        return;
  }
  $self->setQualityValues(join(' ',(@tq[0..$i-1],1,@tq[$i..$ln])));
}

sub setContainsMrna{
  my $self = shift;
  my $current = $self->getContainsMrna();
  my $new = 0;
  foreach my $c ($self->getChildren('DoTS::AssemblySequence')) {
    if ($c->getParent('DoTS::ExternalNASequence',1)->get('sequence_type_id') == 7 || $c->getParent('DoTS::ExternalNASequence',1)->get('sequence_type_id') == 2) { 
      $new = 1;
      last;
    }
  }
  if (!defined $current || $current != $new) {
    $self->set('contains_mrna',$new);
  }
}

##assigns a primary id to the assembly that is the id of the contained assembly with most sequences
##returns the remainder of the assemblies to be dealt with by pgm calling method..
sub assignIdentifier {
  my $self = shift;
 # $debug = 1;
  my @tmp;
  if ($self->countContainedAssemblies() == 0) {
    return ($self,@tmp);
  }
  print STDERR "Assigning identifier: starting: ",$self->countContainedAssemblies()," assemblies\n" if $debug;
  foreach my $key ($self->getContainedAssemblyIds()) {
    push(@tmp,$self->getContainedAssembly($key)->[1]);
  }
  my @sort = sort { $b->get('number_of_contained_sequences') <=> $a->get('number_of_contained_sequences') } @tmp;
  my $best = shift @sort;
  print STDERR "Ass Ident sorted..best = ",$best->get('number_of_contained_sequences')," Next = ",$sort[0]->get('number_of_contained_sequences'),"\n" if $sort[0] && $debug;
  ##note...need to transfer self to $best rather than other way around
  ##then return $best and array of ones to delete...
  $best->removeChildrenInClass('DoTS::AssemblySequence');
  $best->addChildren($self->getChildren('DoTS::AssemblySequence'));
  $best->deleteGappedValues();  ##reset all gapped values...
  ##note that here $self should have all the proper values...don't recompute..
 # $debug = 0;
  $best->setGappedConsensus($self->getGappedConsensus());
  $best->set('number_of_contained_sequences',scalar($best->getChildren('DoTS::AssemblySequence')));
  $best->setSequence($best->makeConsensus()); ##generate consensus in buildCompleteAlignment
  $best->setQualityValues($self->getQualityValues());
  #	$best->set('contains_mrna',$self->get('contains_mrna'));
  #	$best->set('length',$self->get('length'));
  ##also do the other things
  @{$best->{'consistencyArray'}} = $self->getConsistencyArray();
  $best->setAssemblyConsistency($best->getConsistency()); ##I want to see this on debug so...
  $self->markDeleted();

  return($best,\@sort);         ##returns the best assemblies and reference to assemblies that need to be markedDeleted... 
}

sub insertGapInAssembly{
  my($self,$index) = @_;
  print STDERR $self->getCacheId(),": inserting gap in self at $index\n" if $debug == 1;
  foreach my $as ($self->getChildren('DoTS::AssemblySequence')) {
    $as->insertGap($index);
  }
  ##need to also insert a gap in the gappedConsensus NO LONGER USING THIS!!
  my $offset = $self->{'containedOffset'};
  my $start = $index - $offset;
  if ($index <= $offset) {
    $self->{'containedOffset'}++; ##increment offset as is before this assembly...
  } elsif ($start < $self->getGappedLength()) {
    $self->setGappedConsensus(substr($self->getGappedConsensus(),0,$start) . "-" . substr($self->getGappedConsensus(),$start));
    ##increase the gapped length by 1..
    $self->setGappedLength($self->getGappedLength() + 1);
    $self->insertGapInQualityValues($index); 
  }
}

sub adjustOffsets{
  my($self,$adjust) = @_;
  print STDERR $self->getCacheId().": Addjusting offsets by $adjust\n" if $debug;
  $self->{'containedOffset'} = $adjust;	##offset of this assembly in whole..
  foreach my $as ($self->getChildren('DoTS::AssemblySequence',1)) {
    print STDERR "  ".$as->getId().": ".$as->getAssemblyOffset()."=>" if $debug;
    $as->set('assembly_offset',$as->get('assembly_offset') + $adjust);
    print STDERR $as->getAssemblyOffset()."\n" if $debug;
  }
}

sub getGappedConsensus {
  my $self = shift;
  #	print STDERR "getGappedConsensus $self\n" if $debug;
  if (!$self->get('gapped_consensus')) {
    $self->makeGappedConsensus();
  }
  return $self->get('gapped_consensus');
}

##in _gen
#sub setGappedConsensus {
#	my ($self,$gs) = @_;
#	$self->{'gappedConsensus'} = $gs;
#}

sub deleteGappedValues {
  my ($self,$leaveGappedConsensus) = @_;
  delete $self->{'gappedConsensusSegment'}; ##critical..
  $self->setGappedConsensus("") unless $leaveGappedConsensus;
  delete $self->{'consistencyArray'};
  delete $self->{'consistency'};
  delete $self->{'gappedLength'};
  delete $self->{'snps'};
}

##note that this method will replace the existing gappedConsensus with one generated from AssemblySequences...
sub makeGappedConsensus {
  my $self = shift;
  print STDERR "makeGappedConsensus $self\n" if $debug;
  $self->deleteGappedValues(1);
  $self->{'finishedGappedConsensus'} = 0;
  my $a = 0;
  while (1) {
    $self->getGappedConsensusSegment($a * 60);
    $a++;
    print STDERR "makeGappedConsensus: $a\n" if $debug;;
    last if  $self->{'finishedGappedConsensus'};
  }
}

##do I want to call setSequence with this?
sub makeConsensus{
  my $self = shift;
  my $consensus = $self->getGappedConsensus();
  $consensus =~ s/-//g;
  return $consensus;
}

sub toFasta {
  my($self,$type) = @_;
  my $id;
  if ($type) {
    $id = "D" . $self->getCacheId();
  } else {
   #mheiges $id = "DT." . $self->getId();
    $id = 'cluster.' . $self->getId() . '.tmp';
  }
  #mheiges - wrap to 60 nt
  return "\>$id\n" . CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),60);
}

##outputs sequence in fasta format with the DOTS header (defline)
##will need to add more organisms as get more in DOTS!!
sub toDOTSConsensus {
  my($self,$doGene) = @_;
  my $sequence = $self->getSequence();
  if (!$sequence) { 
    print STDERR "ERROR: Sequence for assembly na_sequence_id ".$self->getId()." not found\n";
    return undef; 
  }
  my $defline;
  if($doGene){
    my $rna = $self->getRNA(1);
    $defline = "\>DT.".$self->getId()." G.".$rna->getGeneId()." [".($self->getTaxonId() == 8 ? "Homo sapiens]" : "Mus musculus]");
  }else{
    $defline = "\>DT.".$self->getId()." [".($self->getTaxonId() == 8 ? "Homo sapiens]" : "Mus musculus]");
  }
  my $desc = $self->getDescription();
  $defline .= " $desc (".$self->get('number_of_contained_sequences')." sequences) length=".$self->get('length')."\n";
  return $defline . CBIL::Bio::SequenceUtils::breakSequence($sequence);
}


##returns the gappedConsensus at this posiiton in the assembly...
sub getConsNucAtIndex{
  my($self,$index) = @_;
  my %con;
  return $self->getConsNucFromGappedConsensus($index);
}

sub getConsNucFromGappedConsensus {
  my($self,$index) = @_;
  my $start = $index - $self->{'containedOffset'};
	
  #	print STDERR "getConsNucFromGappedConsensus:  $index, $start" if ($self->getId() eq '75164393' );
  if ($start < 0 || $start >= $self->getGappedLength()) {
    return undef;
  }
  #	print STDERR " (".substr($self->getGappedConsensus(),$start,1).")\n" if ($self->getId() eq '75164393' );
  return substr($self->getGappedConsensus(),$start,1);
}

sub getGappedLength {
  my $self = shift;
  if (!exists $self->{'gappedLength'}) {
    $self->{'gappedLength'} = length($self->getGappedConsensus());
  }
  return $self->{'gappedLength'};
}

sub setGappedLength {
  my($self,$len) = @_;
  $self->{'gappedLength'} = $len;
}

sub reverseComplementAssembly{
  my $self = shift;
  print STDERR "reverseComplementing assembly..$self: ",$self->getCacheId(),"\n" if $debug;
  ##need the gappedConsensus for reverseComplementing the AssemblySequences!!
  #	$self->makeGappedConsensus() unless exists $self->{'gappedConsensus'};
  foreach my $c ($self->getChildren('DoTS::AssemblySequence',1)) {
    $c->reverseComplement();
  }
  ##gappedConsensus
  $self->setGappedConsensus(CBIL::Bio::SequenceUtils::reverseComplementSequence($self->getGappedConsensus()));
  ##sequence
  $self->setSequence($self->makeConsensus());
  ##qualityValues
  $self->reverseComplementQualityValues();
}

sub reverseComplementQualityValues {
  my $self = shift;
  my @tmp = split(" +",$self->getQualityValues());
  $self->setQualityValues(join(' ',reverse(@tmp)));
}


##method that returns the cap2 alignment from the Assembly object
sub getCap2Alignment {
  my($self,$idType,$suppressNumbers,$print) = @_;

  #	$self->deleteGappedValues(); ##don't delete so don't regenerate gappedCons needlessly

  my @order = sort{$a->get('assembly_offset') <=> $b->get('assembly_offset')} $self->getChildren('DoTS::AssemblySequence',1);

  my $alignment = "";
  my $tmpLine;
  my $tmpSctn;
  my $a = 0;
  while (1) {
    my $index = $a * 60;        ##should I add one here??
    $a++;
    $tmpSctn = "";
    ##get the snps
    my @snps = $self->getSNPLocations($index,$index + 59);
    foreach my $c (@order) {
      next if $c->get('assembly_offset') > $index + 60;
      $tmpLine = $c->makeCap2SequenceLine($index,$idType,$suppressNumbers,\@snps);
      if ($tmpLine) {
        $tmpSctn .= $tmpLine;
      }
    }
    if (length($tmpSctn) > 0) {
      $alignment .= "\n                .    :    .    :    .    :    .    :    .    :    .    :\n";
      $alignment .= $tmpSctn;
    } else {
      last;
    }
    $alignment .= "________________________________________________________________________\n"; ##?use the sprintf from sub??
    $alignment .= $self->makeCap2ConsensusLine($index);
    if ($print) {
      print $alignment;
      $alignment = "";
    }
  }
  return $alignment unless $print;
}

sub printCap2Alignment {
  my($self,$idType,$suppressNumbers) = @_;
  $self->getCap2Alignment($idType,$suppressNumbers,1);
}

my $spaces = "                                                                                ";

##want to make it so is lazy and returns segment at time without calculating entrie gappedConsensus
sub makeCap2ConsensusLine{
  my($self,$index,$suppressNumbers) = @_;
  ##always 12 spaces so...
  my $seq;
  my $totSeq;
  if ($self->getGappedConsensus()) {
    $seq = substr($self->getGappedConsensus(),$index,60);
    $totSeq = substr($self->getGappedConsensus(),0,$index + 60);
  } else {
    $seq = $self->getGappedConsensusSegment($index);
    $totSeq = $self->getWholeGappedConsensusSegment();
  }
  $totSeq =~ s/-//g;
  my $space = 60 - length($seq);
  return "consensus   " . $seq . substr($spaces,0,$space) . ($suppressNumbers ? "\n" : "  " . length($totSeq) . "\n");
}

sub getWholeGappedConsensusSegment {
  my $self = shift;
  return $self->{'gappedConsensusSegment'};
}

sub getValidChildren {
  my($self,$index,$s) = @_;
  my $size = $s ? $s : 60;
	
  my @validChildren;
  foreach my $c ($self->getChildren('DoTS::AssemblySequence',1)) {
    if ($c->get('assembly_offset') <= $index + $size && $c->get('assembly_offset') + $c->getGappedLength() >= $index ) {
      push(@validChildren,$c);
    }
  }
  return @validChildren;
}

sub getGappedConsensusSegment {
  my($self,$index) = @_;
  print "makeGappedConsensusSegment $self\n" if $debug;
  my $gappedCons;
  my $haveAll = 0;
  my %con;
  my $i = 0;
  my $nuc;

  if(scalar($self->getChildren('DoTS::AssemblySequence',1)) == 0){
    $self->{'finishedGappedConsensus'} = 1;
    print STDERR $self->getClassName(),"->getGappedConsensusSegement($index): na_sequence_id (",$self->getId(),") Have NO AssemblySequence children\n";
    return undef;
  }

  ##want to only do those children in the scope of this segment
  my @validChildren = $self->getValidChildren($index);

  #print STDERR "getGappedConsensusSegment..validChildren: ".scalar(@validChildren)."\n";
	
  for (my $i = $index; $i < $index + 60; $i++) {
    undef %con;
    foreach my $c (@validChildren) {
      $nuc = $c->getNucAtIndex($i);
      if ($nuc) {
        $con{$nuc}++;
#        print STDERR "$nuc";
      }
    }
#    print STDERR "\n";
    if (! %con) {
      $haveAll = 1;
      last;
    }                           ##at the end...there are no more things to get..
    ##store an array of the consistency at each residue...
    my ($best,$second,$depth,$noGap) = $self->getColumnConsistency(\%con);
    push(@{$self->{'consistencyArray'}},[$best,$second,$depth,$i,$noGap]) if $best;

    $gappedCons .= $self->genNucFromNucHash(%con);
    #		print STDERR "$i:",$self->genNucFromNucHash(%con),"-",scalar(keys%con),",";
  }
  print STDERR "gappedConsensusSegment:\n",CBIL::Bio::SequenceUtils::breakSequence($gappedCons) if $debug;
  $self->{'gappedConsensusSegment'} .= $gappedCons;
  if ($haveAll){ # && length($self->getWholeGappedConsensusSegment()) >= $index) { ##have the entire gapped consensus
    $self->setGappedConsensus($self->getWholeGappedConsensusSegment()) unless $self->get('gapped_consensus') eq $self->getWholeGappedConsensusSegment(); ##only set if not same  as there already
    $self->{'gappedLength'} = length($self->getWholeGappedConsensusSegment()); ##updates length
    $self->{'finishedGappedConsensus'} = 1;
  }  
  return $gappedCons;
}

sub makeWtCol{
  my($self,%col) = @_;
  my $n;
  my @cons;
  foreach my $key (keys%col) {
    $n += $col{$key} unless $key =~ /[ACGT-]/; ##gathers up all unknown cols
  }
  @cons = ($col{A} ? $col{A} : "", $col{C} ? $col{C} : "", $col{G} ? $col{G} : "", $col{T} ? $col{T} : "", $n ? $n : "", $col{'-'} ? $col{'-'} : ""); 
  
  return join(',', @cons);
}

sub genNucHashFromWtCons{
  my($self,$nuc) = @_;          ##pass in wtCons for one position
  my %con;
  ($con{A}, $con{C}, $con{G}, $con{T}, $con{N}, $con{'-'}) = split(',',$nuc);
  return %con;
}

sub getColumnConsistency {
  my($self,$con) = @_;          ##pass in wtCons for one position
  my @sort = sort{$con->{$b} <=> $con->{$a}}keys%{$con};
  my $good = $con->{$sort[0]};
  my $total = $good;
  for (my $i=1;$i<scalar(@sort);$i++) {
    $total += $con->{$sort[$i]};
  }
  my $noGap = ($sort[0] !~ /(-|N)/ && $sort[1] !~ /(-|N)/) ? 1 : 0;
  return $total == 1 ? undef : ($good,$con->{$sort[1]},$total,$noGap); ##return undef if there is only a single seq..
}

sub genNucFromNucHash{
  my($self,%con) = @_;          ##pass in wtCons for one position
  my @sort = sort{$con{$b} <=> $con{$a}}keys%con;
  ##what to do when [0] and [1] are =?...use cap2 rules if can deduce
  if ($con{"$sort[0]"} == $con{"$sort[1]"}) {  
    if ($con{"$sort[0]"} == $con{"$sort[2]"}) { ##make it an N if 3 equal possibilities
      return "N";  
    } elsif ($sort[0] eq "N" || $sort[0] eq "-") { ##if one = N or "-" choose other
      return $sort[1];
    } elsif ($sort[1] eq "N" || $sort[1] eq "-") { ##if one = N or "-" choose other
      return $sort[0];
    } else {
      return $sort[0];          ##if two different bases then randomly choose first
    }
  } else {
    return $sort[0];
  }
}

# following method is for orienting the assembly correctly before submitting...could
# over-ride the submit method to make certain this happens.  Will use contained identifiers
# to determine the appropriate orientation and then reverseComplement if necessary.
## currently set to reverse complement if (inconsistent/(inconsistent + consistent) >= 0.6)

sub orientAssemblyByAssemblySequences {
  my $self = shift;
  my %or;                       ##hash for recording orientation
  print STDERR "Orienting the new assembly $self\n" if $debug;
  foreach my $a ($self->getChildren('DoTS::AssemblySequence')) {
    my $o = $a->isOrientationConsistent(); ##returns -1 if no information...
    ##1,correct EST,0-incorrect EST,2-correct mRNA,-2-incorrect mRNA
    $or{$o}++;
  }
  if (((exists $or{'0'} || exists $or{'1'}) && $or{'0'} / ($or{'1'} + $or{'0'}) >= 0.6 && $or{'-2'} - $or{'2'} >= 0 ) || $or{'-2'} - $or{'2'} > 0 ) {
    $self->reverseComplementAssembly();
    print STDERR "Assembly: orientAssemblyByAssemblySequences - reverseComplementing\n" if $debug;
  }
}

##over-ride submit so always orient correctly upon submit....
##note that am making certain to set some defaults here before submit...
##NOTE: THE DEFAULT IS NOT TO NOT SET THE DEFAULTS!!!
sub submit {
  my($self,$notDeep,$noTran) = @_;
  return $self->SUPER::submit($notDeep,$noTran) unless $self->hasChangedAttributes();
  if (!$self->isMarkedDeleted() && $self->getDescription() ne 'DELETED' && $self->getSetDefaultsOnSubmit() && $self->getChildren('DoTS::AssemblySequence',1) ) { ##only do these things if have AssemblySequence kids
    print STDERR "Setting defaults for Assembly: ".$self->getId()."\n" if $debug;
    $self->set('number_of_contained_sequences',scalar($self->getChildren('DoTS::AssemblySequence'))) unless $self->getNumberOfContainedSequences() == scalar($self->getChildren('DoTS::AssemblySequence'));
    $self->set('sequence_type_id',5) unless $self->getSequenceTypeId() == 5;
    $self->setContainsMrna();
    print STDERR "  Orienting assembly by contained sequences...\n" if $debug;
    $self->orientAssemblyByAssemblySequences();
    $self->setSequence($self->makeConsensus());
    $self->set('length',length($self->getSequence())) unless $self->getLength() == length($self->getSequence());
    $self->setAssemblyConsistency($self->getConsistency());
    $self->setGappedConsensus($self->getGappedConsensus()) unless $self->getGappedConsensus();
  } elsif (!$self->isMarkedDeleted() && $self->getSetDefaultsOnSubmit() && $self->getDescription() ne 'DELETED') {
    print STDERR "ERROR: Following Assembly has no AssemblySequences and will NOT be submitted\n",$self->toXML(); 
    $self->setRollBack(1);      ##want to roll back this transaction when call manageTransaction method at end.
    return 0;
  }
#  return 1;  ..for testing with no commit to check setting defaults
  return $self->SUPER::submit($notDeep,$noTran);
}

##methods to toggle setting of defaults in assemblies....class variable!!
sub getSetDefaultsOnSubmit {
  my $self = shift;
  return $setDefaultsOnSubmit;
}
sub setSetDefaultsOnSubmit {
  my($self,$val) = @_;
  $setDefaultsOnSubmit = $val;
}

##method to check the consistency of columns of an alignment and generate a score
##at each position return if only one sequence
##  count total number of positions > 1 seq
##  sum for these positions the max base / (sum of rest)
##  divide this sum by the total number > 1 to generate score
##  don't have float type in Assembly so multiply by 100 and take int...

sub calculateConsistency {
  my($self) = @_;
  my $total = 0;
  foreach my $c ($self->getConsistencyArray()) {
    $total += ($c->[0]/$c->[2]);
  }
  if ($total > 0) {
    $self->{'consistency'} = int(($total / scalar(@{$self->{'consistencyArray'}})) * 100);
  } else {
    print STDERR "Unable to determine consistency for ".$self->getId()."\n";
    $self->{'consistency'} = 0;
  }
}

sub getConsistencyArray {
  my($self) = @_;
  if (!exists $self->{'consistencyArray'}) {
    $self->makeGappedConsensus(); ##creates the array...
  }
  my @tmp;
  return exists $self->{'consistencyArray'} ? @{$self->{'consistencyArray'}} : @tmp;
}

sub getConsistency {
  my $self = shift;
  return 100 if scalar($self->getChildren('DoTS::AssemblySequence',1)) == 1;
  if (!exists $self->{'consistency'}) {
    $self->calculateConsistency();
  }
  return $self->{'consistency'};
}

##note: $where is a string of constraints that begins with "attribute_name > value and ...."
sub retrieveSNPsFromDB {
  my($self,$where) = @_;
  if(!$where && !$snpStmt){
    $snpStmt = $self->getQueryHandle()->prepare("select assembly_position from DoTS.AssemblySNP where na_sequence_id = ? order by assembly_position");
  }
  delete $self->{'snps'};
  my $stmt;
  if($where){
    $stmt = $self->getQueryHandle()->prepare("select assembly_position from DoTS.AssemblySNP where na_sequence_id = ? and $where order by assembly_position");
  }else{
    $stmt = $snpStmt;
  }
  $stmt->execute($self->getId());
  while(my($pos) = $stmt->fetchrow_array()){
    push(@{$self->{'snps'}},$pos - 1);
  }
}

##look for column of poor consistency flanked by two high consistency ones
##alternative...look for column that has second best represented >2x
##consArr = [num best,num second,total num, index, noGaps]
sub findSNPs {
  my($self,$depth,$percent,$max_best_percent,$minDepthMinusBest,$makeSnpObjects) = @_; ##$percent = numsecond/depth to match
            ##$max_best_percent = max num_best/depth to match (this is perhaps better than percent as there could be three nucleotides represented so percent wouldn't as accurately rflect the level of polymorphism)
            ##$minDepthMinusBest = minimum divergence (total number) of sequences from consensus
            ###$makeSnpObjects ... if 1 AssemblySNP Only if 2 also AssemblySequenceSNP
  $depth = $depth ? $depth : 6; ##defaults to only look at depth of 6 or greater
  $percent = $percent ? $percent : 0.2 unless $max_best_percent; ##20% default for second nucleotide but don't set if using $max_best_percent
  my $snps;
  delete $self->{'snps'};
  foreach my $c ($self->getConsistencyArray()) {
    next unless $c->[2] >= $depth;
    next unless $c->[4];
    next if ($minDepthMinusBest && $c->[2] - $c->[0] < $minDepthMinusBest);
    if(($max_best_percent && $c->[0]/$c->[2] <= $max_best_percent) || ($percent && $c->[1]/$c->[2] >= $percent)){  
      ##update the snp array
      push(@{$self->{'snps'}},$c->[3]);
      ##now get column and output
      ##should get actual position in assembly....
      if($makeSnpObjects){
        $self->makeAssemblySNPObjects($makeSnpObjects,$c->[3],$c->[2],$c->[0]/$c->[2]);
      }else{
        my $pos = $c->[3] + 1;
        my $tmp = substr($self->getGappedConsensus(),0,$pos);
        $tmp =~ s/-//g;
        $snps .= "SNP at position ".length($tmp).": $pos in gappedConsensus\n";
        foreach my $aseq ($self->getChildren('DoTS::AssemblySequence')) {
          my $nuc = $aseq->getNucAtIndex($c->[3]);
          $snps .= " $nuc\t".$aseq->getId()."\n" if $nuc;
        }
      }
    }
  }
  return $snps;
}

##makes assemblysnp objects (and assemblysequencesnp objects) and adds as children to  self
sub makeAssemblySNPObjects {
  my($self,$makeSnpType,$index,$depth,$best_percent) = @_;
  ##first create the AssemblySNP object so can  add as parent to assnps
  my $snp = GUS::Model::DoTS::AssemblySNP->new({ 'assembly_position' => $index + 1,
                               'assembly_depth' => $depth });
  $self->addChild($snp);

  my %cons;
  ##now loop through the assseqs and get nucs etc...
  my $checkDepth = 0;
  foreach my $aseq ($self->getChildren('DoTS::AssemblySequence')) {
    my $nuc = $aseq->getNucAtIndex($index);
    next unless $nuc;  ##not in region of this assemblysequence
    $checkDepth++;
    $cons{$nuc}++;
    ##now need to create the AssemblySequenceSNP object...
    if($makeSnpType == 2){
      my $assnp = GUS::Model::DoTS::AssemblySequenceSNP->new( { 'sequence_character' => $nuc } );
      my $gloc = $aseq->getPositionAtIndex($index);
      $assnp->setGappedLocation($gloc);
      $assnp->setNaSequenceLocation($aseq->getNaSequencePosition($gloc));
      $assnp->setParent($aseq);
      $assnp->setParent($snp);
    }
  }
  print STDERR "ERROR: Assembly->makeAssemblySNPObjects($index,$depth,$best_percent): checkDepth failed..depth=$depth, checkDepth=$checkDepth\n" unless $checkDepth == $depth;

  ##now set the other atts of $snp
  ##consensus_position
  my $tmp = substr($self->getGappedConsensus(),0,$index + 1);
  $tmp =~ s/-//g;
  $snp->setConsensusPosition(length($tmp));
  ##now percentACGT
  my $nucs;
  my @s = sort{$cons{$b} <=> $cons{$a}}keys%cons;
  $snp->setFractionNuc1($cons{$s[0]}/$depth);
  my $c = 0;
  foreach my $n (@s){
    $c++;
    last if $c > 4;
    $snp->set("nuc_$c",$n);
    $snp->set("num_nuc_$c",$cons{$n});
  }
  my $ctDist = 0;
  foreach my $n ('A','C','G','T'){
    $snp->set("num_\L$n",$cons{$n} ? $cons{$n} : 0);
    $nucs += $cons{$n} if $cons{$n};
    $ctDist++ if $cons{$n};
  }
  $snp->setNumOther($depth - $nucs);
  $snp->setNumDistinctAcgt($ctDist);

}

##returns an array of locations in the gappedConsensus
##optionally takes in a range
sub getSNPLocations {
  my($self,$start,$end) = @_;
  return @{$self->{'snps'}} if $self->{'snps'} && !defined $start;
  my @tmp;
  foreach my $l (@{$self->{'snps'}}) {
    push(@tmp,$l) if $l >= $start && $l <= $end;
  }
  return @tmp;
}
##XML format for cap4
sub toCAML {
  my($self,$type) = @_;
    my @q = split(' +',$self->getQualityValues());
    print STDERR "toCAML: gappedConsensus length: ",length($self->getGappedConsensus()),", qualityValues: ",scalar(@q),"\n" if $debug;
  my $caml;
  my $quality = $self->getQualityValues();
  my $numFrags = $self->getNumberOfContainedSequences() ? $self->getNumberOfContainedSequences() : scalar($self->getChildren('DoTS::AssemblySequence',1));
#  ##if there are no quality values and is singleton then return caml for assembllysequence??
#  if(!quality && $numFrags == 1){
#    return $self->getChild('DoTS::AssemblySequence')->toCAML();
#  }
  ##if there are no quality values, generate them so can print more informaively...
  my $makeQual = 0;
  if(!$quality){
    $quality = $self->makeQualityValues();
    $makeQual = 1;
  }

  ##need to check to make certain thatt number of quality values matches length of gapped_consensus
  my $qualLength = length(@q);
  if($qualLength != $self->getGappedLength()){  ##length problems
    $quality = $self->getQualityValuesAverage($quality);
  }

  $caml = ($quality ? "  <CONTIG NUM_FRAG=\"$numFrags\" " : "  <SEQUENCE ").'NAME="'.($type ? "D." : "DT.").$self->getCacheId()."\">\n";
  if ($quality) {
    $caml .= "    <CONSENSUS LENGTH=\"".$self->getGappedLength()."\">\n";
  }
  #  $caml .= "    <BASE>\n".($quality ? CBIL::Bio::SequenceUtils::breakSequence($self->getGappedConsensus(),74,'      ') : CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),74,'      '))."    </BASE>\n";
  $caml .= "    <BASE>".$self->getGappedConsensus()."    </BASE>\n";
  if ($quality) { 
    $caml .= "    <QUALITY>".$quality."</QUALITY>\n";
    $caml .= "    </CONSENSUS>\n  </CONTIG>\n";
  } else {
    $caml .= "  </SEQUENCE>\n";
  }
  return $caml;
}

sub getQualityValueLength {
  my $self = shift;
  my @qual = split(' ',$self->getQualityValues());
  return scalar(@qual);
}

sub getQualityValuesAverage {
  my ($self,$qualString) = @_;
  my @qual = split(' ',$qualString);
  return undef if scalar(@qual) == 0;
  my $tot;
  foreach my $q (@qual){
    $tot += $q;
  }
  my $avg = int($tot/scalar(@qual));
  $avg = $avg == 10 ? 11 : $avg;  ##if quality values are al 10 causes cap4 problems!!
  my $length = $self->getGappedLength();
  my @nQual;
  for (my $i = 0;$i<$length;$i++) {
    push(@nQual,$avg);
  }
  my $qual = join(' ',@nQual);
#  $self->setQualityValues($qual);
  return $qual;
}

sub makeQualityValues {
  my ($self) = @_;
  my @qual;
	my $length = length($self->getSequence());
  if ($self->getContainsMrna()) { ##contains mRNA sequence...
    for (my $i = 0;$i<$length;$i++) {
      push(@qual,22);
    }
  } else {
    for (my $i = 0;$i<$length;$i++) {
      push(@qual,11);
    }
  }
#  my $tmp;
#  for(my $i = 0;$i < scalar(@qual);$i += 25){
#    $tmp .= '      '.join(' ',@qual[$i..$i+24])."\n";
#  }
#  return $tmp;
  return join(' ',@qual);
}


sub removeGapsFromQuality {
  my $self = shift;
  my @qual = split(' +',$self->getQualityValues());
  return undef if scalar(@qual) < 10;
  my @tmp;
  for (my $i = 0;$i < $self->getGappedLength();$i++) {
    push(@tmp,$qual[$i]) unless substr($self->getGappedConsensus(),$i,1) eq '-';
  }
  return join(' ',@tmp);
  
}



1;
