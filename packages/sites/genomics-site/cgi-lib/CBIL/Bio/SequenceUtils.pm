package CBIL::Bio::SequenceUtils;

use strict;

my $debug = 0;

sub breakSequence {
  my($seq,$lineLength,$beginSpace) = @_;
	my $ll = $lineLength ? $lineLength : 80;
  ##just in case there are returns...
  $seq =~ s/\s//g;
  my $new = "";
  for (my $i = 0;$i<length($seq);$i+=$ll) {
    $new .= $beginSpace . substr($seq,$i,$ll) . "\n";
  }
  return $new;
}

sub makeFastaFormattedSequence{
	my($defline,$sequence,$lineLength) = @_;
	my $ll = $lineLength ? $lineLength : 80;
	return ">" . $defline . "\n" . &breakSequence($sequence,$ll);
}

sub reverseComplementSequence{	##for reverseComplementing sequences
  my($seq) = @_;
  $seq =~ s/\s//g;
  my $revcompseq = "";
  print STDERR "revCompSeq: incoming:\n$seq\n" if $debug == 1;
  my $revseq = reverse $seq;
  my @revseq = split('', $revseq);
  foreach my $nuc (@revseq) {
    $revcompseq .= &compNuc($nuc);
  }
  print STDERR "revCompSeq: returns:\n$revcompseq\n" if $debug == 1;
  return $revcompseq;
}

sub compNuc{
  my($nuc) = @_;
  if ($nuc =~ /A/i) {
    return "T";
  } elsif ($nuc =~ /T/i) {
    return "A";
  } elsif ($nuc =~ /C/i) {
    return "G";
  } elsif ($nuc =~ /G/i) {
    return "C";
  }
  return $nuc;									## - and N get returned as themselves
}

##Methods for doing translation ##

my @names; 
my	@AA;
my	@SC;
my	@B1;
my	@B2;
my	@B3;

$names[0] = "Standard";
$AA[0] = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[0] = "---M---------------M---------------M----------------------------";
$B1[0] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[0] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[0] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[1] = "Vertebrate Mitochondrial";
$AA[1] = "FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSS**VVVVAAAADDEEGGGG";
$SC[1] = "--------------------------------MMMM---------------M------------";
$B1[1] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[1] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[1] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";
 
$names[2] = "Yeast Mitochondrial";
$AA[2] = "FFLLSSSSYY**CCWWTTTTPPPPHHQQRRRRIIMMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[2] = "-----------------------------------M----------------------------";
$B1[2] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[2] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[2] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";
  
$names[3] = "Mold, Protozoan, Coelenterate Mitochondrial and Mycoplasma/Spiroplasma";
$AA[3] = "FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[3] = "--MM---------------M------------MMMM---------------M------------";
$B1[3] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[3] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[3] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[4] = "Invertebrate Mitochondrial";
$AA[4] = "FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSSSSVVVVAAAADDEEGGGG";
$SC[4] = "---M----------------------------MMMM---------------M------------";
$B1[4] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[4] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[4] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[5] = "Ciliate Macronuclear and Dasycladacean";
$AA[5] = "FFLLSSSSYYQQCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[5] = "-----------------------------------M----------------------------";
$B1[5] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[5] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[5] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[6] = "Echinoderm Mitochondrial";
$AA[6] = "FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNNKSSSSVVVVAAAADDEEGGGG";
$SC[6] = "-----------------------------------M----------------------------";
$B1[6] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[6] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[6] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[7] = "Euplotid Nuclear";
$AA[7] = "FFLLSSSSYY**CCCWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[7] = "-----------------------------------M----------------------------";
$B1[7] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[7] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[7] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[8] =  "Bacterial";
$AA[8] = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[8] = "---M---------------M------------MMMM---------------M------------";
$B1[8] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[8] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[8] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";
  
$names[9] = "Alternative Yeast Nuclear";
$AA[9] = "FFLLSSSSYY**CC*WLLLSPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[9] = "-------------------M---------------M----------------------------";
$B1[9] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[9] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[9] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[10] =  "Ascidian Mitochondrial";
$AA[10] = "FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSSGGVVVVAAAADDEEGGGG";
$SC[10] = "-----------------------------------M----------------------------";
$B1[10] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[10] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[10] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[11] =  "Flatworm Mitochondrial";
$AA[11] = "FFLLSSSSYYY*CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNNKSSSSVVVVAAAADDEEGGGG";
$SC[11] = "-----------------------------------M----------------------------";
$B1[11] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[11] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[11] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

$names[12] =  "Blepharisma Macronuclear";
$AA[12] = "FFLLSSSSYY*QCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
$SC[12] = "-----------------------------------M----------------------------";
$B1[12] = "TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG";
$B2[12] = "TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG";
$B3[12] = "TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG";

my %organismCode = ("Standard" => 0,
										"Vertebrate Mitochondrial" => 1,
										"Yeast Mitochondrial" => 2,
										"Mold, Protozoan, Coelenterate Mitochondrial and Mycoplasma/Spiroplasma" => 3,
										"Invertebrate Mitochondrial" => 4,
										"Ciliate Macronuclear and Dasycladacean" => 5,
										"Echinoderm Mitochondrial" => 6,
										"Euplotid Nuclear" => 7,
										"Bacterial" => 8,
										"Alternative Yeast Nuclear" => 9,
										"Ascidian Mitochondrial" => 10,
										"Flatworm Mitochondrial" => 11,
										"Blepharisma Macronuclear" => 12 );
										

sub generateCodonHash {
	my($index) = @_;
	my $i = $index ? $index : 0;
	my @aa = split('',$AA[$i]);
	my @b1 = split('',$B1[$i]);
	my @b2 = split('',$B2[$i]);
	my @b3 = split('',$B3[$i]);
	my %cod;
	for (my $a = 0;$a<scalar(@aa);$a++){
		my $codon = $b1[$a] . $b2[$a] . $b3[$a];
		$cod{$codon} = $aa[$a];
	}
	return %cod;
}

sub translateSequence {
	my($seq,$codonTable) = @_;
	my $ct = $codonTable ? $codonTable : 0;  ##default is the standard..
	my %cod = &generateCodonHash($ct);
#	print STDERR "Codons: (".join(', ',keys%cod).")\n";
	my $trans;
	for(my $i = 0;$i<length($seq)-2;$i+=3){
		my $aa = $cod{substr($seq,$i,3)};
		$trans .= $aa ? $aa : "X";
	}
	return $trans;
}

1;
