package GBrowse::PopupAndLinks;

use strict;

use GBrowse::Configuration;

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
  my $f = shift;
  my $name = $f->name;
  my $link = "/a/showRecord.do?name=ArrayElementRecordClasses.ArrayElementRecordClass&primary_key=$name";
  return $link;
}

#--------------------------------------------------------------------------------
#  Methods for Titles (Popups)
#--------------------------------------------------------------------------------

sub synGeneTitle {
  my $f = shift;
  my $name = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my ($desc) = $f->get_tag_values("Note");
  my ($taxon) = $f->get_tag_values("Taxon");
  my ($isPseudo) = $f->get_tag_values("IsPseudo");
  my ($contig) = $f->get_tag_values("Contig");
  my ($soTerm) = $f->get_tag_values("SOTerm");
  my ($start) = $f->get_tag_values("Start");
  my ($end) = $f->get_tag_values("End");
  $soTerm =~ s/\_/ /g;
  $soTerm =~ s/\b(\w)/\U$1/g;
  my @data;
  push @data, [ 'Species:' => $taxon ];  
  push @data, [ 'Name:'  => $name ];
  push @data, [ 'Gene Type:' => ($isPseudo ? "Pseudogenic " : "") . $soTerm  ];
  push @data, [ 'Description:' => $desc ];
  push @data, [ 'Location:'  => "$contig: $start - $end" ];
  hover("Syntenic Gene: $name", \@data);
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
  my @data;
  if ($type !~ /gap/i) {
    push @data, [ 'Chromsome: '=> "$chromosome" ] if ($chromosome);
    push @data, [ 'Syntenic Contig: ' => "$contigSourceId" ];
    push @data, [ 'Ref location: ' => "$refStart&nbsp;-&nbsp;$refEnd ($refLength&nbsp;bp)" ];
    push @data, [ 'Syn location: ' => "$synStart&nbsp;-&nbsp;$synEnd ($synLength&nbsp;bp)" ];
    push @data, [ 'Reversed: ' => "$strand" ];
    push @data, [ 'Total Syn Contig Length: ' => "$contigLength" ];
    push @data, [ 'Total Ref Contig Length: ' => "$refContigLength" ];
    hover("Synteny Span", \@data);
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
  hover( ($type =~ /gap/i) ? 'All gaps in region' : 'Scaffold', \@data);
}

sub snpTitleQuick {
  my $f = shift;
  my ($gene) = $f->get_tag_values("Gene"); 
  my ($isCoding) = $f->get_tag_values("IsCoding"); 
  my ($nonSyn) = $f->get_tag_values("NonSyn"); 
  my ($rend) = $f->get_tag_values("rend"); 
  my ($base_start) = $f->get_tag_values("base_start");
  my $zoom_level = $rend - $base_start; 
  if ($zoom_level <= 60000) {
    my ($params) = $f->get_tag_values("params");
    my $variants = $f->bulkAttributes();
    my @vars;
    foreach my $variant (@$variants) {
      push(@vars, "$variant->{STRAIN}:$variant->{ALLELE}:$variant->{PRODUCT}");
    }
    my $varsString = join('|', @vars);
    my $start = $f->start();
    return qq{" onmouseover="return escape(pst(this,'$params&$varsString&$start&$gene&$isCoding&$nonSyn'))"};
  } else {
    return $gene? "In gene $gene" : "Intergenic"; 
  }
}

sub snpTitle {
  my $f = shift;
  my %rev = ( A => 'T', T => 'A', C => 'G', G => 'C' );
  my ($isCoding) = $f->get_tag_values("IsCoding"); 
  $isCoding = $isCoding eq 'yes' ? 1 : 0;
  my ($posInCDS) = $f->get_tag_values("PositionInCDS"); 
  my ($posInProtein) = $f->get_tag_values("PositionInProtein"); 
  my ($refStrain) = $f->get_tag_values("RefStrain"); 
  my ($refAA) = $f->get_tag_values("RefAA"); 
  my ($gene) = $f->get_tag_values("Gene"); 
  my ($reversed) = $f->get_tag_values("Reversed"); 
  my ($refNA) = $f->get_tag_values("RefNA"); 
  $refNA = $rev{$refNA} if $reversed;
  my ($nonSyn) = $f->get_tag_values("NonSyn"); 
  my $variants = $f->bulkAttributes();
  my ($source_id) = $f->get_tag_values("SourceID"); 
  my $type = 'Non-Coding';
  my ($rend) = $f->get_tag_values("rend"); 
  my ($base_start) = $f->get_tag_values("base_start");
  my $zoom_level = $rend - $base_start; 

  if ($isCoding) {
     my $non = $nonSyn? 'non-' : '';
     $type = "Coding (${non}synonymous)";
  }
  if ($zoom_level <= 60000) {
    my @data;
    my $link = qq(<a href=/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$source_id>$source_id</a>);
    push @data, [ 'SNP'  => $link ];
    push @data, [ 'Location:'  => $f->start ];
    if ($gene) {
       push @data, [ 'Gene:'  => $gene ]; 
    }
    if ($isCoding) {
       $refAA = "&nbsp;&nbsp;&nbsp;&nbsp;AA=$refAA"; 
       push @data, [ 'Position in CDS:'  => $posInCDS ] if ($posInCDS);
       push @data, [ 'Position in Protein:'  => $posInProtein ] if ($posInProtein);
    }
    push @data, [ 'Type:'  => $type ];
    push @data, ["$refStrain (reference)"=>"NA=$refNA$refAA"];
    foreach my $variant (@$variants) {
      my $strain = $variant->{STRAIN};
      if (!($strain =~/$refStrain/i)) {
        my $na = $variant->{ALLELE};
        $na = $rev{$na} if $reversed;
        my $aa = $variant->{PRODUCT};
        my $info = "NA=$na" . ($isCoding? "&nbsp;&nbsp;&nbsp;&nbsp;AA=$aa" : "");
        push @data, [ "$strain" => $info ];
      }
    }
    return hover( "SNP", \@data) if $refStrain;
  } else {
    return $gene? "In gene $gene" : "Non-coding"; 
  }
 }


sub snpTitleFromMatchToReference {
             my $f = shift;
             my ($isCoding) = $f->get_tag_values("IsCoding");
             my ($refStrain) = $f->get_tag_values("RefStrain");
             my ($gene) = $f->get_tag_values("Gene");
             my ($refNA) = $f->get_tag_values("RefNA");
             my ($source_id) = $f->get_tag_values("SourceID");
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
               hover( "CGH | $source_id | $type", \@data) if $refStrain;
             } else {
                return $gene? "In gene $gene" : "Non-coding";
             }

} 

# not needed?
 sub chipTitleQuick {
   my $f = shift;
   my @data;
   my $name = $f->name;
   my ($country) = $f->get_tag_values("Country"); 
   my ($allele) = $f->get_tag_values("Allele"); 
   my ($strain) = $f->get_tag_values("Strain"); 
   my ($snpid) = $f->get_tag_values("SnpId"); 
   my $link = qq(<a href="/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$snpid">$snpid</a>);
   push @data, [ 'Name:'  => $name ];
   push @data, [ 'Strain:'  => $strain ];
   push @data, [ 'Country:'  => $country ];
   push @data, [ 'Allele:'  => $allele ];
   push @data, [ 'SNP Id:'  => $link ];
   return hover( "3k Chip", \@data); 
 }

 sub chipTitle {
   my $f = shift;
   my @data;
   my $name = $f->name;
   my ($source) = $f->get_tag_values("IsoDbName");
   my ($location) = $f->start;
   my ($majorAllele) = $f->get_tag_values("MajorAllele");
   my ($minorAllele) = $f->get_tag_values("MinorAllele");
   my ($minorAlleleFreq) = $f->get_tag_values("MinorAlleleFreq");
   my ($numIsolates) = $f->get_tag_values("NumIsolates");
   my ($snpid) = $f->get_tag_values("SnpId");
   my $link = qq(<a href="/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=$name">$name</a>);
   push @data, [ 'Name:'  => $name ];
   push @data, [ 'Data Source:'  => $source ];
   push @data, [ 'Location:' => $location ];
   push @data, [ 'Major Allele:'  => $majorAllele ];
   push @data, [ 'Minor Allele:'  => $minorAllele ];
   push @data, [ 'Minor Allele Frequency:'  => $minorAlleleFreq ];
   push @data, [ '# of isolates:'  => $numIsolates ];
   return hover( "SNP on genotypying chip", \@data); 
 }

sub peakTitle {
  my $f  = shift;
  my $name = $f->name;
  my $score = $f->score;
  my ($analysis) = $f->get_tag_values("Analysis");
  my @data;
  push @data, [ 'Analysis:' => $analysis ];
  push @data, [ 'Score:' => $score ];
  hover( "ChIP-chip called peaks $name", \@data); 
}


sub geneTitle {
  my $f = shift;
  my $projectId = $ENV{PROJECT_ID};
  my $sourceId = $f->name;
  my $chr = $f->seq_id;
  my $loc = $f->location->to_FTstring;
  my ($soTerm) = $f->get_tag_values("soTerm");
  my ($product) = $f->get_tag_values("product");
  my ($taxon) = $f->get_tag_values("taxon");
  my ($isPseudo) = $f->get_tag_values("isPseudo");
  $soTerm =~ s/\_/ /g;
  $soTerm =~ s/\b(\w)/\U$1/g;
  return qq{" onmouseover="return escape(gene_title(this,'$projectId','$sourceId','$chr','$loc','$soTerm','$product','$taxon','$isPseudo'))"};
} 

sub spliceSiteCuratedTitle {
  my $f = shift;
  my $id = $f->name;  
  my $loc = $f->location->to_FTstring;
  my ($sasNum) = $f->get_tag_values('sas_count');
  my ($utr_len) = $f->get_tag_values('utr_length');
  my ($gene_id) = $f->get_tag_values('gene_id');
  my @data;
  push(@data, ['Location:' => $loc]);
  push(@data, ['Gene:' => $gene_id]);
  push(@data, ['Sequence count:' => $sasNum]);
  push(@data, ['UTR length:' => $utr_len]);
  return hover("$id",\@data);
}

sub spliceSiteAlignTitle {
  my $f = shift;
  my $seq = $f->name;  ##currently using the name to hold sequence
  my $loc = $f->start;
  my ($seqNum) = $f->get_tag_values('count');
  my ($genMatches) = $f->get_tag_values('genome_matches');
  my @data;
  push(@data, ['Sequence:' => $seq]);
  push(@data, ['Location:' => $loc]);
  push(@data, ['Number of Sequences:' => $seqNum]);
  push(@data, ['Genome Matches:' => $genMatches]);
  return hover("Splice Site: $loc",\@data);
}

sub MicrosatelliteTitle {
    my $f            = shift;
    my $name         = $f->name;
    my $genbankLink  = "<a target='_blank' href='http://www.ncbi.nlm.nih.gov/sites/entrez?db=unists&cmd=search&term=$name'>$name</a>";
    my $projectId    = $ENV{PROJECT_ID};
    my $start        = $f->start;
    my $stop         = $f->stop;
    my $length       = $stop - $start + 1;
    my ($type)        = $f->get_tag_values('Name');
    my ($sequenceId)        = $f->get_tag_values('SequenceId');
    my $msaLink = "<a target='_blank' href='/cgi-bin/mavidAlign?project_id=$projectId&contig=$sequenceId&start=$start&stop=$stop&revComp=off&type=clustal'>Available Strains</a>";
    my @data;
    push @data, [ 'Genbank Accession:'        => $genbankLink ];
    push @data, [ 'Type:'        => $type ];
    push @data, [ 'Sequence Id:'        => $sequenceId ];
    push @data, [ '3D7 Start:'        => $start ];
    push @data, [ '3D7 End:'        => $stop ];
    push @data, [ '3D7 ePCR Product Size:'        => $length ];
    push @data, [ 'Multiple Sequence Alignment'        => $msaLink ];
    return hover( "Microsatellite STS - $name", \@data);
}

sub contigTitle {  
  my $f = shift;
  my $name = $f->name;
  my $chr  = $f->seq_id;
  my $loc  = $f->location->to_FTstring;
  my $orient   = $f->strand eq '-1' ? "reverse" : "forward";
  my ($length) = $f->get_tag_values("Length");
  my ($type) = $f->get_tag_values("Type");
  my $start = $f->start;
  my $stop = $f->stop;
  my @data;
  push @data, [ 'Name:'    => $name ]; 
  push @data, [ 'Length:'  => $length ];
  push @data, [ 'Orientation:' => "$orient" ]; 
  push @data, [ 'Location:' => "$start..$stop" ];
  hover('Contig', \@data);
  }


sub scaffoldTitle { 
  my $f = shift;
  my $name = $f->name;
  my $chr  = $f->seq_id;
  my $loc  = $f->location->to_FTstring;
  my $orient   = $f->strand eq '-1' ? "reverse" : "forward";
  my ($length) = $f->get_tag_values("Length");
  my ($type) = $f->get_tag_values("Type");
  my $start = $f->start;
  my $stop = $f->stop;
  my @data;
  if($type eq "fgap"){
    my @gaps = $f->sub_SeqFeature();
    my $count = 0;
    foreach(@gaps) {
      $count++;
      my $gstart = $_->start;
      my $gstop  = $_->stop;
      my $gsize  = $gstop - $gstart + 1;
      push @data, [ "Gap $count: $gstart..$gstop:"  => $gsize ]; 
    }
  } elsif($type eq "scaffold") {
    push @data, [ 'Name:'    => $name ]; 
    push @data, [ 'Length:'  => $length ];
    push @data, [ 'Orientation:' => "$orient" ]; 
    push @data, [ 'Location:' => "$start..$stop" ];
  } 
  hover( ($type eq 'scaffold') ? 'Scaffold' : 'All gaps in region', \@data);
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
  hover("DoTS EST Assemblies: $name", \@data);
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
  push @data, [ 'Accession: ' => $name ];
  # push @data, [ 'Location: ' => "$chr $loc" ];
  push @data, [ 'Description: ' => $desc ];
  hover("TIGR EST $db $ver Assembly: $name", \@data);
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
  hover("dbEST Alignment: $name", \@data);
}

sub cosmidTitle { 
  my $f = shift;
  my $start = $f->start;
  my $stop  = $f->stop;
  my $length = $stop - $start;
  my $cname = $f->name;
  my @data; 
  push @data, [ 'Clone Size:'     => $length ]; 
  push @data, [ 'Clone Location:' => "$start..$stop"];
  push @data, [ '<hr>'            => '<hr>' ];
  my @subs = $f->sub_SeqFeature;
  my $count = 0;
  foreach(@subs) {
    $count++;
    my $name  = $_->name; 
    my $start = $_->start;
    my $stop  = $_->stop;
    my ($pct) = $_->get_tag_values("pct");
    push @data, [ 'Bac End:'      => $name ]; 
    push @data, [ 'Location:'  => "$start..$stop" ];
    push @data, [ 'Percent Identity:' => "$pct %" ]; 
    push @data, [ 'Score:' => $_->score ]; 
    push @data, [ '<hr>' => '<hr>' ] if $count % 2;
  }
  hover("End-Sequenced Cosmid: $cname", \@data);
}

sub bacsTitle { 
  my $f = shift;
  my $start = $f->start;
  my $stop  = $f->stop;
  my $length = $stop - $start;
  my $cname = $f->name;
  my @data; 
  push @data, [ 'Clone Size:'     => $length ]; 
  push @data, [ 'Clone Location:' => "$start..$stop"];
  push @data, [ '<hr>'            => '<hr>' ];
  my @subs = $f->sub_SeqFeature;
  my $count = 0;
  foreach(@subs) {
    $count++;
    my $name  = $_->name; 
    my $start = $_->start;
    my $stop  = $_->stop;
    my ($pct) = $_->get_tag_values("pct");
    push @data, [ 'Bac End:'      => $name ]; 
    push @data, [ 'Location:'  => "$start..$stop" ];
    push @data, [ 'Percent Identity:' => "$pct %" ]; 
    push @data, [ 'Score:' => $_->score ]; 
    push @data, [ '<hr>' => '<hr>' ] if $count % 2;
  }
  hover("End-Sequenced BAC: $cname", \@data);
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
  return hover( 'ORFs >= 150 nt', \@data);
}

sub ArrayElementTitle {
     my $f = shift;
     my $name = $f->name;
     my $chr = $f->seq_id;
     my $loc = $f->location->to_FTstring;
     my ($desc) = $f->get_tag_values("Note");
     my @data;
     push @data, [ 'Name:'  => $name ];
     push @data, [ 'Description:' => $desc ];
     # push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
     push @data, [ 'Location:'  => "$chr $loc" ];
     hover("Glass Slide Oligo: $name", \@data);
}

sub massSpecTitle {  
  my ($f, $replaceString,$replaceString2,$val2) = @_;
  my ($desc) = $f->get_tag_values('Description');
  $desc =~s/\nreport:(.*)$//;
  $desc =~s/\nscore:(.*)$//; 
my ($count) = $f->get_tag_values('Count');
  my ($seq) =  $f->get_tag_values('PepSeq');
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  $desc =~ s/[\r\n]/<br>/g;

  if($replaceString) {
    $extdbname =~ s/$replaceString/assay: /i;
  }

 if($replaceString2) {
    $extdbname =~ s/$replaceString2/$val2/i;
  }

  my @data;
  push @data, [ 'Experiment:' => "$extdbname" ];
  push @data, [ 'Sequence:' => "$seq" ];
  push @data, [ 'Description:' => "$desc" ] if($desc);
  push @data, [ 'Number of Matches:' => "$count" ] if($count);
  hover('Mass Spec', \@data);
}

sub massSpecUnifiedTitle {
  my $f = shift;
  my ($count) = $f->get_tag_values('Count');
  my ($seq) =  $f->get_tag_values('PepSeq');
  my ($db_ids) = $f->get_tag_values('DbIds');
  my ($db_names) = $f->get_tag_values('DbNames');
  my @data;

  push @data, [ 'Sequence' => "$seq" ];
  push @data, [ 'Total matches' => "$count" ];

  # make hash with external_db_rel_id as key, and number of matches as value
  my @hits = split(/, /, $db_ids);
  my %freq;
  foreach my $hit (sort(@hits)) {
    $freq{$hit}++;
  }
  # make hash with external_db_rel_id as key, and db_name as value
  my @names = split(/, /, $db_names);
  my %test;
  foreach my $hit (sort(@names)) {
    my ($key,$val) = split(/=/, $hit);
    $test{$key} = $val;
  }
  # display all 'db_name (number of matches)'
  my $assayTitle = 'Asay (count)';
  foreach my $try (keys(%freq)) {   ##@fields) {
    push @data, [ "$assayTitle" => "$test{$try} ($freq{$try})" ];
    $assayTitle = ' ';
  }
  hover('', \@data) if $count;
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
  hover("BLASTX: gi\|$name", \@data);
}


# TODO:  There is a link to a ToxoDB specific Database... is this needed?  can we get this from the sage tag record page?  Want to make the popup as generic as possible so all sites can use
sub sageTagTitle { 
  my $f            = shift;
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
  push @data, [ 'Name:'          => "$sourceId" ];
  push @data, [ 'Temporary external ID:' => "$name" ];
  push @data, [ 'Location:'        => "$start..$stop" ];
  push @data, [ 'Sequence:'        => $tag ];
  push @data, [ 'Found in genome:' => $occurrence ];
#  push @data, [ 'Link'             => $sageDb_url];
  my $bulkEntries = $f->bulkAttributes();
  push @data, [ "<b>Library</b>" => "<b>Percent | RawCount</b>" ];
  foreach my $item (@$bulkEntries) {
    my $lib = $item->{LIBRARY_NAME};
    my $raw_count = $item->{RAW_COUNT};
    my $percent = sprintf("%.3f", $item->{LIBRARY_TAG_PERCENTAGE});
    push @data, [ "$lib" => "$percent % | $raw_count" ];
  }
  return hover( "Sage Tag - Temp ID $name", \@data); 
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
  push @data, ["Strain: $refStrain (reference)"=>"$refNA $refAA"];
  foreach my $variant (@$variants) {
    my $strain = $variant->{STRAIN};
    next if ($strain eq $refStrain);
    my $na = $variant->{ALLELE};
    my $aa = $variant->{PRODUCT};
    my $info = "$na" . ($isCoding? " : $aa" : "");
    push @data, [ "Strain: $strain" => $info ];
  }
  hover( "Genetic Markers - $class", \@data);
}

sub RandomEndsTitle {
  my $f = shift;
  my $start = $f->start;
  my $stop  = $f->stop;
  my $length = $stop - $start;
  my $cname = $f->name;
  my @data; 
  push @data, [ 'Clone Size:'     => $length ]; 
  push @data, [ 'Clone Location:' => "$start..$stop"];
  push @data, [ '<hr>'            => '<hr>' ];
  my @subs = $f->sub_SeqFeature;
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
 hover("Random End: $cname", \@data);
}

sub affyProbesTitle {
  my ($f, $type) = @_;
  my $start = $f->start;
  my $stop  = $f->stop;
  my ($count) = $f->get_tag_values("Count"); 
  my ($probeSet) = $f->get_tag_values("ProbeSet"); 
  my $probeId = $f->name; 
  my @data;
  push @data, ['ProbeSetID:' => $probeSet ];
  push @data, ['ProbeID:' => $probeId ];
  push @data, ['Start:'        => $start];
  push @data, ['Stop:'         => $stop];
  push @data, ['Count:' => $count];
  hover( $type, \@data);   
}


### pbrowse specific methods

sub interproTitle {
  my $f = shift;
  my $name = $f->name;
  my ($desc) = $f->get_tag_values("Note");
  my ($db) = $f->get_tag_values("Db");
  my ($url) = $f->get_tag_values("Url");
  my ($evalue) = $f->get_tag_values("Evalue");
  $evalue = sprintf("%.2E", $evalue);
  my @data;
  push @data, [ 'Accession:'  => $name ];
  push @data, [ 'Description:' => $desc ];
  push @data, [ 'Database:'  => $db ];
  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  push @data, [ 'Evalue:' => $evalue ];
  hover("InterPro Domain: $name", \@data);
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
  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  push @data, [ 'NN Conclusion Score:' => $conclusion_score ];
  push @data, [ 'NN D-Score:' => $d_score ];
  push @data, [ 'HMM Signal Probability:' => $signal_prob ];
  hover("Signal peptide", \@data);
}

sub tmhmmTitle {
  my $f = shift;
   my ($desc) = $f->get_tag_values("Topology");
  my @data;
  push @data, [ 'Topology:' => $desc ];
  push @data, [ 'Coordinates:' => $f->start . ' .. ' . $f->end ];
  hover("Transmembrane Domain", \@data);
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
  hover("BLASTP hit: $name", \@data);
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
  hover( "$name", \@data);
}

sub lowcomplexitySegTitle {
  my $f = shift;
  my @data;
  my ($sequence) = $f->get_tag_values("Sequence");
  push @data, [ 'Coordinates:' => $f->start . '..' . $f->end ];
  push @data, [ 'Sequence:'  => $sequence ];
  hover("Low complexity", \@data);
}

sub ExportPredTitle{
   my $f = shift;
   my @data;
   push @data, [ 'Coordinates:' => $f->start . '..' . $f->end ];
   hover("Predicted export domain", \@data);
}

1;
