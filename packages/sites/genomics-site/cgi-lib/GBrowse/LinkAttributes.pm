package GBrowse::LinkAttributes;

use strict;

use GBrowse::Configuration;

sub synSpanLink {
  my $f = shift;
  my $name = $f->name;
  return "/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&primary_key=$name"
}

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

1;
