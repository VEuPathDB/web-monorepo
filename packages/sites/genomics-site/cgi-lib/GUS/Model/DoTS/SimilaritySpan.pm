
package GUS::Model::DoTS::SimilaritySpan;         # table name
use strict;
use GUS::Model::DoTS::SimilaritySpan_Row;
use CBIL::Bio::SequenceUtils;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::SimilaritySpan_Row);

##$type eq query|subject
sub getHSPSequence {
  my($self,$type,$reverseComp) = @_;
  if (!$self->{$type."Sequence"}) {
    my $seqob = $self->getParent('DoTS::Similarity',1)->getSequenceObject($type);
    my $seq = $seqob->{didNotRetrieve}->{sequence} ? $seqob->getSubstrFromClob('sequence',$self->get($type."_start"),$self->get($type."_end") - $self->get($type."_start") + 1) : substr($seqob->getSequence(),$self->get($type."_start")-1,$self->get($type."_end") - $self->get($type."_start") + 1);
    $self->{$type."Sequence"} = $seq;
  }
  return ($reverseComp && $self->getIsReversed() && $type eq 'query') ? CBIL::Bio::SequenceUtils::reverseComplementSequence($self->{$type."Sequence"}) : $self->{$type."Sequence"};
}

my $fastaPath = '/usr/local/src/bio/fasta/3.3';
my $blastPath = '/usr/local/pkg/bio/wu-blast/2.0';
my $sim4Path = '/usr/local/bin/sim4';
my $spaces = '                    ';
sub generateHSPAlignment {
  my($self,$type) = @_;
  $type = $type ? $type : 'blast';
  ##need header...
  my $align = "subject: ".$self->getSubjectStart()." - ".$self->getSubjectEnd()."  query: ".$self->getQueryStart()." - ".$self->getQueryEnd()."  frame='".$self->getReadingFrame()."'  is_reversed='".$self->getIsReversed()."'\n";
  $align .= "  Score = ".$self->getScore()."  P = ".$self->getPValue()."  Identities = ".$self->getNumberIdentical()."/".$self->getMatchLength()." (".int(($self->getNumberIdentical()/$self->getMatchLength())*100)."\%)  ".
    "Positives = ".$self->getNumberPositive()."/".$self->getMatchLength()." (".int(($self->getNumberPositive()/$self->getMatchLength())*100)."\%)\n\n";

  my $qFile = "/tmp/tmpQuery.$$";
  my $sFile = "/tmp/tmpSubject.$$";
  #  print STDERR "Files: $sFile, $qFile\n";

  ##writeFiles
  open(Q,">$qFile");
  print Q ">Query\n".CBIL::Bio::SequenceUtils::breakSequence($self->getHSPSequence('query',$type =~ /fasta/i));
  close Q;
  open(S,">$sFile");
  print S ">Sbjct\n".CBIL::Bio::SequenceUtils::breakSequence($self->getHSPSequence('subject'));
  close S;

  my $retrying = 0;
  my($pgm,$query);
 RETRY:
  $pgm = $self->getAlignmentProgram($type);
  if($type eq 'sim4'){
    $query = "/usr/local/bin/sim4 $qFile $sFile A=1";
  }else{
    $query = $type =~ /blast/i ? "$blastPath/$pgm $sFile $qFile -hspmax 1" : "$fastaPath/$pgm -a -b 1 -d 1 -q $qFile $sFile";
  }
  #  print STDERR "Running $type:\n$query\n\n";
  ##need to make the db if  blast
  if ($type =~ /blast/i) {
    if ($self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getSubjectTableId()) =~ /AASequence/) {
      system("$blastPath/setdb $sFile > /dev/null");
    } else {
      system("$blastPath/pressdb $sFile > /dev/null");
    }
  }
  my @a = `$query 2> /dev/null`;
  my $hsp;
  my $hspQLen = length($self->getHSPSequence('query'));
  for (my $i = 0;$i<scalar(@a);$i++) {
#    print STDERR $a[$i];
#        if ($type =~ /blast/i && $a[$i] =~ /(Iden.*Pos.*?\))/) {
#          $hsp .= "  $1\n\n";
#        }
    
    ##do the sim4 alignments..
    if($type eq 'sim4' && $a[$i] =~ /^\s+\d+\s.*(\.|:)/){
      my $spaceLen = 0;
      if($a[$i+1] =~ /^(\s*\d+\s)(.*)$/){
        $spaceLen = length($1);
        my $s = $1;
        my $match = $2;
        my $tmp = $match;
        $tmp =~ s/\s//g;
        $tmp =~ s/-//g;
        $a[$i+1] = "Query:".$self->getRealLocation($self->getIsReversed() ? $hspQLen - $s + 1 : $s,$self->getQueryStart(),'start').$match ." ".$self->getRealLocation($self->getIsReversed() ? $hspQLen - (length($tmp) + $s - 1) + 1 : length($tmp) + $s - 1,$self->getQueryStart(),'end');
      }
      if($a[$i] =~ /^.{$spaceLen}(.*)$/){
        $a[$i] = substr($spaces,0,17) . $1 . "\n";
      }
      if($a[$i+2] =~ /^.{$spaceLen}(.*)$/){
        $a[$i+2] = substr($spaces,0,17) . $1 . "\n";
      }
      if($a[$i+3] =~ /^(\s*\d+\s)(.*)$/){
        my $s = $1;
        my $match = $2;
        my $tmp = $match;
        $tmp =~ s/\s//g;
        $tmp =~ s/-//g;
        $a[$i+3] = "Sbjct:".$self->getRealLocation($s,$self->getSubjectStart(),'start').$match ." ".$self->getRealLocation(length($tmp) + $s - 1,$self->getSubjectStart(),'end');
#        $a[$i+3] = "Sbjct:".$self->getRealLocation($1,$self->getSubjectStart(),'start').$2."\n";
      }
      $hsp .= join('',@a[$i..$i+4]);
      $i += 3;
    }elsif ($a[$i] =~ /^Query(:|\s)/) {
      $a[$i+1] =~ s/:/|/g;
      if ($type =~ /blast/i) {
        for (my $b = 0;$b<4;$b++) {
#          print STDERR "ERR: ".$a[$i+$b];
          if ($a[$i+$b] =~ /^(Query:)(\s*\d+\s)(\S+)\s(\d+)/) {
            $hsp .= $1.$self->getRealLocation($2,$self->getQueryStart(),'start').$3." ".$self->getRealLocation($4,$self->getQueryStart(),'end');
          } elsif ($a[$i+$b] =~ /^(Sbjct:)(\s*\d+\s)(\S+)\s(\d+)/) {
            $hsp .= $1.$self->getRealLocation($2,$self->getSubjectStart(),'start').$3." ".$self->getRealLocation($4,$self->getSubjectStart(),'end');
          } else {
            $hsp .= '    '.$a[$i+$b];
          }
        }
      }else{
        $hsp .= join('',@a[$i-1..$i+4]);
      } 
      $i += 3;
    }
  }
  if (!$hsp) {
    if (!$retrying && $type ne 'sim4') {
      $retrying = 1;
      $type = $type =~ /blast/i ? 'fasta' : 'blast';
      goto RETRY;
    }
    $hsp = "Unable to generate alignment\n\n";
  } else {
    $hsp = "Aligning with ".($type =~ /blast/i ? "BLAST" : 'FASTA')."\n\n".$hsp if $retrying;
    ##note that here we could generate something if unable to do it with this method
    ##if lengths are OK...
  }
  unlink "$sFile";
  unlink "$qFile";
  $align .= $hsp; 
  return $align;
} 

