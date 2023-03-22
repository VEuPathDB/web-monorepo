#!/usr/bin/perl -I.

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use Chart::Lines;

use strict;

my $query = new CGI;


my $AvsB = 1; # plot acidic vs basic
my $PEPW = 1; # plot pepwindow output

## setting as 0 as hydropathy plot is not available as of yet.
$PEPW = 0;

my $printQuery = 1;

my $verbose = 0;
my $debug = 0;
my $aaseq = $query->param('sequence');
my $trunc = 150;

$aaseq =~ s/^>(\S+).*?[\n\r]+//;
my $id = $1 || "query";
$id =~ s/[\W]/-/g;

$aaseq =~ s/[\W\d\s]//g;
$aaseq = uc($aaseq);
$aaseq = substr($aaseq, 0, $trunc);

unless (length($aaseq)){
  print $query->header,"<HTML><body bgcolor=F0F0F0>\n";
  print "<hr>Error: No sequence</h2>";
  exit(0);
}

my $pwd = `pwd`;
chomp($pwd);

my $png = time;

my $tempdir="$pwd/../html/plasmoap/tmp/";
my $tempfile="tempfile.$id";
my $wwwpngdir="/plasmoap/tmp";
my $pngoutdir="$pwd/../html/plasmoap/tmp";

my $signalpbin="/usr/local/software/signalp/3.0/signalp";
my $pepwindowbin="/www/plasmodb.org/bin/pepwindow";

#now write the sequence to disk

open(TEMP,">$tempdir$tempfile") or die ("\n$tempdir$tempfile: $! !!\n\n");
print TEMP ">$id\n$aaseq\n";
close TEMP;


#######################
# create hashtables

my %leftHash = ( L => '1.70',
		 I => '1.04',
		 V => '-0.26',
		 F => '0.14',
		 W => '-0.43',
		 Y => '0.19',
		 A => '-0.07',
		 G => '-0.33',
		 M => '0.08',
		 P => '0.15',
		 C => '4.87',
		 H => '-0.24',
		 N => '0.74',
		 Q => '-1.13',
		 S => '-0.13',
		 T => '-0.91',
		 K => '-0.85',
		 R => '-1.19',
		 D => '0.44',
		 E => '1.48');

my %coreHash = ( L => '-3.62',
		 I => '-2.05',
		 V => '-1.75',
		 F => '-1.17',
		 W => '3.49',
		 Y => '-1.88',
		 A => '0.79',
		 G => '1.95',
		 M => '1.10',
		 P => '1.63',
		 C => '6.35',
		 H => '1.74',
		 N => '2.36',
		 Q => '1.60',
		 S => '1.27',
		 T => '0.27',
		 K => '0.40',
		 R => '-0.79',
		 D => '4.91',
		 E => '5.14');

my %rightHash = ( L => '-0.02',
		  I => '0.11',
		  V => '0.70',
		  F => '0.53',
		  W => '0.12',
		  Y => '1.15',
		  A => '0.46',
		  G => '0.03',
		  M => '0.17',
		  P => '-0.28',
		  C => '0.25',
		  H => '0.09',
		  N => '-0.29',
		  Q => '-0.15',
		  S => '-0.23',
		  T => '-0.48',
		  K => '-1.08',
		  R => '-1.72',
		  D => '0.35',
		  E => '1.65');

my $seqLen = length($aaseq);
if ($seqLen<12) {
  die "Sequence too short\n\n";
}

my @letters = split("", $aaseq);

my @scores;
my @xs;
for (my $i = 6; $i < ($seqLen-6); $i++) {
  my $score = 0;
  $score += $leftHash{$letters[$i-6]} * 0.33;
  $score += $leftHash{$letters[$i-5]} * 0.66;
  $score += $leftHash{$letters[$i-4]} * 1.00;
  $score += $leftHash{$letters[$i-3]} * 1.50;

  $score += $coreHash{$letters[$i-2]} * 1.00;
  $score += $coreHash{$letters[$i-1]} * 1.00;
  $score += $coreHash{$letters[$i]}   * 1.00;
  $score += $coreHash{$letters[$i+1]} * 1.00;
  $score += $coreHash{$letters[$i+2]} * 1.00;

  $score += $rightHash{$letters[$i+3]} * 1.50;
  $score += $rightHash{$letters[$i+4]} * 1.00;
  $score += $rightHash{$letters[$i+5]} * 0.66;
  $score += $rightHash{$letters[$i+6]} * 0.33;

  push @scores,$score;
  push @xs, $i;
}

