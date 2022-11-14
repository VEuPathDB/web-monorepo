package GBrowse::PopupAndLinks;

use strict;

use GBrowse::Configuration;
use XML::Simple;
use Data::Dumper;
my %MS_EXTDB_NAME_MAP;


#--------------------------------------------------------------------------------
#  Methods for Links
#--------------------------------------------------------------------------------

# ToxoDB only
sub tigrAssemblyLink {
  my $f = shift;
  my $name = $f->name;
# my ($species) =  ($f->get_tag_values("TGISpecies") eq 'TgGI') ?  't_gondii' : 'unk';       
# first, this conditional expression is not ok as it makes the subroutine toxo specific.
# this has been commented out because, the only track that uses this in toxo has fallen out of use.
  my ($species) =  $f->get_tag_values("TGISpecies");     
  
  if ($name =~ m/^TC/) {
    "http://compbio.dfci.harvard.edu/tgi/cgi-bin/tgi/tc_report.pl?gudb=$species&tc=$name";
  } elsif ($name =~ m/^(NP|HT|ET)/) {
    "http://compbio.dfci.harvard.edu/tgi/cgi-bin/tgi/egad_report.pl?id=$name";
  } else {
    "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=nucleotide&cmd=search&term=$name";
    #                   "http://compbio.dfci.harvard.edu/tgi/cgi-bin/tgi/est_report.pl?gudb=$species&EST=$name";
  }
}

sub synSpanLink {
  my $f = shift;
  my $name = $f->name;
  return "/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&primary_key=$name"
}

sub assemblyLink { 
  my $f = shift;
  my $name = $f->name;
  my $link = "/a/showRecord.do?name=AssemblyRecordClasses.AssemblyRecordClass&project_id=&primary_key=$name";
  return $link;
}

sub estLink { 
  my $f = shift;
  my $name = $f->name;
  my $link = "/a/showRecord.do?name=EstRecordClasses.EstRecordClass&primary_key=$name";
  return $link;
}

sub orfLink {
  my $f = shift;
  my $name = $f->name;
  my $link = "/a/showRecord.do?name=OrfRecordClasses.OrfRecordClass&primary_key=$name";
  return $link;
}

sub ArrayElementLink {
#  my $f = shift;
#  my $name = $f->name;
#  my $link = "/a/showRecord.do?name=ArrayElementRecordClasses.ArrayElementRecordClass&primary_key=$name";
  return "javascript:void(0)";
}

sub snpLink {
  my $f = shift;
  my $name = $f->name;
  my ($type) = $f->get_tag_values('type');
  my $link = "/a/app/record/$type/$name";
  return $link;
}

#--------------------------------------------------------------------------------
#  Methods for Titles (Popups)
#--------------------------------------------------------------------------------


sub gffTssChabbert {
  my $f = shift;

  my @data;

  my $gene;

  my ($assignedFeat) = $f->get_tag_values('AssignedFeat');
  my ($assignedFeature) = $f->get_tag_values('AssignedFeature');

  if($assignedFeat eq "NewTranscript" || $assignedFeature eq "NewTranscript") {
    push @data, [ 'Assigned Feature'=> "New Transcript"];
  }
  else {
    my $gene = defined $assignedFeature ? $assignedFeature : $assignedFeat;

    my  $link = "<a href='/a/app/record/gene/$gene'>$gene</a>";
    push @data, [ 'Assigned Feature'=> $link];
  }

  hover($f, \@data);
}


sub gffKirkland {
  my $f = shift;

  my @data;
  my $score = $f->score;
  my ($target) = $f->get_tag_values('Target');
  $target =~s/Motif:(.*),\d*,\d*/$1/;

  push @data, [ 'Motif'=> $target];
  push @data, [ 'Score'=> $score];

  hover($f,\@data);
}


sub syntenyTitle {
  my $f = shift;
  my ($syntype) = $f->get_tag_values('SynType');
  if($syntype eq 'gene') {
    &synGeneTitle($f);
  } elsif($syntype eq 'span') {
    &synSpanTitle($f);
  } else {
    my $p = $f->parent;
    if ($p->type =~ /gene/i) {
      &synGeneTitle($p);
    }
  }
}
  
sub synGeneTitle {
  my $f = shift;
  
  my $projectId = $ENV{PROJECT_ID};
  my $sourceId = $f->name;
  my ($taxon) = $f->get_tag_values("Taxon");
  my ($desc) = $f->get_tag_values("Note");

  my ($soTerm) = $f->get_tag_values("SOTerm");
  my ($orthomclName) = $f->get_tag_values("orthomcl_name");
  my ($isPseudo) = $f->get_tag_values("IsPseudo");
  $soTerm =~ s/\_/ /g;
  $soTerm =~ s/\b(\w)/\U$1/g;
  $soTerm = ($isPseudo ? "Pseudogenic " : "") . $soTerm;

  my ($seqId) = $f->get_tag_values("Contig");
  my ($start) = $f->get_tag_values("Start");
  my ($end) = $f->get_tag_values("End");
  my $window = 500; # width on either side of gene
  my $linkStart = $start - $window;
  my $linkStop = $end + $window;
  my $gbLinkParams = "start=$linkStart;stop=$linkStop;ref=$seqId";
  my $baseRecordUrl = $ENV{REQUEST_SCHEME} . '://' . $ENV{HTTP_HOST} . $ENV{CONTEXT_PATH};

  my ($trunc) = $f->get_tag_values("Truncated");
  my $location = "$seqId: $start - $end".($trunc ? " (truncated by syntenic region to $trunc)" : "");
  
  return qq{javascript:escape(syn_gene_title(this,'$projectId','$sourceId','$taxon','$soTerm','$desc','$location','$gbLinkParams', '$orthomclName','$baseRecordUrl'))};
}

sub synSpanTitle {
  my ($f) = @_;
  my $name = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my $strand = $f->strand == 1? "no" : "yes";
  my ($refStart) = $f->get_tag_values("RefStart");
  my ($refEnd) = $f->get_tag_values("RefEnd");
  my ($refLength) = $refEnd - $refStart;
  my ($synStart) = $f->get_tag_values("SynStart");
  my ($synEnd) = $f->get_tag_values("SynEnd");
  my ($synLength) = $synEnd - $synStart;
  my ($contigLength) = $f->get_tag_values("ContigLength");
  my ($refContigLength) = $f->get_tag_values("RefContigLength");
  my ($contigSourceId) = $f->get_tag_values("Contig");
  my ($chromosome) = $f->get_tag_values("Chromosome");
  my ($taxon) = $f->get_tag_values("Taxon");
  my ($type) = $f->get_tag_values("Type");
  my ($scale) = $f->get_tag_values("Scale");
  $scale = sprintf("%.2f", $scale);
  my $boolNotRef = ( $chr eq $contigSourceId ) ? 0 : 1;

  my @data;
  if (($type !~ /gap/i) && ($boolNotRef)){
    push @data, [ 'Chromosome: '=> "$chromosome" ] if ($chromosome);
    push @data, [ 'Species: '=> "$taxon" ];
    push @data, [ 'Syntenic Contig: ' => "$contigSourceId" ];
    push @data, [ 'Ref location: ' => "$refStart&nbsp;-&nbsp;$refEnd ($refLength&nbsp;bp)" ];
    push @data, [ 'Syn location: ' => "$synStart&nbsp;-&nbsp;$synEnd ($synLength&nbsp;bp)" ];
    push @data, [ 'Reversed: ' => "$strand" ];
    push @data, [ 'Total Syn Contig Length: ' => "$contigLength" ];
    push @data, [ 'Total Ref Contig Length: ' => "$refContigLength" ];
    push @data, [ 'Scale: ' => "$scale" ];
    hover($f, \@data);
  } elsif ($type !~ /gap/i) {
    push @data, [ 'Chromosome: '=> "$chromosome" ] if ($chromosome);
    push @data, [ 'Species: '=> "$taxon" ];
    push @data, [ 'Contig: ' => "$contigSourceId" ];
    push @data, [ 'Location: ' => "$refStart&nbsp;-&nbsp;$refEnd ($refLength&nbsp;bp)" ];
    push @data, [ 'Total Contig Length: ' => "$refContigLength" ];

  } else { 
    my @gaps = $f->sub_SeqFeature();
    my $count = 0;
    my %seen;
    foreach (@gaps) {
      my $gstart = int($_->start);
      next if(exists $seen{$gstart});
      $seen{$gstart} = 1;
      $count++;
      my $gstop  = int($_->stop);
      my $gsize  = $gstop - $gstart + 1;
      push @data, [ "Gap $count: $gstart..$gstop"  => $gsize ]; 
    }
  }

#  hover( ($type =~ /gap/i) ? 'All gaps in region' : 'Scaffold', \@data);
  hover($f, \@data);
}

