package GBrowse::Configuration;

@main::rainbow = qw(red green yellow blue khaki pink orange cyan purple);

use ApiCommonWebsite::Model::ModelConfig;
use EuPathSiteCommon::Model::ModelXML;

use ApiCommonWebsite::Model::DbUtils;

use DAS::Util::SynView; 

use HTML::Template;

require Exporter;

umask 0;

# Export Static Methods
@ISA = qw(Exporter);
@EXPORT = qw(init hover myfooter myheader mypostgrid site_version);  

sub new {
  my $class = shift;
  my $self  = { track_no => 0 };

  my $projectId = $ENV{PROJECT_ID};
  my $c = new ApiCommonWebsite::Model::ModelConfig($projectId);
  my $dsn = ApiCommonWebsite::Model::DbUtils->resolveOracleDSN($c->appDb->dbiDsn);
  my $user = $c->appDb->login;
  my $pass = $c->appDb->password;
  my $dbh = DBI->connect( $dsn, $user, $pass)
        or $self->throw("unable to open db handle");
  bless ($self, $class);
  $self->dbh($dbh);
  $self->{dbh}{InactiveDestroy} = 1;
  return $self;
}

sub dbh {
  my $self = shift;

  return $self->{'dbh'} = shift if @_; 
  return $self->{'dbh'};
}

sub init {
  my ($file) = shift; # the xml file
  my $projectId = $ENV{PROJECT_ID};
  my $docRoot = $ENV{DOCUMENT_ROOT};
  my $c = new ApiCommonWebsite::Model::ModelConfig($projectId);
  my $resolvedDsn = ApiCommonWebsite::Model::DbUtils->resolveOracleDSN($c->appDb->dbiDsn);
  { -sqlfile   => $ENV{GUS_HOME} . '/lib/xml/gbrowse/' . $file,
    -dsn       => $resolvedDsn,
    -user      => $c->appDb->login,
    -pass      => $c->appDb->password,
    -projectId => $projectId,
    -docroot   => $docRoot
  }
}

sub site_version {

  my $versionType = shift || 'buildNumber' ; # version type is releaseVersion or buildNumber 

  my $model = EuPathSiteCommon::Model::ModelXML->new('apiCommonModel.xml');
  my $projectId = $ENV{PROJECT_ID};

  if($versionType eq 'buildNumber') {
    return $model->getBuildNumberByProjectId($projectId);
  }

  return->getSiteVersionByProjectId($projectId);
}

sub bam_file_path {
  return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". site_version. '/bam';
}

sub bigwig_file_path {
  return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". site_version. '/bigwig';
}

sub userDB {
  my $projectId = $ENV{PROJECT_ID};
  my $c = new ApiCommonWebsite::Model::ModelConfig($projectId);
  my $resolvedDsn = ApiCommonWebsite::Model::DbUtils->resolveOracleDSN($c->userDb->dbiDsn);
  return { 
     -dsn     => $resolvedDsn,
     -user    => $c->userDb->login,
     -pass    => $c->userDb->password,
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
    my $span = $feat->{start} . '-' . $feat->{end};
    $self->{$name}->{$span}++ < $depth;
}

sub popup_template { 
  my ($self, $name, $data) = @_; 
  my $tmpl = HTML::Template->new(filename => $ENV{DOCUMENT_ROOT}.'/gbrowse/hover.tmpl'); 
  $tmpl->param(DATA => [ map { { Key => $_->[0], Value => $_->[1], } } @$data ]); 
  my $str = $tmpl->output; 
  $str =~ s/'/\\'/g; 
  $str =~ s/\s+$//; 
  $str =~ s/\\n//; 
  return qq{" onmouseover="$cmd;return escape('$str') };
}


sub hover {
  my ($f, $data) = @_;

  my $type = $f->type;
  my $name = $f->feature_id;
  my $base = "$ENV{DOCUMENT_ROOT}/gbrowse/tmp";

  mkdir "$base/$type", 0777 unless -d "$base/$type";
  unless(-e "$base/$type/$name") {
    open F, ">$base/$type/$name";
    foreach(@$data) {
      my ($k, $v) = @$_;
      print F "$k\t$v\n";
    }
    close F;
  }
  return "url:/cgi-bin/gp?t=$type&n=$name";
}


sub oldhover {
  my ($name, $data) = @_;
  my $tmpl = HTML::Template->new(filename => $ENV{DOCUMENT_ROOT}.'/gbrowse/hover.tmpl');
  $tmpl->param(DATA => [ map { { @$_ > 1 ? (KEY => $_->[0], VALUE => $_->[1]) : (SINGLE => $_->[0]) } } @$data ]);
  my $str = $tmpl->output;
  $str =~ s/'/\\'/g;
  $str =~ s/\"/&quot;/g;
  $str =~ s/\s+$//;
  my $cmd = "this.T_STICKY=true;this.T_TITLE='$name'";
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

sub myfooter { 
  return qq(<hr><!--#include virtual='/a/footer.jsp' -->); 
}

sub myheader {
  return qq(<!--#include virtual='/a/header.jsp?originParam=http://$ENV{SERVER_NAME}$ENV{REQUEST_URI}'-->);
}

sub mypostgrid { 
  return DAS::Util::SynView::postgridGB2(@_);
} 

sub wdkReference {
  my ($self,$extdb, $key) = @_;

  my $sql = "SELECT t.name, t.value FROM ApiDB.DataSource d, ApidbTuning.DataSourceWdkRefText t, apidbtuning.datasourcewdkreference w where d.data_source_id = w.data_source_id and w.target_type='gbrowse_track' and d.name='$extdb' and w.data_source_id = t.data_source_id and t.name = '$key' ";
  my $sth = $self->{dbh}->prepare($sql);
  $sth->execute() or $self->throw($sth->errstr);
  while (my ($name, $value)  = $sth->fetchrow_array) {
    return "$value";
  }
}

1;
