package GBrowse::Configuration;

use ApiCommonWebsite::Model::ModelConfig;
use ApiCommonWebsite::Model::DbUtils;

use HTML::Template;
require Exporter;

@ISA = qw(Exporter);
@EXPORT = qw(init synSpanTitle hover snpHeight snpTitleQuick synSpanScale synSpanLink synGeneTitle chipColor peakTitle peakHeight changeType gapFgcolor gapBgcolor);  

sub new {
  my $class = shift;
  my $self  = {
    track_no => 0,
  };
  bless ($self, $class);
  return $self;
}

sub init {
  my $projectId = $ENV{PROJECT_ID};
  my $docRoot = $ENV{DOCUMENT_ROOT};
  my $c = new ApiCommonWebsite::Model::ModelConfig($projectId);
  my $resolvedDsn = ApiCommonWebsite::Model::DbUtils->resolveOracleDSN($c->appDb->dbiDsn);
  { -sqlfile => $docRoot .'/../conf/gbrowse.conf/gbrowseQueries.xml',
      -dsn     => $resolvedDsn,
        -user    => $c->appDb->login,
          -pass    => $c->appDb->password,
            -projectId => $projectId
          }
}


# For use with link_target.
# Returns onmouseover popup for mass spec peptides
# if 'bump density' is exceeded, the popup includes a note that
# data is incomplete. If 'link_target density' is exceeded, undef
# is returned and no popup will be displayed.
# Example:
# " onmouseover=";return escape('<TABLE><TR><TD></TD><TD>...</TD></TR></TABLE>')
sub link_target_ms_peptides {  
    my ($self, $feat, $panel, $track) = @_;

    my $link_target_density = $track->option('link_target density');
    my $bump_density = $track->option('bump density');

    return if ( $link_target_density && 
                @{$track->{parts}} > $link_target_density );
    
    my ($extdbname) = $feat->get_tag_values('ExtDbName');
    my ($desc) = $feat->get_tag_values('Description');
    my ($seq) = $feat->get_tag_values('Sequence');
    $desc .= "sequence: $seq";
    $desc =~ s/[\r\n]/<br>/g;

    $extdbname =~ s/Wastling MassSpec/assay: /i;
    $extdbname =~ s/Lowery MassSpec/assay: /i;
    $extdbname =~ s/Fiser_Proteomics_/assay: /i;
    $extdbname =~ s/Ferrari_Proteomics_/assay: /i;
    
    my $content = "$extdbname<br>$desc";

    if ( $bump_density && 
         @{$track->{parts}} > $bump_density ) {
         
        my $span = $feat->{start} . '-' . $feat->{end};
        if ($track->{'seen'}->{$span}++) {
            return;
        }
        
        $content = q(<font color='red'>non-redundant, representative data</font><br>) . $content;
    }
       
    my @data;
    push @data, [ '' => $content ];
    $self->popup_template('', \@data);
}

# keep only $depth features for each span.
# A feature may be used in multiple tracks so $name is required
# to permitting counting features for each track.
sub filter_to_depth {
    my ($self, $feat, $name, $depth) = @_;
    return 1 unless $depth;
    my $span = $feat->{start} . '-' . $feat->{end} . ':' . $feat->{strand};
    $self->{$name}->{$span}++ < $depth;
}

sub popup_template { 
  my ($self, $name, $data) = @_; 
  use HTML::Template; 
  my $tmpl = HTML::Template->new(filename => $ENV{DOCUMENT_ROOT}.'/gbrowse/hover.tmpl'); 
  $tmpl->param(DATA => [ map { { Key => $_->[0], Value => $_->[1], } } @$data ]); 
  my $str = $tmpl->output; 
  $str =~ s/'/\\'/g; 
  $str =~ s/\s+$//; 
  $str =~ s/\\n//; 
  return qq{" onmouseover="$cmd;return escape('$str') };
}


sub hover {
  my ($name, $data) = @_;
  my $tmpl = HTML::Template->new(filename => $ENV{DOCUMENT_ROOT}.'/gbrowse/hover.tmpl');
  $tmpl->param(DATA => [ map { { @$_ > 1 ? (KEY => $_->[0], VALUE => $_->[1]) : (SINGLE => $_->[0]) } } @$data ]);
  my $str = $tmpl->output;
  $str =~ s/'/\\'/g;
  $str =~ s/\"/&quot;/g;
  $str =~ s/\s+$//;
  my $cmd = "this.T_STICKY=false;this.T_TITLE='$name'";
  $cmd = qq{" onMouseOver="$cmd;return escape('$str')};
  return $cmd;
}


# not used
sub hover2 {
  my ($name, $data) = @_;
  my $tmpl = HTML::Template->new(filename => $ENV{DOCUMENT_ROOT}.'/gbrowse/hover.tmpl');
  $tmpl->param(DATA => [ map { { Key => $_->[0], Value => $_->[1], } } @$data ]);
  my $str = $tmpl->output;
  return $str;
}


# --------- SNPs ----------
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

 sub snpHeight {
   my $f = shift;
   my ($rend) = $f->get_tag_values("rend"); 
   my ($base_start) = $f->get_tag_values("base_start");
   my $zoom_level = $rend - $base_start; 
   return $zoom_level <= 60000? 10 : 6;
 }

# --------- Synteny ----------
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
       foreach(@gaps) {
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

 sub synSpanScale {
     my $f = shift;
     my ($type) = $f->get_tag_values('Type');
     return 0 if ($type =~ /gap/i);
     my $name = $f->name;
     my ($scale) = $f->get_tag_values("Scale");
     $scale = sprintf("%.2f", $scale);
     return $name; 
 }

 sub synSpanLink {
     my $f = shift;
     my $name = $f->name;
     return "/toxo/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&primary_key=$name"
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


# --------- ChIP Chip ----------
 sub oldChipColor { 
    my $f   = shift;
    my ($a) = $f->get_tag_values('Analysis');
    return '#00C896' if($a =~ /H3K4(.*) - Rep1/);
    return '#00C800' if($a =~ /H3K4(.*) - Rep2/);
    return '#FA9600' if($a =~ /H3K9(.*) - Rep1/);
    return '#C86400' if($a =~ /H3K9(.*) - Rep2/);
 } 

 sub chipColor { 
    my $f   = shift;
    my ($a) = $f->get_tag_values('Antibody');
    my ($r) = $f->get_tag_values('Rep');
    return '#00C800' if($a =~ /H3K4/ && $r == 1);
    return '#00C896' if($a =~ /H3K4/ && $r == 2);
    return '#C86400' if($a =~ /H3K9/ && $r == 1);
    return '#FA9600' if($a =~ /H3K9/ && $r == 2);
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

 sub peakHeight {
   my $f = shift;
   my $score = $f->score;
   return $score; 
 }

 sub changeType { 
   my $f = shift;
   my ($type) = $f->get_tag_values("Type");
   return "arrow" if($type eq 'scaffold');
   return "segments";
 }

 sub gapFgcolor { 
   my $f = shift; 
   my ($type) = $f->get_tag_values("Type");
   if ($type eq "fgap") {
     return "white";
   } else {
     my $orient = $f->strand;
     if ($orient eq "+1") {
       return "orange";
     } elsif ($orient eq "-1") {
       return "darkseagreen";
     } else {
       return "red";
     }
   }
  } 

  sub gapBgcolor { 
    my $f = shift;
    my ($type) = $f->get_tag_values("Type");
    return "white" if ($type eq "fgap");
    return "red" if ($type eq "sgap");
  }



1;