sub snpTitleQuick {
  my $f = shift;
  my ($gene) = $f->get_tag_values("Gene"); 
  my ($isCoding) = $f->get_tag_values("IsCoding"); 
  my ($nonSyn) = $f->get_tag_values("NonSyn"); 
  my ($nonsense) = $f->get_tag_values("Nonsense"); 
  my ($rend) = $f->get_tag_values("rend"); 
  my ($base_start) = $f->get_tag_values("base_start");
  my $zoom_level = $rend - $base_start; 
  my ($position_in_CDS) = $f->get_tag_values("position_in_CDS");
  my ($position_in_protein) = $f->get_tag_values("position_in_protein");
  my ($reference_strain) = $f->get_tag_values("reference_strain");
  my ($reference_aa) = $f->get_tag_values("reference_aa");
  my ($gene_strand) = $f->get_tag_values("gene_strand");
  my ($reference_na) = $f->get_tag_values("reference_na");
  my ($major_allele) = $f->get_tag_values("major_allele");
  my ($minor_allele) = $f->get_tag_values("minor_allele");
  my ($major_allele_count) = $f->get_tag_values("major_allele_count");
  my ($minor_allele_count) = $f->get_tag_values("minor_allele_count");
  my ($major_allele_freq) = $f->get_tag_values("major_allele_freq");
  my ($minor_allele_freq) = $f->get_tag_values("minor_allele_freq");
  my ($major_product) = $f->get_tag_values("major_product");
  my ($minor_product) = $f->get_tag_values("minor_product");
  my ($source_id) = $f->get_tag_values("source_id");
  my ($link_type) = $f->get_tag_values("type");

  my $start = $f->start();
  my $end = $f->end();
  my %revArray = ( 'A' => 'T', 'C' => 'G', 'T' => 'A', 'G' => 'C' );

  my $link = "<a href='/a/app/record/$link_type/$source_id'>$source_id</a>";
         
  my $type = 'Non-coding';
  my  $refNA = $gene_strand == -1 ? $revArray{$reference_na} : $reference_na;

  my $num_strains = $major_allele_count + $minor_allele_count;

  my $testNA = $reference_na;

  my $refAAString = ''; 
  if ($isCoding == 1 || $isCoding =~ /yes/i) {
     $type = "Coding (".($nonsense ? "nonsense)" : $nonSyn ? "non-synonymous)" : "synonymous)");
     $refAAString = "&nbsp;&nbsp;&nbsp;&nbsp;AA=$reference_aa";
     $minor_product = $nonsense || $nonSyn ? $minor_product : $major_product;
   }else{
     $minor_product = '&nbsp';
   }


  my @data;
  push(@data, ['SNP' => $link]);
  push(@data, ['Location' => $end]);
  push(@data, ['Gene' => $gene]) if $gene;

  if ($isCoding == 1 || $isCoding =~ /yes/i) {
    push(@data, ['Position&nbsp;in&nbsp;CDS' => $position_in_CDS]);
    push(@data, ['Position&nbsp;in&nbsp;protein' => $position_in_protein]);
  }

  push(@data, ['Type' => $type]);
  push(@data, ['Number of strains' => $num_strains]);
  push(@data, ['' => 'NA&nbsp;&nbsp;&nbsp;'.($isCoding ? 'AA&nbsp;&nbsp;&nbsp;(frequency)' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(frequency)')]);
  push(@data, ["$reference_strain"."&nbsp;(reference)" => "&nbsp;$refNA&nbsp;&nbsp;&nbsp;&nbsp;&nbsp$reference_aa"]);

  
  $major_allele = $revArray{$major_allele} if($gene_strand == -1);
  $minor_allele = $revArray{$minor_allele} if($gene_strand == -1);

  push(@data, ['Major Allele' => "&nbsp;$major_allele&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$major_product&nbsp;&nbsp;&nbsp;&nbsp;($major_allele_freq)"]);
  push(@data, ['Minor Allele' => "&nbsp;$minor_allele&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$minor_product&nbsp;&nbsp;&nbsp;&nbsp;($minor_allele_freq)"]);

  hover($f, \@data);
}

sub snpTitleFromMatchToReference {
             my $f = shift;
             my ($isCoding) = $f->get_tag_values("IsCoding");
             my ($refStrain) = $f->get_tag_values("reference_strain");
             my ($gene) = $f->get_tag_values("Gene");
             my ($refNA) = $f->get_tag_values("reference_na");
             my ($source_id) = $f->get_tag_values("source_id");
             my ($rend) = $f->get_tag_values("rend");
             my ($base_start) = $f->get_tag_values("base_start");
             my $zoom_level = $rend - $base_start;
             my $variants = $f->bulkAttributes();
             my $type = $isCoding? 'Coding' : 'Non-Coding';
             if ($zoom_level <= 50000) {
               my @data;
               push @data, [ 'Location:'  => $f->start ];
               if ($gene) {
                  push @data, [ 'Gene:'  => $gene ];
               }
               push @data, ["Sequence:" => $refNA];
               push @data, ["Strains:" => ""];
               push @data, ["$refStrain" => "Reference"];
               foreach my $variant (@$variants) {
                 my $strain = $variant->{STRAIN};
                 next if $strain eq $refStrain;
                 my $likeRef = $variant->{MATCHES_REFERENCE};
                 my $info = $likeRef ? "matches reference" : "polymorphic";
                 push @data, [ "$strain" => $info ];
               }
               hover( $f, \@data) if $refStrain;
             } else {
                return $gene? "In gene $gene" : "Non-coding";
             }

} 


 sub cghTitle {
   my $f = shift;
   my @data;
   my ($info) = $f->get_tag_values("info");
   my ($probes) = $f->get_tag_values("probes");
   my @strainScores = split(/\|/,$info);

   push @data, [ "Number of Probes =" => $probes ];
   push @data, ['Strains & DTU, score (pos=amp,neg=del)' ];   

   foreach my $strainScr (@strainScores) {
     $strainScr =~ s/\:/\: /g;
     my @score = split(/,/, $strainScr);
     push @data, [ $score[0] => $score[1]];
   }
   return hover($f, \@data); 
 }


 sub chipTitle {
   my $f = shift;
   my @data;
   my $name = $f->name;
   my ($location) = $f->start;
   my ($majorAllele) = $f->get_tag_values("MajorAllele");
   my ($majorAlleleFreq) = $f->get_tag_values("MajorAlleleFreq");
   my ($minorAlleleFreq) = $f->get_tag_values("MinorAlleleFreq");
   my ($snpid) = $f->get_tag_values("SnpId");
   my $link = qq(<a href="/a/showRecord.do?name=SnpChipRecordClasses.SnpChipRecordClass&primary_key=$name">$name</a>);
   push @data, [ 'Name:'  => $link ];
   push @data, [ 'Location:' => $location ];
   push @data, [ 'Major Allele:'  => $majorAllele ];
   push @data, [ 'Major Allele Frequency:'  => $majorAlleleFreq ];
   push @data, [ 'Minor Allele Frequency:'  => $minorAlleleFreq ];
   return hover($f, \@data); 
 }


sub peakTitle {
    my $f = shift;
    my @data;
    my ($expt) = $f->source_tag();
    $expt =~ s/_/ /g;
    my $start = $f->start;
    my $end = $f->end;
    my $score = $f->score;
    push @data, ['Experiment:' => $expt];
    push @data, ['Start:' => $start];
    push @data, ['End:' => $end];
    push @data, ['Score:' => $score];
    my @tags = $f->get_all_tags();

    my $ontologyTermToDisplayName = {'Antibody' => 'Antibody', 
                                     'Parasite genotype' => 'Genotype', 
                                     'Compound' => 'Treatment',
                                     'Replicate' => 'Replicate',
                                     'Parasite lifecycle stage' => 'Lifecycle Stage',
                                     'Parasite strain'   => 'Strain'};

    foreach my $tag (@tags) {
        if (exists $ontologyTermToDisplayName->{$tag}) {
            my ($value) = $f->get_tag_values($tag);
            push @data, ["$ontologyTermToDisplayName->{$tag}:" => $value];
        }
    }
    hover($f, \@data);
}


sub peakTitleChipSeq {
    my $f = shift;
    my @data;
    my ($expt) = $f->source_tag();
    $expt =~ s/_/ /g;
    my $start = $f->start;
    my $end = $f->end;
    push @data, ['Experiment:' => $expt];
    push @data, ['Start:' => $start];
    push @data, ['End:' => $end];
    my @tags = $f->get_all_tags();

    my $ontologyTermToDisplayName = {'Antibody' => 'Antibody', 
                                     'Parasite genotype' => 'Genotype', 
                                     'Compound' => 'Treatment',
                                     'Replicate' => 'Replicate',
                                     'Parasite lifecycle stage' => 'Lifecycle Stage',
                                     'Parasite strain'   => 'Strain',
                                     'score'    => 'Score',
                                     'tag_count' => 'Normalised Tag Count',
                                     'fold_change' => 'Fold Change',
                                     'p_value' => 'P Value'};

    foreach my $tag (@tags) {
        if (exists $ontologyTermToDisplayName->{$tag}) {
            my ($value) = $f->get_tag_values($tag);
            push @data, ["$ontologyTermToDisplayName->{$tag}:" => $value];
        }
    }
    hover($f, \@data);
}

sub altPeakTitle {
  my $f = shift;
  my ($score) = $f->score;
  my $start = $f->start;
  my $end = $f->end;
  my @data;
  push @data, [ 'Score:' => $score ];
  push @data, [ 'Start Location:' => $start ];
  push @data, [ 'End Location:' => $end ];
  hover ($f, \@data);
}

sub geneLink {
  my $f = shift;
  my $name = $f->name;
  return "/gene/$name";
}

sub geneGbrowseLink {
  my $f = shift;
  my $projectId = $ENV{PROJECT_ID};
  $projectId =~ tr/A-Z/a-z/;
  my $window = 500; # width on either side of gene
  my $linkStart = ($f->start) - $window;
  my $linkStop= ($f->stop) + $window;
  my ($seqId) = $f->get_tag_values("Contig");

  return "../../../../cgi-bin/gbrowse/$projectId/?start=$linkStart;stop=$linkStop;ref=$seqId";
}

sub geneTitleGB2 {
  my $f = shift;

  my $projectId = $ENV{PROJECT_ID};
  my $sourceId = $f->name;
  my $chr = $f->seq_id;

#  my $loc = $f->location->to_FTstring;
#  $loc =~ s/(\d+\.\.)/<br \/>&nbsp;&nbsp;$1/g;

  my @cdss = $f->sub_SeqFeature("CDS");
  my $loc = '';
  foreach (@cdss) {
    next if $_->type !~ /cds/i;
    $loc .= $_->location->to_FTstring. "<br />";
  }

  my ($gene_id) = $f->get_tag_values("geneId");
  my ($soTerm) = $f->get_tag_values("soTerm");
  my ($isPseudo) = $f->get_tag_values("isPseudo");
  my ($aaSeqId) = $f->get_tag_values("aaSeqId");

  # real OrthoMCL group identifiers begin "OG<number>_"
  my ($orthomclName) = $f->get_tag_values("orthomcl_name");
  $orthomclName = ""
    unless $orthomclName =~ /^OG\d*_/;

  $soTerm =~ s/\_/ /g;
  $soTerm =~ s/\b(\w)/\U$1/g;
  $soTerm .= " (pseudogene)" if $isPseudo == '1';

  my ($product) = $f->get_tag_values("product") ? $f->get_tag_values("product") : $f->get_tag_values("description");
  my ($taxon) = $f->get_tag_values("taxon");

  my @utrs = $f->sub_SeqFeature("UTR");
  my $utr = '';
  foreach (@utrs) {
    next if $_->type !~ /utr/i;
    $utr .= $_->location->to_FTstring. "<br />";
  }

  my $window = 500; # width on either side of gene
  my $linkStart = ($f->start) - $window;
  my $linkStop= ($f->stop) + $window;
  my ($seqId) = $f->get_tag_values("Contig");
  my $gbLinkParams = "start=$linkStart;stop=$linkStop;ref=$seqId";

  my $baseUrl = $ENV{REQUEST_SCHEME} . '://' . $ENV{HTTP_HOST};
  my $baseRecordUrl = $ENV{REQUEST_SCHEME} . '://' . $ENV{HTTP_HOST} . $ENV{CONTEXT_PATH};

  return qq{javascript:escape(gene_title(this,'$projectId','$sourceId','$chr','$loc','$soTerm','$product','$taxon','$utr','$gbLinkParams', '$orthomclName','$gene_id','$baseUrl','$baseRecordUrl','$aaSeqId'))};
}

sub geneTitleGff {
  my $f = shift;

  my $projectId = $ENV{PROJECT_ID};
  my $sourceId = $f->name;
  my $chr = $f->seq_id;

#  my $loc = $f->location->to_FTstring;
#  $loc =~ s/(\d+\.\.)/<br \/>&nbsp;&nbsp;$1/g;

  my @cdss = $f->sub_SeqFeature("CDS");
  my $loc = '';
  foreach (@cdss) {
    next if $_->type !~ /cds/i;
    $loc .= $_->location->to_FTstring. "<br />";
  }

  my ($gene_id) = $f->get_tag_values("geneId");
  my ($soTerm) = $f->get_tag_values("soTerm");
  my ($isPseudo) = $f->get_tag_values("isPseudo");
  my ($aaSeqId) = $f->get_tag_values("aaSeqId");

  ## CRAIG samples and scores
  my ($samples) = $f->get_tag_values("Sample");
  $samples =~ s/,/\<br \/\>/g;  
  my ($scores) = $f->get_tag_values("Score");
  $scores =~ s/,/\<br \/\>/g;  
  my ($five_sample) = $f->get_tag_values("FiveUTR_Sample");
  $five_sample =~ s/,/\<br \/\>/g;  
  my ($five_utr) = $f->get_tag_values("FiveUTR");
  $five_utr =~ s/,/\<br \/\>/g;  
  my ($five_score) = $f->get_tag_values("FiveUTR_Score");
  $five_score =~ s/,/\<br \/\>/g;  
  my ($three_sample) = $f->get_tag_values("ThreeUTR_Sample");
  $three_sample =~ s/,/\<br \/\>/g;  
  my ($three_utr) = $f->get_tag_values("ThreeUTR");
  $three_utr =~ s/,/\<br \/\>/g;  
  my ($three_score) = $f->get_tag_values("ThreeUTR_Score");
  $three_score =~ s/,/\<br \/\>/g;  

  my ($totScore) = $f->get_tag_values("score");

  # real OrthoMCL group identifiers begin "OG<number>_"
  my ($orthomclName) = $f->get_tag_values("orthomcl_name");
  $orthomclName = ""
    unless $orthomclName =~ /^OG\d*_/;

  $soTerm =~ s/\_/ /g;
  $soTerm =~ s/\b(\w)/\U$1/g;
  $soTerm .= " (pseudogene)" if $isPseudo == '1';

  my ($product) = $f->get_tag_values("product") ? $f->get_tag_values("product") : $f->get_tag_values("description");
  my ($taxon) = $f->get_tag_values("taxon");

  my @utrs = $f->sub_SeqFeature("UTR");
  my $utr = '';
  foreach (@utrs) {
    next if $_->type !~ /utr/i;
    $utr .= $_->location->to_FTstring. "<br />";
  }

  my $window = 500; # width on either side of gene
  my $linkStart = ($f->start) - $window;
  my $linkStop= ($f->stop) + $window;
  my ($seqId) = $f->get_tag_values("Contig");
  my $gbLinkParams = "start=$linkStart;stop=$linkStop;ref=$seqId";

  my $baseUrl = $ENV{REQUEST_SCHEME} . '://' . $ENV{HTTP_HOST};
  my $baseRecordUrl = $ENV{REQUEST_SCHEME} . '://' . $ENV{HTTP_HOST} . $ENV{CONTEXT_PATH};

  return qq{javascript:escape(gene_title_gff(this,'$projectId','$sourceId','$chr','$loc','$soTerm','$product','$taxon','$utr','$gbLinkParams', '$orthomclName','$gene_id','$baseUrl','$baseRecordUrl','$aaSeqId','$samples','$scores','$totScore','$five_sample','$five_utr','$five_score','$three_sample','$three_utr','$three_score'))};
}


sub sequenceAlignmentTitle {
  my $f = shift;

  my $projectId = $ENV{PROJECT_ID};
  my $sourceId = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;

  $loc =~ s/(\d+\.\.)/<br \/>&nbsp;&nbsp;$1/g;

  my $downloadLink = "<a target='_blank' href='http://cryptodb.org/common/downloads/release-4.6/CparvumChr6/'>Download files</a>";
  my $mappingLink  = "<a target='_blank' href='/a/communityDownload.do?fname=chr6OrthoMapping.txt'>Ortholog Mapping file</a>";


  my @data;
  push(@data, ['ID:'       => $sourceId]);
  push(@data, ['Location:' => $loc]);
  push @data, ['Link:'     => $downloadLink ];
  push @data, ['Link:'     => $mappingLink ];

  return hover($f,\@data);

}

sub sequenceTitle {
  my $f = shift;
  my $projectId = $ENV{PROJECT_ID};
  my $sourceId = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;

  $loc =~ s/(\d+\.\.)/<br \/>&nbsp;&nbsp;$1/g;

  my @data;
  push(@data, ['ID:'       => $sourceId]);
  push(@data, ['Location:' => $loc]);

  return hover($f,\@data);

}

sub spliceSiteCuratedTitle {
  my $f = shift;
  my $id = $f->name;  
  my $loc = $f->start;
#  my ($sasNum) = $f->get_tag_values('count'); # commenting, as value is always null!
  my ($utr_len) = $f->get_tag_values('utr_length');
  my ($gene_id) = $f->get_tag_values('gene_id');
  my ($sample) = $f->get_tag_values('sample');
  my $sampleName = $sample eq 'curated_long_splice' ? 'Splice Leader Site' : 'Polyadenylation Site';
  my @data;
  push(@data, [$sampleName => $id]);
  push(@data, ['Location:' => $loc]);
  push(@data, ['Gene:' => $gene_id]);
  push(@data, ['UTR length:' => $utr_len]) if ($utr_len);
#  push(@data, ['Sequence count:' => $sasNum]);
  return hover($f,\@data);
}

sub spliceSiteAlignTitle {
  my $f = shift;
  my $seq = $f->name;  ##currently using the name to hold sequence
  my $loc = $f->start;
  my ($seqNum) = $f->get_tag_values('count');
  my ($genMatches) = $f->get_tag_values('genome_matches');
  my ($sample) = $f->get_tag_values('sample');
  my @data;
  push(@data, ['Location:' => $loc]);
  push(@data, ['Longest Sequence:' => $seq]);
  push(@data, ['Number of Sequences:' => $seqNum]);
  push(@data, ['Genome Matches:' => $genMatches]);
  return hover($f,\@data);
}

sub spliceSiteTitle {
  my $f = shift;

  my $loc = $f->start;
  my ($sample_name) = $f->get_tag_values('sample_name');
  if ($sample_name eq 'L. infantum procyclic promastigotes SL - NSR') {
    $sample_name = 'L. donovani procyclic promastigotes SL - NSR';
  }
  my ($ctpm) = $f->get_tag_values('count_per_mill');
  my ($isUniq) = $f->get_tag_values('is_unique');
  my ($uniq) = ($isUniq == 1)? "yes" : "no";
  my ($mismatch) = $f->get_tag_values('avg_mismatches');
  my ($gene) = $f->get_tag_values('gene_id');
  my ($utr_len) = $f->get_tag_values('utr_length');
  $utr_len = ($utr_len < 0)? "N/A (within CDS)": $utr_len;
  my $name = $f->name;

  my @data;
  push(@data, ['Name:' => $name]);
  push(@data, ['Location:' => $loc]);
  push(@data, ['Sample:' => $sample_name]);
  push(@data, ['Count per million:' => $ctpm]);
  push(@data, ['Unique Alignment:' => $uniq]);
  push(@data, ['Gene ID:' => $gene]) if ($gene);
  push(@data, ['UTR Length:' => $utr_len]) if ($gene);
  push(@data, ['Avg Mismatches:' => $mismatch]);
  return hover($f,\@data);
}

sub spliceSiteTitleUnified {
  my ($f) = @_;
  my $loc = $f->start;
  my ($sample_name) = $f->get_tag_values('sample_name');
  my ($ctpm) = $f->get_tag_values('count_per_mill');
  my ($isUniq) = $f->get_tag_values('is_unique');
  my ($mismatch) = $f->get_tag_values('avg_mismatches');
  my ($gene) = $f->get_tag_values('gene_id');
  my ($utr_len) = $f->get_tag_values('utr_length');
  $utr_len = ($utr_len eq '') ? "N/A (within CDS)" : $utr_len;
  my $name = $f->name;

  # sum over count_per_mill values for each sample
  my $sum = eval join '+', split /,/, $ctpm;

  my @sample_arr = split /,/, $sample_name;
  my @ctpm_arr  = split /,/, $ctpm;
  my @uniq_arr  = split /,/, $isUniq;
  my @mismatch_arr  = split /,/, $mismatch;

  my $note = "The overall count is the sum of the count per million for each sample.";
  my @data;
  push @data, [ 'Location:'  => "$loc"];
  push(@data, ['Gene ID:' => $gene]) if ($gene);
  push(@data, ['UTR Length:' => $utr_len]) if ($gene) && ($utr_len);
  push @data, [ 'Count:'     => $sum ];
  push @data, [ 'Note:'     => $note ];

  my $count = 0;
  my $html = "<table><tr><th>Sample</th><th>Count per million</th></tr>";
  foreach my $exp (@sample_arr) {
    my $sample = $sample_arr[$count];
    my $ctpm = $ctpm_arr[$count];
    $html .= "<tr><td>$sample</td><td>$ctpm</td></tr>";
    $count++;
  }
  $html .= "</table>";
  push @data, [ '' => $html ];
  hover($f, \@data); 
}

sub polyASiteAlignTitle {
  my $f = shift;
  my $seq = $f->name;  ##currently using the name to hold sequence
  my $loc = $f->start;
  my ($seqNum) = $f->get_tag_values('count');
  my ($genMatches) = $f->get_tag_values('genome_matches');
  my @data;
  push(@data, ['Longest Sequence:' => $seq]);
  push(@data, ['Location:' => $loc]);
  push(@data, ['Number of Sequences:' => $seqNum]);
  push(@data, ['Genome Matches:' => $genMatches]);
  return hover($f,\@data);
}

sub MicrosatelliteTitle {
    my $f            = shift;
    my $accessn      = $f->name;
    my $genbankLink  = "<a target='_blank' href='http://www.ncbi.nlm.nih.gov/sites/entrez?db=unists&cmd=search&term=$accessn'>$accessn</a>";
    my $projectId    = $ENV{PROJECT_ID};
    my $start        = $f->start;
    my $stop         = $f->stop;
    my $length       = $stop - $start + 1;
    my ($name)        = $f->get_tag_values('Name');
    my ($sequenceId)        = $f->get_tag_values('SequenceId');
    my @data;
    push @data, [ 'Name:'        => $name ];
    push @data, [ 'Genbank Accession:'        => $genbankLink ];
    push @data, [ 'Sequence Id:'        => $sequenceId ];
    push @data, [ '3D7 Start:'        => $start ];
    push @data, [ '3D7 End:'        => $stop ];
    push @data, [ '3D7 ePCR Product Size:'        => $length ];
    return hover($f, \@data);
}


sub HaploBlockTitle {
    my $f            = shift;
    my $accessn      = $f->name;
    my $projectId    = $ENV{PROJECT_ID};
    my $start        = $f->start;
    my $stop         = $f->stop;
    my $length       = $stop - $start + 1;
    my ($boundary) = $f->get_tag_values('boundary');
    my ($name)        = $f->get_tag_values('Name');
    my ($start_max)        = $f->get_tag_values('start_max');
    my ($start_min)        = $f->get_tag_values('start_min');
    my ($end_max)        = $f->get_tag_values('end_max');
    my ($end_min)        = $f->get_tag_values('end_min');
    my ($sequenceId)        = $f->get_tag_values('SequenceId');
    my $libContlink = "<a target='_blank' href='/a/showQuestion.do?questionFullName=GeneQuestions.GenesByLocation&value%28sequenceId%29=$sequenceId&value%28organism%29=Plasmodium+falciparum&value%28end_point%29=$end_max&value%28start_point%29=$start_min&weight=10'>Query for Contained Genes</a>";
    my $consrvContlink = "<a target='_blank' href='/a/showQuestion.do?questionFullName=GeneQuestions.GenesByLocation&value%28sequenceId%29=$sequenceId&value%28organism%29=Plasmodium+falciparum&value%28end_point%29=$end_min&value%28start_point%29=$start_max&weight=10'>Query for Contained Genes</a>";
    my $libAssoclink = "<a target='_blank' href='/a/showQuestion.do?questionFullName=GeneQuestions.GenesByEQTL_Segments&value%28lod_score%29=1.5&value%28end_point_segment%29=$end_max&value%28pf_seqid%29=$sequenceId&value%28liberal_conservative%29=Liberal+Locations&value%28start_point%29=$start_min&weight=10'>Query for Associated Genes</a>";
    my $consrvAssoclink = "<a target='_blank' href='/a/showQuestion.do?questionFullName=GeneQuestions.GenesByEQTL_Segments&value%28lod_score%29=1.5&value%28end_point_segment%29=$end_min&value%28pf_seqid%29=$sequenceId&value%28liberal_conservative%29=Conservative+Locations&value%28start_point%29=$start_max&weight=10'>Query for Associated Genes</a>";

    my @data;
    push @data, [ 'Name (Centimorgan value appended):'        => $name ];
    push @data, [ 'Sequence Id:'        => $sequenceId ];
    push @data, [ '3D7 Liberal Start-End'        => "$start_min..$end_max  ($libAssoclink, $libContlink)" ];
    push @data, [ '3D7 Conservative Start-End'        => "$start_max..$end_min   ($consrvAssoclink, $consrvContlink)" ];
    push @data, [ 'Leberal Length'        => abs($end_max-$start_min) ];
    push @data, [ 'Conservative Length'        => abs($end_min-$start_max) ];
    return hover($f, \@data);
}


sub assemblyTitle { 
  my $f = shift;
  my $name  = $f->name; 
  my $start = $f->start;
  my $stop  = $f->stop;
  my @data; 
  my ($percent_identity) = $f->get_tag_values("PercentIdentity");
  my ($count) = $f->get_tag_values("Count");
  push @data, [ 'Name:' => $name ]; 
  push @data, [ 'Start:'  => $start ];
  push @data, [ 'Stop:'   => $stop ];
  push @data, [ 'Percent Identity:' => $percent_identity ]; 
  push @data, [ 'Count of ESTs:' => $count ]; 
#  hover("DoTS EST Assemblies: $name", \@data);
    hover($f, \@data);
}

sub tigrAssemblyTitle {
  my $f = shift;
  my $name = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my ($desc) = $f->get_tag_values("Note");
  $desc ||= "<i>unavailable</i>";
  my ($db) = $f->get_tag_values("TGI");
  my ($ver) = $f->get_tag_values("TGIver");
  my @data;
  push @data, [ "TIGR EST $db $ver Assembly: $name" => $name ];
  push @data, [ 'Accession: ' => $name ];
  # push @data, [ 'Location: ' => "$chr $loc" ];
  push @data, [ 'Description: ' => $desc ];
#  hover("TIGR EST $db $ver Assembly: $name", \@data);
    hover($f, \@data);
}

sub estTitle { 
  my $f = shift;
  my $name  = $f->name; 
  my $start = $f->start;
  my $stop  = $f->stop;
  my $score  = $f->score; 
  my @data; 
  my ($percent_identity) = $f->get_tag_values("PercentIdentity");
  my ($primer) = $f->get_tag_values("Primer");
  my ($library) = $f->get_tag_values("Library");
  my ($vector) = $f->get_tag_values("Vector");
  my ($stage) = $f->get_tag_values("Stage");
  push @data, [ 'Name:' => $name ]; 
  push @data, [ 'Start:'  => $start ];
  push @data, [ 'Stop:'   => $stop ];
  push @data, [ 'Percent Identity:' => $percent_identity ]; 
  push @data, [ 'Length:' => abs($stop - $start) . ' nt' ]; 
  push @data, [ 'Score:' => $score ]; 
  push @data, [ 'Library:' => $library ];
  push @data, [ 'Vector:' => $vector ] if ($vector);
  push @data, [ 'Primer:' => $primer ] if ($primer);
  push @data, [ 'Stage:' => $stage ] if ($stage);
  hover($f, \@data); 
}

sub cosmidTitle { 
  my $f = shift;
  
  &genericEndFeatureTitle($f, 'cosmid_end', 'Cosmid');
}

sub bacsTitle {
  my $f = shift;
  
  &genericEndFeatureTitle($f, 'bac_end', 'Bac');
}

sub fosmidTitle {
  my $f = shift;
  &genericEndFeatureTitle($f, 'generic_end', 'Fosmid');
}




sub transposableElementsTitle { 
  my $f = shift;

  my ($teName) = $f->get_tag_values("te_name");

  my $start = $f->start;
  my $stop  = $f->stop;
  my $length = $stop - $start + 1;

  my $sourceId = $f->name;
  my @data; 


  push @data, [ "Transposable Element:"     => $sourceId ]; 
  push @data, [ "Name:"     => $teName ]; 
  push @data, [ 'Size:'     => $length ]; 
  push @data, [ 'Location:' => "$start..$stop"];
  
  hover($f, \@data);
}

sub genericEndFeatureTitle { 
  my $f = shift;
  my $bulkFeatureName = shift;
  my $trackName = shift;



  my $start = $f->start;
  my $stop  = $f->stop;
  my $length = $stop - $start + 1;
  my $cname = $f->name;
  my @data; 
  push @data, [ "End-Sequenced $trackName:"     => $cname ]; 
  push @data, [ 'Clone Size:'     => $length ]; 
  push @data, [ 'Clone Location:' => "$start..$stop"];
  push @data, [ '<hr>'            => '<hr>' ];
  my @subs = $f->sub_SeqFeature("$bulkFeatureName");
  my $count = 0;
  foreach(@subs) {
    $count++;
    my $name  = $_->name; 
    my $start = $_->start;
    my $stop  = $_->stop;
    my ($pct) = $_->get_tag_values("pct");
    push @data, [ "$trackName End:"      => $name ]; 
    push @data, [ 'Location:'  => "$start..$stop" ];
    push @data, [ 'Percent Identity:' => "$pct %" ]; 
    push @data, [ 'Score:' => $_->score ]; 
    push @data, [ '<hr>' => '<hr>' ] if $count % 2;
  }
    hover($f, \@data);
}

sub orfTitle {
  my $f = shift;
  my $name = $f->name;
  my $start  = $f->start;
  my $stop   = $f->stop;
  my ($length) = $f->get_tag_values("Length");
  my @data;
  push @data, [ 'Name:'   => $name ];
  push @data, [ 'Start:'  => $start ];
  push @data, [ 'Stop:'   => $stop ];
  push @data, [ 'Length:' => $length . ' aa' ];
  #return hover( 'ORFs >= 150 nt', \@data);
  hover($f, \@data); 
}

sub ArrayElementTitle {
  my ($f, $type) = @_;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my ($name) = $f->get_tag_values("SourceId");
  my @data;
  push @data, ['Type:' => $type ] if ($type);
  push @data, [ 'Name:'  => $name ];
  push @data, [ 'Location:'  => "$chr $loc" ];
  hover($f, \@data);
}

sub gsnapIntronTitle {  
  my ($f) = @_;
  my ($sample) = $f->get_tag_values('Sample');
  my ($urs) = $f->get_tag_values('URS');
  my ($nrs) =  $f->get_tag_values('NRS');
  my $start = $f->start;
  my $stop = $f->stop;

  my @data;
  push @data, [ 'Sample:' => $sample ];
  push @data, [ 'Genome Location:' => "$start - $stop"];
  push @data, [ 'Score'   => $f->score ];
  push @data, [ 'Unique Reads:'  => "$urs" ];
  push @data, [ 'NU Reads:'     => "$nrs" ];
print STDERR "$sample / $start / $stop / $urs / $nrs " .  $f->score . "\n";
#  hover('Splice Site Junctions', \@data);
    hover($f, \@data);
}

sub gsnapIntronTitleUnified {  
  my ($f) = @_;
  my ($samples) = $f->get_tag_values('Samples');
  my ($scores) = $f->get_tag_values('Scores');
  my ($exps) = $f->get_tag_values('Exps');
  my ($urs) = $f->get_tag_values('URS');
  my ($nrs) =  $f->get_tag_values('NRS');
  my ($perc) = $f->get_tag_values('IntronPercent'); 
  my ($ratio) = $f->get_tag_values('IntronRatio'); 

  my $start = $f->start;
  my $stop = $f->stop;

  my $sum = eval join '+', split /[,|\|]/, $urs;

  my @sample_arr = split /\|/, $samples;
  my @score_arr  = split /\|/, $scores;
  my @exp_arr    = split /\|/, $exps;

  my @ur_arr    = split /\|/, $urs;
  my @nrs_arr    = split /\|/, $nrs;

  my $note = "The overall score is the sum of the unique and non-unique reads from all samples.";
  my @data;
  push @data, [ 'Location:'  => "$start - $stop"];
  push @data, [ '<b>Score</b>'     => "<b>$sum</b>" ];
  push @data, [ '<b>Percent of Max</b>'  => "<b>$perc</b>"] if $perc;
  push @data, [ '<b>Score/Expression</b>'  => "<b>$ratio</b>"] if $ratio;
  push @data, [ '<b>Note</b>'     => $note ];

  my $count = 0;
  my $html = "<table><tr><th>Experiment</th><th>Sample</th><th>Score</th><th>Unique</th><th>Non-Unique</th></tr>";
  foreach my $exp (@exp_arr) {
     my $sample = $sample_arr[$count];
     my $score = $score_arr[$count];
     my $ur_exps = $ur_arr[$count];
     my $nrs_exps = $nrs_arr[$count];

     $exp =~ s/_RSRC$//g;
     $exp =~ s/RNASeq//ig;
     $exp =~ s/_/ /g;

     my @sa = split /,/, $sample;
     my @sc = split /,/, $score;
     my @ur = split /,/, $ur_exps;
     my @nrs = split /,/, $nrs_exps;

     my $seen = 0;
     for(my $i = 0; $i < $#sa + 1; $i++) {
       my $score = $ur[$i];

       if($seen == 0) {
         $html .= "<tr><td>$exp</td><td>$sa[$i]</td><td>$score</td><td>$ur[$i]</td><td>$nrs[$i]</td></tr>"; 
       } else {
         $html .= "<tr><td></td><td>$sa[$i]</td><td>$score</td><td>$ur[$i]</td><td>$nrs[$i]</td></tr>"; 
       }
       $seen = 1;
     }
     $count++;
  }
  $html .= "</table>";
  push @data, [ '' => $html ];


#  hover('Unified Splice Site Junctions - RNA-Seq', \@data);
  hover($f, \@data); 
}

sub gsnapUnifiedIntronJunctionTitle {  
  my ($f) = @_;
  ##arrays
  my ($exps) = $f->get_tag_values('Exps');
  my ($samples) = $f->get_tag_values('Samples');
  my ($urs) = $f->get_tag_values('URS');
  my ($isrpm) = $f->get_tag_values('ISRPM');
  my ($nrs) =  $f->get_tag_values('NRS');
  my ($percSamp) = $f->get_tag_values('PerMaxSample'); 
  my ($isrCovRatio) = $f->get_tag_values('IsrCovRatio'); 
  my ($isrAvgCovRatio) = $f->get_tag_values('IsrAvgCovRatio'); 
  my ($normIsrCovRatio) = $f->get_tag_values('NormIsrCovRatio'); 
  my ($normIsrAvgCovRatio) = $f->get_tag_values('NormIsrAvgCovRatio'); 
  my ($isrpmExpRatio) = $f->get_tag_values('IsrpmExpRatio'); 
#  my ($avgExpRatio) = $f->get_tag_values('AvgExpRatio'); 
  my ($isrpmAvgExpRatio) = $f->get_tag_values('IsrpmAvgExpRatio'); 
  ##attributes
  my ($totalScore) = $f->get_tag_values('TotalScore'); 
  my ($intronPercent) = $f->get_tag_values('IntronPercent'); 
  my ($intronRatio) = $f->get_tag_values('IntronRatio'); 
  my ($matchesGeneStrand) = $f->get_tag_values('MatchesGeneStrand'); 
  my ($isReversed) = $f->get_tag_values('IsReversed'); 
  my ($annotIntron) = $f->get_tag_values('AnnotatedIntron'); 
  my ($gene_source_id) = $f->get_tag_values('GeneSourceId'); 

  my $start = $f->start;
  my $stop = $f->stop;


  my @exp_arr    = split /\|/, $exps;
  my @sample_arr = split /\|/, $samples;
  my @ur_arr    = split /\|/, $urs;
  my @isrpm_arr    = split /\|/, $isrpm;
  my @percSamp_arr = split /\|/, $percSamp;
  my @isrCovRatio_arr = split /\|/, $isrCovRatio;
  my @isrAvgCovRatio_arr = split /\|/, $isrAvgCovRatio;

  ##First build the html table so can capture max isrpm and thus maxRatio
  my $count = 0;
  my $html;
  if($intronPercent){
    $html = "<table><tr><th>Experiment</th><th>Sample</th><th>Unique</th><th>ISRPM</th><th>ISR/Cov</th><th>% MAI</th></tr>";
  }else{
    $html = "<table><tr><th>Experiment</th><th>Sample</th><th>Unique</th><th>ISRPM</th><th>ISR/AvgCov</th></tr>";
  }

  my $maxRatio = [0,0,'sample here','experiment'];
  my $sumIsrpm = 0;
  foreach my $exp (@exp_arr) {
    
    my @sa = split /,/, $sample_arr[$count];
    my @ur = split /,/, $ur_arr[$count];
    my @isrpm = split /,/, $isrpm_arr[$count];
    my @rcs = split /,/, $isrCovRatio_arr[$count];
    my @rct = split /,/, $isrAvgCovRatio_arr[$count];
    my @ps = split /,/, $percSamp_arr[$count];
    
    my $i = 0;
    for($i; $i < $#sa + 1; $i++) {
      $maxRatio = [ $isrpm[$i],$intronPercent ? $rcs[$i] : $rct[$i], $sa[$i], $exp, $intronPercent ? $rcs[$i] : $rct[$i] ] if $isrpm[$i] > $maxRatio->[0];
      $sumIsrpm += $isrpm[$i];
      
      if($i == 0) {
        $html .= "<tr><td>$exp</td><td>$sa[$i]</td><td>$ur[$i]</td><td>$isrpm[$i]</td>"; 
      } else {
        $html .= "<tr><td></td><td>$sa[$i]</td><td>$ur[$i]</td><td>$isrpm[$i]</td>"; 
      }
      if($intronPercent){
        $html .= "<td>$rcs[$i]</td><td>$ps[$i]</td></tr>";
      }else{
        $html .= "<td>$rct[$i]</td></tr>";
      }
    }
    $count++;
  }
  $html .= "</table>";
  
  my @data;
  push @data, [ '<b>Intron Location:</b>'  => "<b>$start - $stop (".($stop - $start + 1).' nt)</b>'];
  push @data, [ '<b>Intron Spanning Reads (ISR):</b>'     => "<b>$totalScore</b>" ];
  push @data, [ '<b>ISR per million (ISRPM):</b>'     => "<b>$sumIsrpm</b>" ];
  push @data, [ '<b>Gene assignment:</b>'  => "<b>$gene_source_id".($annotIntron eq "Yes" ? " - annotated intron" : "")."</b>"] if $intronPercent;
  push @data, [ '<b>&nbsp;&nbsp;&nbsp;% of Most Abundant Intron (MAI):</b>'  => "<b>$intronPercent</b>"] if $intronPercent;
  push @data, [ '<b>Most abundant in:</b>'  => "<b>$maxRatio->[3]: $maxRatio->[2]</b>"];
  push @data, [ '<b>&nbsp;&nbsp;&nbsp;ISRPM (ISR /'.($annotIntron eq 'Yes' ? ' gene coverage)' : ' avg coverage)').'</b>' => "<b>$maxRatio->[0] ($maxRatio->[1])</b>"];


  push @data, [ $html ];

#  hover('Unified Splice Site Junctions - RNA-Seq', \@data);
  hover($f, \@data,1); 
}

sub massSpecTitle_new {  
  my ($f, $replaceString,$replaceString2,$val2, $link) = @_;
  my @data;

  print STDERR Dumper $f;

  push @data, [ 'Experiment:' => "test" ];
#  push @data, [ 'Sample:' => $sample ];
#  push @data, [ 'Sequence:' => "$seq" ];
#  push @data, [ 'Description:' => "$desc" ] if($desc);
#  push @data, [ 'Spectrum Count:' => "$count" ] if($count);
#  push @data, [ 'Info:' => "$tb" ] if($phospho_site);
#  push @data, [ 'Note:'=> "* stands for phosphorylation<br/># stands for modified_L_methionine<br/>^ stands for modified_L_cysteine<br/>+ denotes other modified residues" ] if($ontology_names);
#  push @data, [ "Link to ProtoMap", "$link" ] unless !$link;
#  hover($f, \@data); 

}

sub massSpecTitle {  
  my ($f, $replaceString,$replaceString2,$val2, $link) = @_;
  my ($desc) = $f->get_tag_values('Description');
  $desc =~s/\nreport:(.*)$//;
  $desc =~s/\nscore:(.*)$//; 
  my ($count) = $f->get_tag_values('Count');
  my ($seq) =  $f->get_tag_values('PepSeq');
  my ($extdbname) = $f->get_tag_values('ExtDbName');

  my ($experiment) = $f->get_tag_values('Experiment');
  my ($sample) = $f->get_tag_values('Sample');

  $desc =~ s/[\r\n]/<br>/g;

  my ($phospho_site) = $f->get_tag_values('ModSite');
  my ($ontology_names) = $f->get_tag_values('Ontology');
  my $tb = "<table><tr><th>Location</th><th>Modified Residue</th><th>Modification Type</th></tr>";

  my $start = $f->start;
  if($phospho_site && $phospho_site ne 'NA') {
    my ($residue) = $f->get_tag_values('Residue');
    my @locs =  split /;/, $phospho_site; 
    my @term = split /;/, $ontology_names; 
    my @residues = split /;/, $residue; 
    my $count = 0;
    foreach my $loc (@locs) {
       $tb .= "<tr><td>".$locs[$count]."</td><td>".$residues[$count]."</td><td>".$term[$count]."</td></tr>";
       $count++;
    }
    $tb .= "</table>"; 
  } 


  if($phospho_site && $phospho_site ne 'NA') {
    my @locs = map {$_ - $start + 1} split /;/, $phospho_site; 
    my $offset = 0;

    for my $loc (sort  { $b <=> $a } @locs) {
      $loc = $loc + $offset;

        if ($ontology_names =~ /phosphorylation/i) {
          substr($seq, $loc, 0) = '*';
        } elsif ($ontology_names =~ /methionine/i) {
          substr($seq, $loc, 0) = '#';
        } elsif ($ontology_names =~ /cysteine/i) {
          substr($seq, $loc, 0) = '^';
        } else {
          substr($seq, $loc, 0) = '+';
        }
#      $offset++;
    }
    $seq =~ s/(.[\*|\#|\^|\+])/<B>$1<\/B>/g;
  }

  my @data;

  push @data, [ 'Experiment:' => $experiment ];
  push @data, [ 'Sample:' => $sample ];
  push @data, [ 'Sequence:' => "$seq" ];
  push @data, [ 'Description:' => "$desc" ] if($desc);
  push @data, [ 'Spectrum Count:' => "$count" ] if($count);
  push @data, [ 'Info:' => "$tb" ] if($phospho_site && $phospho_site ne 'NA');
  push @data, [ 'Note:'=> "* stands for phosphorylation<br/># stands for modified_L_methionine<br/>^ stands for modified_L_cysteine<br/>+ denotes other modified residues" ] if($ontology_names);
  push @data, [ "Link to ProtoMap", "$link" ] unless !$link;
  hover($f, \@data); 

}

sub massSpecUnifiedTitle {
  my $f = shift;
  my ($count) = $f->get_tag_values('SCount');
  my ($seq) =  $f->get_tag_values('PepSeq');
  my ($key) = $f->get_tag_values('Key');
  my ($experiment) = $f->get_tag_values('Experiment');
  my ($sample) = $f->get_tag_values('Sample');
  my @data;

  my $sum = 0;
  my @spectra = split(/, /, $count);

  foreach my $spectrum (@spectra) {
    $sum = $sum + $spectrum;
  }

  push @data, [ 'Sequence' => "$seq" ];
  push @data, [ 'Total matches' => "$sum" ];

  my %assayHash ;
  my $index = 0;
  my @keys = split(/, /, $key);
  my @experiments = split(/,/, $experiment);
  my @samples = split(/,/, $sample);
  while ($keys[$index]) {
    my $sampleCount = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$samples[$index]." [".$spectra[$index]."]<br />";
    push @{$assayHash{$experiments[$index]}}, $sampleCount;
    $index++;
  }
  my $assayTitle = 'Assay [count]';
  my $string ='';
  while( my ($exp,$sampleCounts) = each(%assayHash)) {
    foreach my $expName ($exp) {
        $string = $string.$expName."<br />";
        foreach my $sc (@{$assayHash{$exp}}) {
          $string = $string.$sc;
        }
      }
  }
  push @data, [ "$assayTitle" => $string ];
  $assayTitle = ' ';

  hover($f, \@data) if $count;
}

sub unifiedPostTranslationalMod {
  my $f = shift;

  my ($experiments) = $f->get_tag_values('Experiments');
  my ($samples) = $f->get_tag_values('Samples');

  my ($pepSeqs) =  $f->get_tag_values('PepSeqs');
  my ($pepNaFeatIds) =  $f->get_tag_values('PepAAFeatIds');
  my ($mscounts) = $f->get_tag_values('MSCounts');

  my ($residueLocations) = $f->get_tag_values('ResidueLocs');
  my ($ontologys) = $f->get_tag_values('Ontologys');

  my ($aaStartMins) = $f->get_tag_values('AAStartMins');

  my ($location) = $f->start;
  my ($featureName) = $f->name;

  my @data;

  my %hash;
  my @exps = split /\|/, $experiments;
  my @smpls = split /\|/, $samples;
  my @pepseqs = split /\|/, $pepSeqs;
  my @pepNaFeatIds = split /\|/, $pepNaFeatIds;


  my @mscts = split /\|/, $mscounts;
  my @onts = split /\|/, $ontologys;
  my @resLocs = split /\|/, $residueLocations;
  my @aaStartMins = split /\|/, $aaStartMins;


  for(my $i = 0; $i < scalar @exps; $i++) {
    my $expt = $exps[$i];
    my $sample = $smpls[$i];
    my $pepSeq = $pepseqs[$i];
    my $pepNaFeatId = $pepNaFeatIds[$i];

    my $msct = $mscts[$i];

    my $allAaMin = $aaStartMins[$i];
    my $allOnt = $onts[$i];
    my $allResidueLoc = $resLocs[$i];
    
    my @resLocsArr = split(',', $allResidueLoc);
    my @ontArr = split(',', $allOnt);
    my @aaMinArr = split(',', $allAaMin);

    my $match;
    foreach(@resLocsArr) {
      $match = 1 if($_ eq $location);
    }

    if($match) {
      push @{$hash{$expt}->{$sample}->{$pepNaFeatId}}, {pepSeq => $pepSeq, mscount => $msct, residue_locations => \@resLocsArr, ontology => \@ontArr, aa_start => \@aaMinArr};
    }

  }

  push @data, [ 'Residue'   => $featureName ];

  foreach my $e (keys %hash) {
     push @data, [ '==========='   => "=======================" ];
     push @data, [ 'Experiment' => $e ];

     foreach my $s (keys %{$hash{$e}}) {
       push @data, [ 'Sample'     => $s ];

       foreach my $pi (keys %{$hash{$e}->{$s}}) {
         foreach my $peps (@{$hash{$e}->{$s}->{$pi}}) {
           my $pepSequence = $peps->{pepSeq};
           my $msCount = $peps->{mscount};

           my $residueLocations = $peps->{residue_locations};
           my $ontology = $peps->{ontology};
           my $aaStarts = $peps->{aa_start};

           if($residueLocations) {

             my $offset = 1;

             # residue locations are sorted in sql
             for(my $i = 0; $i < scalar @$residueLocations; $i++) {
               my $rl = $residueLocations->[$i];
               my $type = $ontology->[$i];
               my $aaStart = $aaStarts->[$i];

               my $loc = $rl - $aaStart + 1 + $offset;

               substr($pepSequence, $loc, 0) = '*' if $type =~ /phosphorylation/i; 
               substr($pepSequence, $loc, 0) = '#' if $type =~ /methionine/i; 
               substr($pepSequence, $loc, 0) = '^' if $type =~ /cysteine/i; 

               $offset++;
             }
             push @data, [ 'Sequence'   => "$pepSequence ($msCount)" ];
           }


         }
       }

     }
  }
  



  #   if($pseq && $location) {
  #     my $loc = $location - $starts[$_] + 1; 
  #     substr($pseq, $loc, 0) = '*' if $ontology =~ /phosphorylation/i; 
  #     substr($pseq, $loc, 0) = '#' if $ontology =~ /methionine/i; 
  #     substr($pseq, $loc, 0) = '^' if $ontology =~ /cysteine/i; 
  #     push @data, [ 'Spectrum Count' => $mscounts[$_] ];
  #   }    
  #   push @data, [ 'Sequence'   => "$pseq" ];

  # }
  hover($f, \@data);
}


sub blatTitleGB2 {
  my $f = shift;
  my $name = $f->name;
  my $chr = $f->seq_id;
  my $tstart =  $f->start;
  my $tstop =  $f->stop;
  my $loc = $f->location->to_FTstring;
  my ($pctI) = $f->get_tag_values("PercentIdentity");
  my ($desc) = $f->get_tag_values("Defline");
  $desc ||= "<i>unavailable</i>";
  $desc =~ s/\001.*//;
  my @data;
  push @data, [ 'GI number:'   => "$name" ];
  push @data, [ 'Score:'       => $f->score ];
  push @data, [ 'Location:' => "$tstart - $tstop"];
  push @data, [ 'Identity %:'  => sprintf("%3.1f", $pctI) ];
  push @data, [ 'Description:' => $desc ];
  hover($f, \@data);
}


sub blastxTitleGB2 {
  my $f = shift;
  my $name = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my ($e) = $f->get_tag_values("Expect");
  my ($tstart) = $f->get_tag_values('TStart');
  my ($tstop )= $f->get_tag_values('TStop');
  my ($pctI) = $f->get_tag_values("PercentIdentity");
  my ($percent_pos) = $f->get_tag_values("PercentPositive");
  my ($desc) = $f->get_tag_values("Defline");
  $desc ||= "<i>unavailable</i>";
  $desc =~ s/\001.*//;
  my @data;
  push @data, [ 'Accession:'   => "gi\|$name" ];
  push @data, [ 'Score:'       => $f->score ];
  push @data, [ 'E-Value:'     => $e];
  push @data, [ 'Location:' => "$tstart - $tstop"]; 
  push @data, [ 'Identity %:'  => $pctI];
  push @data, [ 'Percent Positive' => $percent_pos];
  push @data, [ 'Description:' => $desc ];
  hover($f, \@data);
}

sub blastxTitle {
  my $f = shift;
  my $name = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my ($e) = $f->get_tag_values("Expect");
  my ($tstart) = $f->get_tag_values('TStart');
  my ($tstop )= $f->get_tag_values('TStop');
  my ($pctI) = $f->get_tag_values("PercentIdentity");
  my ($percent_pos) = $f->get_tag_values("PercentPositive");
  my ($desc) = $f->get_tag_values("Defline");
  $desc ||= "<i>unavailable</i>";
  $desc =~ s/\001.*//;
  my @data;
  push @data, [ 'Accession:'   => "gi\|$name" ];
  push @data, [ 'Score:'       => $f->score ];
  push @data, [ 'E-Value:'     => $e];
  push @data, [ 'Location:' => "$tstart - $tstop"]; 
  push @data, [ 'Identity %:'  => $pctI];
  push @data, [ 'Percent Positive' => $percent_pos];
  push @data, [ 'Description:' => $desc ];
  hover($f, \@data); 
}


sub geneticMarkersTitle {
  my $f = shift;
  my ($isCoding) = $f->get_tag_values("IsCoding"); 
  my ($posInCDS) = $f->get_tag_values("PositionInCDS"); 
  my ($posInProtein) = $f->get_tag_values("PositionInProtein"); 
  my ($refStrain) = $f->get_tag_values("RefStrain"); 
  my ($refAA) = $f->get_tag_values("RefAA"); 
  my ($refNA) = $f->get_tag_values("RefNA"); 
  my ($nonSyn) = $f->get_tag_values("NonSyn"); 
  my ($src_id) = $f->get_tag_values("SourceID"); 
  my $link = qq(<a href=/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$src_id>$src_id</a>);
  my $variants = $f->bulkAttributes();
  my @data;
  push @data, [ 'SNP'  => $link ];
  push @data, [ 'Location:'  => $f->start ];
  my $class = 'Non-Coding';
  if ($isCoding) {
    $refAA = ": $refAA"; 
    my $non = $nonSyn? 'non-' : '';
    $class = "Coding (${non}synonymous)";
    push @data, [ 'Position in CDS:'  => $posInCDS ];
    push @data, [ 'Position in Protein:'  => $posInProtein ];
  }
  push @data, [ 'Genetic Markers:'  => $class ];
  push @data, ["Strain: $refStrain (reference)"=>"$refNA $refAA"];
  foreach my $variant (@$variants) {
    my $strain = $variant->{STRAIN};
    next if ($strain eq $refStrain);
    my $na = $variant->{ALLELE};
    my $aa = $variant->{PRODUCT};
    my $info = "$na" . ($isCoding? " : $aa" : "");
    push @data, [ "Strain: $strain" => $info ];
  }
  hover($f, \@data); 
}

sub RandomEndsTitle {
  my $f = shift;
  my $start = $f->start;
  my $stop  = $f->stop;
  my $length = $stop - $start;
  my $cname = $f->name;
  my @data; 
  push @data, [ 'Random End:'     => $cname ]; 
  push @data, [ 'Clone Size:'     => $length ]; 
  push @data, [ 'Clone Location:' => "$start..$stop"];
  push @data, [ '<hr>'            => '<hr>' ];
  my @subs = $f->sub_SeqFeature("random_end");
  my $count = 0;
  foreach(@subs) {
    $count++;
    my $name  = $_->name; 
     my $start = $_->start;
     my $stop  = $_->stop;
     my ($pct) = $_->get_tag_values("pct");
     push @data, [ 'Random End:'      => $name ]; 
     push @data, [ 'Location:'  => "$start..$stop" ];
     push @data, [ 'Percent Identity:' => "$pct %" ]; 
     push @data, [ 'Score:' => $_->score ]; 
  }
  hover($f, \@data); 
}


sub bindingSiteTitle {
  my $f = shift;
  my $name = $f->name;
  my $start = $f->start;
  my $stop  = $f->stop;
  my $strand  = $f->strand;
  my ($score) = $f->get_tag_values("Score");
  my ($sequence) = $f->get_tag_values("Sequence");
  #my $revComp = reverse $sequence;
  #$revComp =~ tr/ACGTacgt/TGCAtgca/;

  if($strand eq '+1') {
    $strand = 'FORWARD';
  }
  else {
    $strand = 'REVERSE';
    #$sequence = $revComp;
  }

  my $link = qq(<a href="/a/images/pf_tfbs/$name.png"><img src="/a/images/pf_tfbs/$name.png"  height="140" width="224" align=left/></a>);
  my @data;
  push @data, [ 'Name:'  => $name ];
  push @data, ['Start:'  => $start];
  push @data, ['Stop:'   => $stop];
  push @data, ['Strand:'   => $strand];
  push @data, [ 'P value:' => $score];  
  push @data, [ 'Sequence:' => $sequence ];  
  push @data, [ 'Click logo for larger image'  => $link];
  hover($f, \@data); 
}


### pbrowse specific methods

sub interproTitle {
  my $f = shift;
  my $name = $f->name;
  my ($desc) = $f->get_tag_values("Note");
  my ($db) = $f->get_tag_values("Db");
  my ($url) = $f->get_tag_values("Url");
  my ($evalue) = $f->get_tag_values("Evalue");
  my ($interproId) = $f->get_tag_values("InterproId");
  $evalue = sprintf("%.2E", $evalue);
  my @data;
  push @data, [ 'Accession:'  => $name ];
  push @data, [ 'Description:' => $desc ];
  push @data, [ 'Database:'  => $db ];
  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  push @data, [ 'Evalue:' => $evalue ];
  push @data, [ 'Interpro:' => $interproId ];
  hover($f, \@data); 
}

sub interproLink {
  my $f = shift;
  my ($db) = $f->get_tag_values('Db');
  my ($pi) = $f->get_tag_values('Pi');
  my $url;
  if($db eq 'INTERPRO') { 
    $url = qq|http://www.ebi.ac.uk/interpro/DisplayIproEntry?ac=$pi|;
  } elsif( $db eq 'PFAM') { 
    $url = qq|https://www.ebi.ac.uk/interpro/entry/pfam/$pi|;
  } elsif( $db eq 'PRINTS') {
    $url = qq|http://umber.sbs.man.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?prints_accn=$pi&display_opts=Prints&category=None&queryform=false&regexpr=off|;
  } elsif( $db eq 'PRODOM') {
    $url = qq|http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=$pi|;
  } elsif( $db eq 'PROFILE') {
    $url = qq|http://www.expasy.org/prosite/$pi|;
  } elsif( $db eq 'SMART') {
    $url = qq|http://smart.embl-heidelberg.de/smart/do_annotation.pl?ACC=$pi&BLAST=DUMMY|; 
  } elsif( $db eq 'SUPERFAMILY') { 
    $url = qq|http://supfam.org/SUPERFAMILY/cgi-bin/scop.cgi?ipid=$pi|;
  } else {
    $url = qq|http://www.ebi.ac.uk/interpro/ISearch?query=$pi&mode=all|;
  }
  return $url;
}

sub signalpTitle {
  my $f = shift;
  my @data;
  my ($d_score) = $f->get_tag_values("DScore");
  my ($signal_prob) = $f->get_tag_values("SignalProb");
  my ($conclusion_score) = $f->get_tag_values("ConclusionScore");
  my ($algorithm) = $f->get_tag_values("Algorithm"); # 'SignalPhmm' or 'SignalPnn'
  $algorithm = ($algorithm eq 'SignalPhmm')? 'SP-HMM':'SP-NN';

  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  push @data, [ 'NN Conclusion Score:' => $conclusion_score ];
  push @data, [ 'NN D-Score:' => $d_score ];
  push @data, [ 'HMM Signal Probability:' => $signal_prob ];
  push @data, [ 'Algorithm:' => $algorithm ];
  hover($f, \@data); 
}

sub tmhmmTitle {
  my $f = shift;
   my ($desc) = $f->get_tag_values("Topology");
  my @data;
  push @data, [ 'Topology:' => $desc ];
  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  hover($f, \@data); 
}

sub blastpTitle {
  my $f = shift;
  my $name = $f->name;
  my ($desc) = $f->get_tag_values("Note");
  $desc ||= "<i>unavailable</i>";
  $desc =~ s/\001.*//;
  my @data;
  push @data, [ 'Name:'  => $name ];
  push @data, [ 'Description:' => $desc ];
  push @data, [ 'Expectation:' => $f->get_tag_values("Expect") ];
  push @data, [ '% Identical:' => sprintf("%3.1f", $f->get_tag_values("PercentIdentity")) ];
  push @data, [ '% Positive:' => sprintf("%3.1f", $f->get_tag_values("PercentPositive")) ];
  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  hover($f, \@data); 
}

sub isolatesTitle {
  my $f = shift;
  my $name = $f->name;
  my ($evalue) = $f->get_tag_values('Expect');
  my ($qstart) = $f->get_tag_values('QStart');
  my ($qend) = $f->get_tag_values('QStop');
  my ($desc) = $f->get_tag_values('Note');
  my ($matchlen) = $f->get_tag_values('MatchLen');
  my @data;
  push @data, [ 'Name:'   => $name ];
  push @data, [ 'Score:'  => $f->score ];
  push @data, [ 'Expect:' => $evalue ];
  push @data, [ 'Match:'  => "$matchlen nt" ];
  push @data, [ 'Note:'   => $desc ];
  hover($f, \@data); 
}

sub lowcomplexitySegTitle {
  my $f = shift;
  my @data;
  my ($sequence) = $f->get_tag_values("Sequence");
  push @data, [ 'Coordinates:' => $f->start . '..' . $f->end ];
  push @data, [ 'Sequence:'  => $sequence ];
  hover($f, \@data); 
}

sub ExportPredTitle{
   my $f = shift;
   my ($name) = $f->get_tag_values("DomainName");
   my @data;
   push @data, [ 'Name:' => $name ];
   push @data, [ 'Coordinates:' => $f->start . '..' . $f->end ];

   hover($f, \@data); 
}

sub repeatFamily {
  my $f = shift;

  my $start = $f->start;
  my $stop = $f->stop;
  my ($family) = $f->get_tag_values("Family");

  my @data;
  push(@data, ['Repeat Family:' => $family]);
  push(@data, ['Location:' => $start . " - " . $stop]);
  return hover($f,\@data);
}

sub jcviPasaTitle {
  my $f = shift;

  my $start = $f->start;
  my $stop = $f->stop;
  my $name = $f->name;

  my @data;
  push(@data, ['Name:' => $name]);
  push(@data, ['Location:' => $start . " - " . $stop]);
  return hover($f,\@data);
}

sub oldAnnotationTitle {
  my $f = shift;
  my $start = $f->start;
  my $stop  = $f->stop;
  my ($id) = $f->name;
  my ($descr) = $f->get_tag_values('description');
  $descr =~s/\+/ /g;

  my @data;
  push(@data, ['ID:'  => $id]);
  push(@data, ['Description:'    => $descr]);
  push(@data, ['Position:'   => "$start..$stop"]);

  return hover($f,\@data);
}

sub riteshMassSpec {
  my $f = shift;

  my $start = $f->start;
  my $stop  = $f->stop;
  my ($pep) = $f->get_tag_values('Peptide');
  my ($fdr) = $f->get_tag_values('FDR');
  my ($psm) = $f->get_tag_values('PSM');

  my @data;
  push(@data, ['Peptide:'    => $pep]);
  push(@data, ['FDR Score:'  => $fdr]);
  push(@data, ['PSM Counts:' => $psm]);
  push(@data, ['Position:'   => "$start..$stop"]);

  return hover($f,\@data);
}

sub BamFileSeqBalloon {
    my $f = shift;
    my $seq = $f->query->dna;
    my $len = length($seq);
    return "$seq ($len bp)";
}


1;