##for blast, generates the real locations from the similarityspan and alignment
sub getRealLocation {
  my($self,$loc,$hsp_loc,$type) = @_;
  $loc =~ s/\s//g;
  my $es = '          ';
  my $nloc = $loc + $hsp_loc - 1;
  return $type eq 'start' ? substr($es,0,10 - length($nloc)).$nloc." "  : "$nloc\n";
}

sub getAlignmentProgram {
  my ($self,$type) = @_;
  if ($type =~ /blast/i) {
    return $self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getQueryTableId()) =~ /AASequence/ ?
      ($self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getSubjectTableId()) =~ /AASequence/ ? "blastp" : "tblastn") : 
        ($self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getSubjectTableId()) =~ /AASequence/ ? "blastx" : "blastn");
  }elsif($type eq 'sim4'){
    return 'sim4'
  } else {
    return $self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getQueryTableId()) =~ /AASequence/ ?
      ($self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getSubjectTableId()) =~ /AASequence/ ? "fasta33" : "tfasta33") : 
        ($self->getTableNameFromTableId($self->getParent('DoTS::Similarity',1)->getSubjectTableId()) =~ /AASequence/ ? "fastx33" : "fasta33");
  }
}

sub setPValue {
  my($self,$pval) = @_;
  my($mant,$exp);
  if ($pval =~ /^(\S+)e(\S+)$/) {
    $mant = $1;
    $exp = $2;
  } else {
    $mant = $pval == 0 ? 0 : $pval;
    $exp = $pval == 0 ? -999999 : 0;
  }
  $self->setPvalueMant($mant);
  $self->setPvalueExp($exp);
}

sub getPValue {
  my($self) = @_;
  return $self->getPvalueMant() . (($self->getPvalueExp() != -999999 && $self->getPvalueExp() != 0) ? "e" . $self->getPvalueExp() : "");
}


1;
