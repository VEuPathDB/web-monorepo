package GBrowse::PopupAndLinks;

use strict;

use GBrowse::Configuration;

#--------------------------------------------------------------------------------
#  Methods for Titles
#--------------------------------------------------------------------------------

# ToxoDB only
sub tigrAssemblyLink {
  my $f = shift;
  my $name = $f->name;
  my ($species) =  ($f->get_tag_values("TGISpecies") eq 'TgGI') ?  't_gondii' : 'unk';     
  
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
  my ($type) = $f->get_tag_values("Type");
  my @data;
  if ($type !~ /gap/i) {
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

# TODO:  What is 'toxo' doing here??
sub snpTitleQuick {
  my $f = shift;
  my $webapp = 'toxo';
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
    return qq{" onmouseover="return escape(pst(this,'$params&$varsString&$start&$gene&$isCoding&$nonSyn&$webapp'))"};
  } else {
    return $gene? "In gene $gene" : "Intergenic"; 
  }
}


sub peakTitle {
  my $f  = shift;
  my $name = $f->name;
  my $score = $f->score;
  my ($analysis) = $f->get_tag_values("Analysis");
  my @data;
  push @data, [ 'Probe Id:' => $name ];
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


sub massSpecTitle {  
  my ($f, $replaceString) = @_;
  my ($desc) = $f->get_tag_values('Description');
  $desc =~s/\nreport:(.*)$//;
  my ($seq) =  $f->get_tag_values('PepSeq');
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  $desc =~ s/[\r\n]/<br>/g;

  if($replaceString) {
    $extdbname =~ s/$replaceString/assay: /i;
  }
  my @data;
  push @data, [ '' => "$extdbname<br>sequence:$seq<br>$desc" ];
  hover('', \@data);
}

1;