my $g = Chart::Lines->new;
$g->add_dataset (@xs);
$g->add_dataset (@scores);

$g->set('title' => "DnaK Scores:", 'x_ticks'=> 'vertical' ,'skip_x_ticks'=> 10);
$g->set('colors' => { 'y_label' => [0,0,255],
		      'y_label2' => [0,255,0],
		      'y_grid_lines' => [127,127,0],
		      'dataset0' => [127,0,0],
		      'dataset1' => [0,127,0],
		      'dataset2' => [0,0,127]
		    });
$g->set('y_label' => 'Score');
$g->set('y_grid_lines' => 'true');
$g->set('legend' => 'none');

$g->png("$pngoutdir/$png.png");

##
## PLOT ACIDIC VS BASIC
##

if ($AvsB){
  my $peplength=13;

  my @yAs=();
  my @yBs=();
  my @sts=();
  my %hash=();
  my @vs=();

  for (my $i=1;$i<$seqLen;$i++){
    my $txt=substr($aaseq, $i, $peplength);
    my $basics=($txt=~s/[khr]//ig);
    my $acidics=($txt=~s/[de]//ig);
    my $st=($txt=~s/[nk]//ig);
    push @yAs, $acidics;
    push @yBs, $basics;
    push @sts, $st;

    my $ratio;
    if ($acidics<1){
      if ($basics<1){
	$ratio=0;
      }else{
	$ratio=$peplength;
      }
    }else{
      $ratio=int( ( ($basics/$acidics)/ $peplength )*$peplength);
    }

    push @vs, $ratio;
  }

  my $i = Chart::Lines->new;
  $i->add_dataset(@xs);
  $i->add_dataset(@yAs);
  $i->add_dataset(@yBs);
  $i->add_dataset(@sts);

  ## UNCOMMENTED PLOTTING OF RATIO BECAUSE OF INFINITY EFFECTS
  #$i->add_dataset (@vs);

  $i->set ('title' => "basic vs. acidic",
	   'x_ticks'=> 'vertical',
	   'skip_x_ticks'=> 10);
  $i->set ('colors' => {'y_label'  => [0,0,127],
			'y_label2' => [0,127,0],
			'y_grid_lines' => [127,127,0],
			'dataset0' => [0,127,0],
			'dataset1' => [0,0,127],
			'dataset2' => [127,0,0],
			'dataset3' => [255,255,0],
			#'dataset4' => [0,255,0]
		       });
  $i->set ('y_label' => 'basics');
  $i->set ('y_label2' => 'acidics');
  $i->set ('y_grid_lines' => 'true');
  $i->set ('legend' => 'bottom');
  my @labels = ('DE', 'KHR', 'NK');
  $i->set ('legend_labels' => \@labels);
  $i->png ("$pngoutdir/${png}_comp.png");
}




###
### PLOT Hydrophobicity
###

if ($PEPW){
  my $pepwlength=7;
  chdir  $tempdir;
  system ("$pepwindowbin -graph=data -length=$pepwlength $tempdir$tempfile");

  ## DOESN'T SEEM TO WORK OTHERWISE
  system ("mv ./pepwindow1.dat $pngoutdir/${png}_hyd.dat");

  #my @val=();
  my @ys=();
  my %hash=();
  open (IN, "<$pngoutdir/${png}_hyd.dat") || warn "$pngoutdir/${png}_hyd.dat: $!\n\n" ;
  while (<IN>){
    chomp;
    if  (/^\#/){
      next;
    } else {
      my ($x,$y)=split(/\s+/,$_,2);
      #push @val, int($x);
      push @ys,$y;
    }
  }
  close IN;

  my $h = Chart::Lines->new;
  $h->add_dataset (@xs);
  $h->add_dataset (@ys);

  $h->set('title' => "Hydrophobicity", 'x_ticks'=> 'vertical' ,'skip_x_ticks'=> 10);
  $h->set('colors' => {'y_label' => [0,0,255],
		       'y_label2' => [0,255,0],
		       'y_grid_lines' => [127,127,0], 'dataset0' => [127,0,0],
		       'dataset1' => [0,127,0], 'dataset2' => [0,0,127]});
  $h->set('y_label' => 'hydrophob.');
  $h->set('y_grid_lines' => 'true');
  $h->set('legend' => 'none');

#  $h->png("$pngoutdir/${png}_hyd.png");
}


###
### END OF PLOTTING SECTION
###


###
### MAKE HTML
###

htmlhead("PlasmoAP Results");

print "<center><h1><font color=navy>Apicoplast targeting peptide prediction</font></h1></center>\n\n";
print "<center><table width=640><tr><td>\n";

if ($printQuery) {
  print "Query sequence:  (Please note, that only the first $trunc AA have been taken into account for the analysis.)<br>\n";
  print "<pre>&gt;$id\n". wrap($aaseq, 40). "</pre>\n\n"
}

my ($header,$valueA,$valueB,$valueC,$valueD,$verdictA,$verdictB,$verdictC,$verdictD,$verdictFinal,$result, $MF);
my @result;
my ($maxC_position,$maxC_value,$maxC_cutoff,$maxC_conclusion,$maxY_position,$maxY_value,$maxY_cutoff,$maxY_conclusion,$maxS_position,$maxS_value,$maxS_cutoff,$maxS_conclusion,$meanS_start,$meanS_stop,$meanS_value,$meanS_cutoff,$meanS_conclusion,$quality);


###
### CHECK FOR SIGNAL SEQUENCE
###

print STDERR "CHECK: $signalpbin -t euk -m nn -trunc 70 $tempdir$tempfile\n";
@result= `$signalpbin -t euk -m nn -trunc 70 $tempdir$tempfile`;

## GET OUTPUT OF SIGNALP INTO SOME VARIABLES

($maxC_position,$maxC_value,$maxC_cutoff,$maxC_conclusion,$maxY_position,$maxY_value,$maxY_cutoff,$maxY_conclusion,$maxS_position,$maxS_value,$maxS_cutoff,$maxS_conclusion,$meanS_start,$meanS_stop,$meanS_value,$meanS_cutoff,$meanS_conclusion,$quality) = &parsesgp(@result);

my ($header,$value1A,$value1B,$value1C,$value1D,$verdict1A,$verdict1B,$verdict1C,$verdict1D,$value2A,$value2B,$value2C,$value2D,$verdict2A,$verdict2B,$verdict2C,$verdict2D,$verdictFinal, $result, $MF);
if (($meanS_start)&&($meanS_stop)&& ($quality>2)){
  my $cut=substr($aaseq,$meanS_stop,(length($aaseq)-$meanS_stop+1));
  ##($header,$valueA,$valueB,$valueC,$valueD,$verdictA,$verdictB,$verdictC,$verdictD,$verdictFinal,$result) = &plasmoap($id,$cut);

  ($header,$value1A,$value1B,$value1C,$value1D,$verdict1A,$verdict1B,$verdict1C,$verdict1D,$value2A,$value2B,$value2C,$value2D,$verdict2A,$verdict2B,$verdict2C,$verdict2D,$verdictFinal, $result, $MF) = 
    &plasmoap($id,$cut);
} else {
  ##($header,$valueA,$valueB,$valueC,$valueD,$verdictA,$verdictB,$verdictC,$verdictD,$verdictFinal,$result) = &plasmoap($id,$aaseq);

  ($header,$value1A,$value1B,$value1C,$value1D,$verdict1A,$verdict1B,$verdict1C,$verdict1D,$value2A,$value2B,$value2C,$value2D,$verdict2A,$verdict2B,$verdict2C,$verdict2D,$verdictFinal, $result, $MF) =
    &plasmoap($id,$aaseq);
}

###
### make A signalp output
###

my $wholeout=join "", @result;
unlink "$tempdir$tempfile";


my $sumverdict=$MF.$verdict2A.$verdict1B.$verdict1C.$verdict2C;
my $sumpos = ($sumverdict =~ s/yes//gi);


#if ($verdictFinal=~m/\+/){
#	print "<h3><font color=red>The submitted peptide sequence seems to have an apicoplast-targeting sequence.</h3></font>";
#}else{
#	print "<h3><font color=red>The submitted peptide sequence does not have an apicoplast-targeting sequence.</font></h3>";
#	print "Note: The signal peptide has been removed for PlasmoAP analysis. <br><br>\n" if  (($meanS_start)&&($meanS_stop)&& ($quality>2));
#}

#print "</td></tr></table>";


my $explanation="
<hr><h4>Background:</h4>
PlasmoAP is a rules-based predictor for apicoplast-targeting peptides within <i>Plasmodium falciparum</i>.
Please read the relevant publication for details:<p>
<blockquote>Bernardo J. Foth, Stuart A. Ralph, Christopher J. Tonkin, Nicole S. Struck,  Martin Fraunholz, David S. Roos, Alan F. Cowman, Geoffrey I. McFadden (2003) Dissecting Apicoplast Targeting in the Malaria Parasite <i>Plasmodium falciparum</i>. Science. 299(5606).</blockquote></p><br> 
<u>PlasmoAP checks your sequence for:</u><br>
<ul>
<li> Number of acidic AAs in first 15 AAs (must be &lt;= 2 to pass the test)
<li> ratio of basic to acidic AAs in first 22 AAs (must be &gt;= 10/7 to pass the test)
<li >Presence of a 40 AA  stretch containing at least 9 K or N present in first 80 AAs ?
<li> Ratio of basic to acidic AAs in KN-enriched stretch (must be &gt;= 5/3 or &gt;= 10/9 for the two sets of rules, respectively).
<li> checks if the first charged amino acid is basic.
</ul><p>
Plots of the frequencies of basic and acidic amino acids are at the bottom of this page. A sliding window 13 amino acids in length is used to produce the plots.<br>
DnaK binding affinities are calculated employing the algorithm developed by S. Rudiger, L. Germeroth, J. Schneider-Mergener and B. Bukau (EMBO J. 16, 15
01, 1997).<br>Sites with values below -5 are generally considered to be good DnaK binding sites.";


my $spverdict;
if ($quality == 4){
  $spverdict="++";
} elsif ($quality == 3){
  $spverdict="+";
} elsif ($quality == 2) {
  $spverdict="0";
} else {
  $spverdict="-";
}

my $doesit;
if (($verdictFinal=~m/\+/) && ($spverdict=~m/\+/)){
  $doesit=1;
}else{
  $doesit=0;
}

my $output = <<EOHTML;
<table border=1>
<tr><td width=200 bgcolor="#FFFF00"><b>Criterion</b></td><td bgcolor="#FFFF00" ><b>Value</b></td><td bgcolor="#FFFF00" ><b>Decision</b></td></tr>

<tr><td width=200 bgcolor="#FFFFFF"><b>Signalpeptide</b></td><td align=center>$quality of 4 tests positive</td><td align=center bgcolor=FF00FF><b>$spverdict</b></td></tr>

<tr><td width=200 bgcolor="#FFFFFF"><b>apicoplast-targeting peptide</b></td><td align=center>$sumpos of 5 tests positive</td><td align=center bgcolor=FF00FF><b>$verdictFinal</b></td></tr>

<tr><td colspan=3 bgcolor="#F8F8F8">Ruleset 1</td></tr>

<tr><td width=200 bgcolor="#FFFFFF">Ratio acidic/basic residues in first 22 amino acids &lt;=0.7</td><td valign=top align=center>@{[sprintf("%.3f", $value1B)]}</td><td  valign=top align=center>$verdict1B</td></tr>

<tr><td width=200 bgcolor="#FFFFFF">Does a KN-enriched region exist (40 AA with min. 9 K or N) with a ratio acidic/basic  &lt;=0.9</td><td valign=top align=center>@{[sprintf("%.3f", $value1D)]}</td><td  valign=top align=center>$verdict1C</td></tr>

<tr><td colspan=3 bgcolor="#F8F8F8">Ruleset 2</td></tr>
<tr><td width=200 bgcolor="#FFFFFF">number of acidic residues in first 15 amino acids (&lt;=2)</td><td valign=top align=center>@{[sprintf("%3d", $value2A)]}</td><td valign=top align=center>$verdict2A</td></tr>


<tr><td width=200 bgcolor="#FFFFFF">Does a KN-enriched region exist (40 AA with min. 9 K or N) ? Ratio acidic/basic residues in this region &lt;0.6</td><td valign=top align=center>@{[sprintf("%.3f", $value2D)]}</td><td  valign=top align=center>$verdict2C</td></tr>


<tr><td width=200 bgcolor="#FFFFFF">Is the first charged amino acid basic ?</td><td valign=top align=center>&nbsp;</td><td  valign=top align=center>$MF</td></tr>

</table>
EOHTML

print "<h4>Complete PlasmoAP output for $id :</h4>";
if ($doesit){
  print "<h4><font color=magenta>The submitted sequence CONTAINS an apicoplast targeting signal</font></h4>";
} else {
  print "<h4><font color=magenta>The submitted sequence DOES NOT contain an apicoplast targeting signal</font></h4>";
}

print "$output\n<br>
<blockquote><u>Explanation of the output:</u><br>
The <font color=FF00FF>final decision</font> is indicated by \"++, +, 0 or -\", where apicoplast-localisation for a given sequence is considered
<pre>
  ++  very likely<br>
   +  likely<br>
   0  undecided<br>
   -  unlikely<br>
</pre></blockquote>\n\n";


print "$explanation<hr>\n\n\n";

## HYDROPHOB PLOT

#print "<h4><center>Hydrophobicity Plot</center></h4>\n\n";
#print "<img src=\"$wwwpngdir/$png\_hyd.png\">\n\n<br><br>\n";
#print "<B>Plot of DnaK binding sites:</B> Hydrophobicity plot of the input amino acid sequence. (generated with \"pepwindow\" from the EMBOSS package)<br><hr><br><br>";

### COMPOSITION PLOT

print "<h4><center>Plot of Amino Acid Composition</center></h4>\n\n";
print "<img src=\"$wwwpngdir/$png\_comp.png\">\n\n<br>\n";
print "<B>Comparison of contents of acidic and basic amino acids:</B> The second portion of apicoplast-transit sequences have a high ratio of basic/acidic residues. (<font color=green>DE: acidic</font>, <font color=red>KHR: basic</font>, and <font color=navy>NK: Lysine+Asparagine</font>).<br><hr><br><br>";


### DnaK Plot
print "<h4><center>Plot of Potential DnaK-binding Sites</center></h4>\n\n";
print "<img src=\"$wwwpngdir/$png.png\">\n<br>\n";
print "<B>Plot of DnaK binding sites:</B> Positions with values below -5 are considered to be good DnaK binding sites. (S. Rudiger, L. Germeroth, J. Schneider-Mergener and B. Bukau (EMBO J. 16, 1501, 1997).<br><hr><br><br>";



print "<hr>";
print "<h3>Here is the according SignalP output:</h3>";
print "<center>";
print "<table width=640><tr><td bgcolor=FFFFFF>\n";
print "<pre>$wholeout</pre>";
print "</td></tr></table>\n</center>\n";

print "</td></tr></table></center>\n";



exit(0);


################################################

sub parsesgp {
  my @outcome   = @_;
  my ($maxC_position,$maxC_value,$maxC_cutoff,$maxC_conclusion,$maxY_position,$maxY_value,$maxY_cutoff,$maxY_conclusion,$maxS_position,$maxS_value,$maxS_cutoff,$maxS_conclusion,$meanS_start,$meanS_stop,$meanS_value,$meanS_cutoff,$meanS_conclusion, $meanS_position);
  my $quality=0;

  foreach my $line (@outcome){
      $line=~s/\n$//;
      if ($line=~/max\..C/){
          $line=~s/\s+$&\s+//;
          ($maxC_position, $maxC_value,  $maxC_cutoff,  $maxC_conclusion)= (split /\s+/,$line);
          if ($line=~/YES/){$quality++};
          next;
      }
      if ($line=~/max\..Y/){
          $line=~s/\s+$&\s+//;
          ($maxY_position, $maxY_value,  $maxY_cutoff,  $maxY_conclusion)= (split /\s+/,$line);
          if ($line=~/YES/){$quality++};
          next;
      }
      if ($line=~/max\..S/){
          $line=~s/\s+$&\s+//;
          ($maxS_position, $maxS_value,  $maxS_cutoff,  $maxS_conclusion)= (split /\s+/,$line);
          if ($line=~/YES/){$quality++};
          next;
      }
      if ($line=~/mean.S/){
          $line=~s/\s+$&\s+//;
          ($meanS_position, $meanS_value,  $meanS_cutoff,  $meanS_conclusion)= split(/\s+/,$line);
          ($meanS_start,$meanS_stop)= (split /-/,$meanS_position);
          if ($line=~/YES/){$quality++};
          next;
      }
  }

return ($maxC_position,$maxC_value,$maxC_cutoff,$maxC_conclusion,$maxY_position,$maxY_value,$maxY_cutoff,$maxY_conclusion,$maxS_position,$maxS_value,$maxS_cutoff,$maxS_conclusion,$meanS_start,$meanS_stop,$meanS_value,$meanS_cutoff,$meanS_conclusion,$quality);

} # end if signalp



######################################################################
sub plasmoap{
    
#
# PlasmoAP version 1.1  - with 4 different possible outcomes!
# 11 September 2002
# Bernardo Foth
    
    my $id=shift;
    my $sequence=shift;

    my $seqNumber = 0 ;
    
    my $RESULT;
    my $temp;
    my $play;
    my $playSub;
    
    my $yes = "yes";
    my $no = "no";
    
    my $value1A;
    my $value1B;
    my $value1C;
    my $value1D;    
    my $verdict1A;
    my $verdict1B;
    my $verdict1C;


    my $value2A;
    my $value2B;
    my $value2C;
    my $value2D;    
    my $verdict2A;
    my $verdict2B;
    my $verdict2C;

    my $verdictFinal;
    
    my $finalScore = 0;
    
############################################################
########################  Parameters for CHECK1 ############
############################################################
    
    my $length1B = 22;
    my $cutoff1B = 0.7;
    
    my $length1C = 40;
    my $minimumKN1 = 9;
    my $cutoff1C = 40;
    
    my $cutoff1D = 0.9; 
    
############### Analysis B CHECK1 #######################
#### Positive nettocharge
#########################################################

    $verdict1B = $no; 
    $play = substr($sequence, 0, $length1B);

    $play =~ tr/DE/@/;
    my $acid1B  = $play =~ s/@/1/g;
    #my $acid1B = count ($play,"@");

    print STDERR "CHECK1B: ACIDIC: $acid1B\n" if $debug;

    $play =~ tr/KRH/@/;
    my $basic1B = $play =~ s/@/2/g;
    #my $basic1B = count ($play,"@");



    print STDERR "CHECK1B: BASIC: $basic1B\n" if $debug;

    if ($basic1B > 0) {
	$value1B = $acid1B/$basic1B;	

	if ($value1B <= $cutoff1B) {
	    $verdict1B = $yes;
	}else { 
	    $verdict1B = $no; 
	}
    }else { 
	$value1B = "infinite";
	$verdict1B = $no;
    }

    print STDERR "CHECK1B: RATIO: $value1B\n" if $debug;

    $verdict1C = $no; 
    $value1D="n/d";

    if ($verdict1B eq $yes) {
    
	############### Analysis C CHECK1 #######################
	## KN enriched positively charged sequences
	########################################################
	#$verdict1C = $no; 
	$play = substr($sequence, 0, ($cutoff1C+$length1C+10)); #add another 10 AAs just to be safe
	$play =~ tr/KN/@/;
	print STDERR "CHECK1C $play\n" if $debug;

	my $shift = 0;
	my $enrichStart = -1;
	my $enrichEnd = -1;
	
	while ( ($shift < $cutoff1C) && ($enrichStart == -1)) {
	    $playSub = substr($play, $shift, $length1C);
	    #my $enrich1C = $playSub =~ s/@/@/g;
	    my $enrich1C = count($playSub, "@");

	    if ($enrich1C >= $minimumKN1) {
		$enrichStart = $shift;
		
		my $KNplay = substr($sequence, $enrichStart, $length1C);
		print STDERR "CHECK1C SUBSTR ($enrich1C KN, minimum $minimumKN1): $KNplay\n\n" if $debug;
		#$KNplay =~ tr/DE/@/;
		#my $KNacid1C = $KNplay =~ s/@/1/g;
		my  $KNacid1C = count($KNplay, "D", "E");

		print STDERR "CHECK1C: ACIDIC: $KNacid1C\n" if $debug;

		#$play =~ tr/KRH/@/;
		#my $KNbasic1C = $KNplay =~ s/@/2/g;
		my $KNbasic1C = count($KNplay, "K", "H", "R");

		print STDERR "CHECK1C: BASIC: $KNbasic1C\n" if $debug;
		print STDERR "CHECK1C: cutoff ratio acid/basi: $cutoff1D\n" if $debug;
		

		if ($KNbasic1C > 0) {
		    $value1D = $KNacid1C/$KNbasic1C;	

		    if  ($value1D <= $cutoff1D)  {

			#print STDERR "AM HERERERERRERRERE.............................";
			$verdict1C = $yes;
		    }else {
			$verdict1C = $no;
		    }
		}elsif($KNacid1C == 0 && $KNbasic1C == 0 ) {
		    $verdict1C = $yes;
		    $value1D="infinite";
		}else{ 
		    $verdict1C = $no;
		    $value1D="infinite";
		}
		print STDERR "CHECK1C: RATIO: $value1D\n" if $debug;
	    }
	    ++$shift;

	}
    }
    
############### Final Analysis Check1 #######################
    if (($verdict1B eq $yes) && ($verdict1C eq $yes) ) {
	$finalScore = $finalScore +2;
    }


##############################################################
###################  Parameters for CHECK2 ###################
##############################################################
    
    my $length2A = 15;
    my $cutoff2A = 2;
    
    my $length2C = 40;
    my $minimumKN2 = 9;
    my $cutoff2C = 40;
    
    my $cutoff2D = 0.6;
    
############### Analysis A CHECK2 #######################
### number of acidics in first 15 AA

    $verdict2A = $no;
    $play = substr($sequence, 0, $length2A);
    $play =~ tr/DE/@/;
    #my $value2A =$play =~ s/@/@/g;
    my $value2A = count($play, "@");

    if ($value2A <= $cutoff2A) {
	$verdict2A = $yes;
    } else { 
	$verdict2A = $no;
    }
    
    print STDERR "CHECK2A: valA $value2A, verA $verdict2A\n" if $debug;

    $value2D="n/d";
    $verdict2C = $no;
    if ($verdict2A eq $yes) {
	
	############### Analysis C CHECK2 #######################   
	### KNenriched region
	#$verdict2C = $no; 
	$play = substr($sequence, 0, ($cutoff2C+$length2C+10)); #add another 10 AAs just to be safe

	print STDERR "\n\nCount KN in:\n $play\n" if $debug;
	$play =~ tr/KN/@/;


	my $shift = 0;
	my $enrichStart = -1;
	my $enrichEnd = -1;
	

	
	while ( ($shift < $cutoff2C) && ($enrichStart == -1)) {
	    my $playSub = substr($play, $shift, $length2C);
	    #my $enrich2 = $playSub =~ s/@/@/g;
	    my $enrich2 = count ($playSub, "@");

	    print STDERR "CHECK2C: KN: $enrich2\n" if $debug;	    
	    if ($enrich2 >= $minimumKN2) {
		$enrichStart = $shift;
		
		my $KNplay = substr($sequence, $enrichStart, $length2C);
		
		#$KNplay =~ tr/DE/@/;
		#my $KNacid2C = $KNplay =~ s/@/1/g;
		my $KNacid2C = count ($KNplay, "D", "E");

		print STDERR "CHECK2C: ACIDIC: $KNacid2C\n" if $debug;


		#$KNplay =~ tr/KRH/@/;
		#my $KNbasic2C = $KNplay =~ s/@/2/g;
		my $KNbasic2C = count ($KNplay, "K", "H", "R");

		print STDERR "CHECK2C: Basic: $KNbasic2C\n" if $debug;


		if ($KNbasic2C > 0) {
		    $value2D = $KNacid2C/$KNbasic2C;	
		    if ($value2D <= $cutoff2D) {
			$verdict2C = $yes;
		    }else {
			$verdict2C = $no;
		    }
		}elsif($KNacid2C == 0 && $KNbasic2C == 0 ) {
		    $verdict2C = $yes;
		    $value2D="infinite";

		}else { 
		    $verdict2C = $no;
		    $value2D="infinite";
		}

		print STDERR "CHECK2C: RATIO: $value2D\n" if $debug;

	    }
	    ++$shift;
	}
    }
    
############### Final Analysis CHECK2 #######################
    if (($verdict2A eq $yes) && ($verdict2C eq $yes) ) {
	$finalScore = $finalScore +2;
    }
    
##############################################################		
########## CHECK3: add one extra point if first charged#######
########## AA is basic (ie not acidic)!                #######
##############################################################		
    my $MF;
    $play = $sequence;
    $play =~ tr/DEKRH/11222/;
    $play =~ s/[A-z]//g;
    if (substr($play, 0, 1) == 2) { 
	$finalScore++; 
	$MF="yes";
	#my $pat=$play=~m/^(\d)\1/;
	print STDERR "CHECK3: $play\n\n" if $debug;
    }    

		
    $RESULT="$finalScore";
    
    if ($finalScore == 5) {
	$finalScore = "++"; 
    }else{ 
	$finalScore =~ tr/01234/\-\-\-0\+/; 
    }
    
    
    print STDERR "\nHead: $header, v1a $value1A, v1b $value1B, v1c $value1C, v1d $value1D,\n j1a $verdict1A, j1b $verdict1B, j1c $verdict1C, j1d $verdict1D,\n v2a $value2A, v2b $value2B, v2c $value2C, v2d $value2D,\n j2a $verdict2A, j2b $verdict2B, j2c $verdict2C, j2d $verdict2D,\n finalscore $finalScore, RES $RESULT, $MF\n\n" if $debug;


    return ($header,$value1A,$value1B,$value1C,$value1D,$verdict1A,$verdict1B,$verdict1C,$verdict1D,
	    $value2A,$value2B,$value2C,$value2D,$verdict2A,$verdict2B,$verdict2C,$verdict2D,
	    $finalScore, $RESULT, $MF);

} #end sub
###########################################




###########################################
##
##
sub count{
  my $seq=shift;
  #my $tocount=shift;
  my @tocount=@_;
  my $sum=0;
  foreach my $AA (@tocount){
    #print "counting $AA\n";
    my $count=0;
    while ($seq=~m/$AA/ig){
      $count++;
    }
    $sum+=$count;
  }
  return $sum;
}
##
##
##########################################



##########################################
## wraps html text into chunks of 60
##
sub wrap {
my $txt=shift;
my $returntxt;
my $line=shift;
my $count=0;
my $test;

while($test=substr($txt,$count,$line)){
  $returntxt.="$test\n";
  $count+=$line;
  }

return $returntxt;
} #end sub
##
##
###########################################


sub htmlhead {
    # Subroutine html_header sends to Standard Output the necessary
    # material to form an HTML header for the document to be
    # returned, the single argument is the TITLE field.
    my $title = shift;
    my $server=lc($ENV{SERVER_NAME});


    print <<"EOF";
Content-type: text/html

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <title>PlasmoDB - $title </title>
  </head>

        <body>
        <table WIDTH='640' align='center' cellpadding=2 cellspacing=0>
        <tr>
        <td ALIGN=CENTER align=top colspan=8><b><font face="Arial,Helvetica" size=+3>&nbsp;PlasmoDB - $title &nbsp;</font></b></td>
        </tr>
        </table>

        <hr align='center' width=640>
 
        <!-- contents -->
 
EOF


}

