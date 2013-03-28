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

sub sageTagLink { 
  my $f = shift;
  my $name = $f->name;
  my $link = "/a/showRecord.do?name=SageTagRecordClasses.SageTagRecordClass&primary_key=$name";
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
  my $link = "/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$name";
  return $link;
}

#--------------------------------------------------------------------------------
#  Methods for Titles (Popups)
#--------------------------------------------------------------------------------

sub syntenyTitle {
  my $f = shift;
  my ($syntype) = $f->get_tag_values('SynType');
  if($syntype eq 'genes') {
    &synGeneTitle($f);
  } elsif($syntype eq 'contig') {
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

  my ($trunc) = $f->get_tag_values("Truncated");
  my $location = "$seqId: $start - $end".($trunc ? " (truncated by syntenic region to $trunc)" : "");
  
  return qq{javascript:escape(syn_gene_title(this,'$projectId','$sourceId','$taxon','$soTerm','$desc','$location','$gbLinkParams'))};
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
  my ($type) = $f->get_tag_values("Type");
  my ($scale) = $f->get_tag_values("Scale");
  $scale = sprintf("%.2f", $scale);
  my $boolNotRef = ( $chr eq $contigSourceId ) ? 0 : 1;

  my @data;
  if (($type !~ /gap/i) && ($boolNotRef)){
    push @data, [ 'Chromsome: '=> "$chromosome" ] if ($chromosome);
    push @data, [ 'Syntenic Contig: ' => "$contigSourceId" ];
    push @data, [ 'Ref location: ' => "$refStart&nbsp;-&nbsp;$refEnd ($refLength&nbsp;bp)" ];
    push @data, [ 'Syn location: ' => "$synStart&nbsp;-&nbsp;$synEnd ($synLength&nbsp;bp)" ];
    push @data, [ 'Reversed: ' => "$strand" ];
    push @data, [ 'Total Syn Contig Length: ' => "$contigLength" ];
    push @data, [ 'Total Ref Contig Length: ' => "$refContigLength" ];
    push @data, [ 'Scale: ' => "$scale" ];
    hover($f, \@data);
  } elsif ($type !~ /gap/i) {
    push @data, [ 'Chromsome: '=> "$chromosome" ] if ($chromosome);
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
  my ($rend) = $f->get_tag_values("rend"); 
  my ($base_start) = $f->get_tag_values("base_start");
  my $zoom_level = $rend - $base_start; 
  my ($position_in_CDS) = $f->get_tag_values("position_in_CDS");
  my ($position_in_protein) = $f->get_tag_values("position_in_protein");
  my ($reference_strain) = $f->get_tag_values("reference_strain");
  my ($reference_aa) = $f->get_tag_values("reference_aa");
  my ($gene_strand) = $f->get_tag_values("gene_strand");
  my ($reference_na) = $f->get_tag_values("reference_na");
  my ($source_id) = $f->get_tag_values("source_id");

  my $variants = $f->bulkAttributes();
  my @vars;
  foreach my $variant (@$variants) {
    push(@vars, "$variant->{STRAIN}:$variant->{ALLELE}:$variant->{PRODUCT}");
  }

  my $start = $f->start();
  my %revArray = { 'A' => 'T', 'C' => 'G', 'T' => 'A', 'G' => 'C' };

  my $link = "<a href='/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$source_id'>$source_id</a>";
         
  my $type = 'Non-coding';
  my  $refNA = $gene_strand == 1 ? $revArray{$reference_na} : $reference_na;
  my $refAAString = ''; 
  if ($isCoding =~ /yes/i) {
     $type = "Coding (synonymous)";
     $type = "Coding (non-synonymous)" if $nonSyn =~ /yes/;
     $refAAString = "&nbsp;&nbsp;&nbsp;&nbsp;AA=$reference_aa";
  }

  my @data;
  push(@data, ['SNP' => $link]);
  push(@data, ['Location' => $start]);
  push(@data, ['Gene' => $gene]) if $gene;
  if ($isCoding =~ /yes/i) {
    push(@data, ['Position&nbsp;in&nbsp;CDS' => $position_in_CDS]);
    push(@data, ['Position&nbsp;in&nbsp;protein' => $position_in_protein]);
  }

  push(@data, ['Type' => $type]);
  push(@data, ["$reference_strain"."&nbsp;(reference)" => "NA=$refNA $refAAString"]);

  # make one row per SNP allele
  my $size = @vars;
  for (my $i=0; $i< $size; $i++) {
    my @var = split /\:/, $vars[$i];
    my $strain = $var[0];

    next if ($strain eq $reference_strain);

    my $na = $var[1];
    $na = $revArray{$na} if ($gene_strand == 1);

    my $aa_seq =  ($isCoding == 'yes') ? "&nbsp;&nbsp;&nbsp;&nbsp;AA=$var[2]"  : '';

    push(@data, [$strain => "NA=$na $aa_seq" ]);

  }
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
   #my ($source) = $f->get_tag_values("IsoDbName");
   my ($location) = $f->start;
   my ($majorAllele) = $f->get_tag_values("MajorAllele");
   my ($minorAllele) = $f->get_tag_values("MinorAllele");
   my ($minorAlleleFreq) = $f->get_tag_values("MinorAlleleFreq");
   my ($numIsolates) = $f->get_tag_values("NumIsolates");
   my ($snpid) = $f->get_tag_values("SnpId");
   my $link = qq(<a href="/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$name">$name</a>);
   push @data, [ 'Name:'  => $name ];
   #push @data, [ 'Data Source:'  => $source ];
   push @data, [ 'Location:' => $location ];
   push @data, [ 'Major Allele:'  => $majorAllele ];
   push @data, [ 'Minor Allele:'  => $minorAllele ];
   push @data, [ 'Minor Allele Frequency:'  => $minorAlleleFreq ];
   push @data, [ '# of isolates:'  => $numIsolates ];
   return hover($f, \@data); 
 }

sub peakTitle {
  my $f  = shift;
  my $name = $f->name;
  my $score = $f->score;
  my ($analysis) = $f->get_tag_values("Analysis");
  my ($a) = $f->get_tag_values('Antibody');
  my @data;
  push @data, [ 'Name:' => $name ];
  push @data, [ 'Analysis:' => $analysis ];
  push @data, [ 'Antibody:' => $a ];
  push @data, [ 'Score:' => $score ];
  hover( $f, \@data); 
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
  my $loc = $f->location->to_FTstring;

  $loc =~ s/(\d+\.\.)/<br \/>&nbsp;&nbsp;$1/g;
  
  my ($soTerm) = $f->get_tag_values("soTerm");
  my ($isPseudo) = $f->get_tag_values("isPseudo");
  $soTerm =~ s/\_/ /g;
  $soTerm =~ s/\b(\w)/\U$1/g;
  $soTerm .= " (pseudogene)" if $isPseudo == '1';
  
  my ($product) = $f->get_tag_values("product");
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

  return qq{javascript:escape(gene_title(this,'$projectId','$sourceId','$chr','$loc','$soTerm','$product','$taxon','$utr','$gbLinkParams'))};
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
  $utr_len = ($utr_len < 0)? "N/A (within gene)": $utr_len;
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
    my $libAssoclink = "<a target='_blank' href='/a/showQuestion.do?questionFullName=GeneQuestions.GenesByEQTL_Segments&value%28lod_score%29=1.5&value%28end_point_segment%29=$end_max&value%28sequence_id%29=$sequenceId&value%28liberal_conservative%29=Liberal+Locations&value%28start_point%29=$start_min&weight=10'>Query for Associated Genes</a>";
    my $consrvAssoclink = "<a target='_blank' href='/a/showQuestion.do?questionFullName=GeneQuestions.GenesByEQTL_Segments&value%28lod_score%29=1.5&value%28end_point_segment%29=$end_min&value%28sequence_id%29=$sequenceId&value%28liberal_conservative%29=Conservative+Locations&value%28start_point%29=$start_max&weight=10'>Query for Associated Genes</a>";

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
  push @data, [ 'Vector:' => $vector ]; 
  push @data, [ 'Primer:' => $primer ]; 
  push @data, [ 'Stage:' => $stage ]; 
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

sub rumIntronTitle {  
  my ($f) = @_;
  my ($sample) = $f->get_tag_values('Sample');
  my ($lour) = $f->get_tag_values('LOUR');
  my ($sour) =  $f->get_tag_values('SOUR');
  my ($lonr) =  $f->get_tag_values('LONR');
  my ($sonr) =  $f->get_tag_values('SONR');
  my ($canonical) =  $f->get_tag_values('Canonical');
  my ($knowintron) = $f->get_tag_values('KnownIntron');
  my $start = $f->start;
  my $stop = $f->stop;

  my @data;
  push @data, [ 'Sample:' => $sample ];
  push @data, [ 'Genome Location:' => "$start - $stop"];
  push @data, [ 'Score'   => $f->score ];
  push @data, [ 'Signal is canonical:'        => "$canonical" ];
  push @data, [ 'Long Overlap Unique Reads:'  => "$lour" ];
  push @data, [ 'Short Overlap Unique Reads:' => "$sour" ];
  push @data, [ 'Long Overlap NU Reads:'      => "$lonr" ];
  push @data, [ 'Short Overlap NU Reads:'     => "$sonr" ];

#  hover('Splice Site Junctions', \@data);
    hover($f, \@data);
}

sub rumIntronTitleUnified {  
  my ($f) = @_;
  my ($samples) = $f->get_tag_values('Samples');
  my ($scores) = $f->get_tag_values('Scores');
  my ($exps) = $f->get_tag_values('Exps');
  my ($lours) = $f->get_tag_values('LOURS');
  my ($sours) =  $f->get_tag_values('SOURS');
  my ($lonrs) =  $f->get_tag_values('LONRS');
  my ($sonrs) =  $f->get_tag_values('SONRS');

  my ($notCans)  =  $f->get_tag_values('NOTCAN');

  my $start = $f->start;
  my $stop = $f->stop;

  my $sum_lour = eval join '+', split /[,|\|]/, $lours;
  my $sum_sour = eval join '+', split /[,|\|]/, $sours;

  # sum=Score;  this should be the sum of the long and short unique reads;  bug int he score in the db
  my $sum = $sum_lour + $sum_sour;

  my @sample_arr = split /\|/, $samples;
  my @score_arr  = split /\|/, $scores;
  my @exp_arr    = split /\|/, $exps;

  my @lour_arr    = split /\|/, $lours;
  my @sour_arr    = split /\|/, $sours;
  my @lonrs_arr    = split /\|/, $lonrs;
  my @sonrs_arr    = split /\|/, $sonrs;
  my @notCan_arr   = split /\|/, $notCans;

  my $count = 0;
  my $html = "<table><tr><th>Experiment</th><th>Sample</th><th>Score</th><th>Long Unique</th><th>Short Unique</th><th>Long Non-Unique</th><th>Short Non-Unique</th><th>Canonical</th></tr>";
  foreach my $exp (@exp_arr) {
     my $sample = $sample_arr[$count];
     my $score = $score_arr[$count];
     my $lour_exps = $lour_arr[$count];
     my $sour_exps = $sour_arr[$count];
     my $lonrs_exps = $lonrs_arr[$count];
     my $sonrs_exps = $sonrs_arr[$count];
     my $notCan_exps = $notCan_arr[$count];

     $exp =~ s/_RSRC$//g;
     $exp =~ s/RNASeq//ig;
     $exp =~ s/_/ /g;

     my @sa = split /,/, $sample;
     my @sc = split /,/, $score;
     my @lour = split /,/, $lour_exps;
     my @sour = split /,/, $sour_exps;
     my @lonrs = split /,/, $lonrs_exps;
     my @sonrs = split /,/, $sonrs_exps;
     my @notCans = split /,/, $notCan_exps;

     my $seen = 0;
     for(my $i = 0; $i < $#sa + 1; $i++) {

       my $isCanonical = $notCans[$i] ? 'false' : 'true';
       my $score = $lour[$i] + $sour[$i];

       if($seen == 0) {
         $html .= "<tr><td>$exp</td><td>$sa[$i]</td><td>$score</td><td>$lour[$i]</td><td>$sour[$i]</td><td>$lonrs[$i]</td><td>$sonrs[$i]</td><td>$isCanonical</td></tr>"; 
       } else {
         $html .= "<tr><td></td><td>$sa[$i]</td><td>$score</td><td>$lour[$i]</td><td>$sour[$i]</td><td>$lonrs[$i]</td><td>$sonrs[$i]</td><td>$isCanonical</td></tr>"; 
       }
       $seen = 1;
     }
     $count++;
  }
  $html .= "</table>";
  my $note = "The overall score is the sum of the short and long overlap unique reads from all samples.";
  my @data;
  push @data, [ '' => $html ];
  push @data, [ 'Location:'  => "$start - $stop"];
  push @data, [ 'Score'     => $sum ];
  push @data, [ 'Note'     => $note ];
#  hover('Unified Splice Site Junctions - RNASeq', \@data);
  hover($f, \@data); 
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

  my ($phospho_site) = $f->get_tag_values('PhosphoSite');
  my ($phospho_score) = $f->get_tag_values('PhosphoScore');
  my ($ontology_names) = $f->get_tag_values('Ontology');
  my $tb = "<table><tr><th>Location</th><th>Modified Residue</th><th>Modification Type</th><th>Score</th></tr>";

  my $start = $f->start;
  if($phospho_site) {
    my @locs =  split /;/, $phospho_site; 
    my @scores = split /;/, $phospho_score; 
    my @term = split /;/, $ontology_names; 
    my $count = 0;
    foreach my $loc (@locs) {
       my $residue = substr($seq, $loc - $start, 1);
       $tb .= "<tr><td>".$locs[$count]."</td><td>$residue</td><td>".$term[$count]."</td><td>".$scores[$count]."</td></tr>";
       $count++;
    }
    $tb .= "</table>"; 
  } 

  if($phospho_site) {
    my @locs = map {$_ - $start + 1} split /;/, $phospho_site; 
    for my $loc (sort { $b <=> $a }  @locs) {
      substr($seq, $loc, 0) = '*' if $ontology_names =~ /phosphorylation/i; 
      substr($seq, $loc, 0) = '#' if $ontology_names =~ /methionine/i; 
      substr($seq, $loc, 0) = '^' if $ontology_names =~ /cysteine/i; 
    } 
  } 

#  if($replaceString) {
#    $extdbname =~ s/$replaceString/assay: /i;
#  }

# if($replaceString2) {
#    $extdbname =~ s/$replaceString2/$val2/i;
#  }
  
#  my $displayName = $MS_EXTDB_NAME_MAP{$extdbname} ? $MS_EXTDB_NAME_MAP{$extdbname} : $extdbname;

  my @data;
  push @data, [ 'Experiment:' => $experiment ];
  push @data, [ 'Sample:' => $sample ];
  push @data, [ 'Sequence:' => "$seq" ];
  push @data, [ 'Description:' => "$desc" ] if($desc);
  push @data, [ 'Number of Matches:' => "$count" ] if($count);
  push @data, [ 'Info:' => "$tb" ] if($phospho_site);
  push @data, [ 'Note:'=> "* stands for phosphorylation<br/># stands for modified_L_methionine<br/>^ stands for modified_L_cysteine" ] if($ontology_names);
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



# TODO:  There is a link to a ToxoDB specific Database... is this needed?  can we get this from the sage tag record page?  Want to make the popup as generic as possible so all sites can use
sub sageTagTitle { 
  my ($f, $note) = @_;
  my $name         = $f->name;
  my ($sourceId)    = $f->get_tag_values('SourceID'); 
  my $start        = $f->start; 
  my $stop         = $f->stop; 
  my $strand       = $f->strand;
  ($start,$stop) = ($stop,$start) if ($strand == -1); 
  my ($tag)        = $f->get_tag_values('Sequence'); 
#  my $sageDb_url = "<a target='new' href=http://vmbmod10.msu.montana.edu/vmb/cgi-bin/sage.cgi?prevpage=newsage4.htm;normal=yes;database=toxoditagscorrect;library=sp;intag=" 
#    . $tag . ">TgSAGEDB</a>";
  my ($occurrence) = $f->get_tag_values('Occurrence'); 
  my @data; 
  push @data, [ 'Name:'          => "$name" ];
  push @data, [ 'Source ID:'          => "$sourceId" ];
  push @data, [ 'Temporary external ID:' => "$name" ];
  push @data, [ 'Location:'        => "$start..$stop" ];
  push @data, [ 'Sequence:'        => $tag ];
  push @data, [ 'Found in genome:' => $occurrence ];
  push @data, [ 'Note:'            => $note ] if $note;
#  push @data, [ 'Link'             => $sageDb_url];
  my $bulkEntries = $f->bulkAttributes();
  push @data, [ "<b>Library</b>" => "<b>Percent | RawCount</b>" ];
  foreach my $item (@$bulkEntries) {
    my $lib = $item->{LIBRARY_NAME};
    my $raw_count = $item->{RAW_COUNT};
    my $percent = sprintf("%.3f", $item->{LIBRARY_TAG_PERCENTAGE});
    push @data, [ "$lib" => "$percent % | $raw_count" ];
  }
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
  my $revComp = reverse $sequence;
  $revComp =~ tr/ACGTacgt/TGCAtgca/;

  if($strand eq '+1') {
    $strand = 'FORWARD';
  }
  else {
    $strand = 'REVERSE';
    $sequence = $revComp;
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
    $url = qq|http://pfam.sanger.ac.uk/family?acc=$pi|;
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
   my @data;
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

sub riteshMassSpec {
  my $f = shift;

  my ($pep) = $f->get_tag_values('Peptide');
  my ($fdr) = $f->get_tag_values('FDR');
  my ($psm) = $f->get_tag_values('PSM');

  my @data;
  push(@data, ['Peptide:'    => $pep]);
  push(@data, ['FDR Score:'  => $fdr]);
  push(@data, ['PSM Counts:' => $psm]);

  return hover($f,\@data);
}



1;
