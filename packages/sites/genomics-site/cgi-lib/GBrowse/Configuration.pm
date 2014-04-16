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

sub lookupOrganismDirectory {
  my ($self, $orgAbbrev) = @_;

  if($self->{_organism_directory_map}->{$orgAbbrev}) {
    return $self->{_organism_directory_map}->{$orgAbbrev};
  }

  my $dbh = $self->dbh();
  my $sh = $dbh->prepare("select abbrev, name_for_filenames from apidb.organism");
  $sh->execute();

  my $rv = "ORGANISM_WEBSERVICE_DIR";
  while(my ($abbrev, $name) = $sh->fetchrow_array()) {
    $self->{_organism_directory_map}->{$abbrev} = $name;
    $rv = $name if($abbrev eq $orgAbbrev);
  }

  $sh->finish();
  return $rv;
}


sub bam_file_path {
  my ($self, $orgAbbrev) = @_;

  if($orgAbbrev) {
    my $orgDirName = $self->lookupOrganismDirectory($orgAbbrev);
    return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". site_version. "/$orgDirName/bam";
  }

  return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". site_version. '/bam';
}

sub bigwig_file_path {
  my ($self, $orgAbbrev) = @_;

  if($orgAbbrev) {
    my $orgDirName = $self->lookupOrganismDirectory($orgAbbrev);
    return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". site_version. "/$orgDirName/bigwig";
  }

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

sub citationFromExtDatabaseNamePattern {
  my ($self,$extdb) = @_;

  my $sql =<<EOL;
WITH pubs as (select name, 
                     id, 
                     listagg(publication,',') WITHIN GROUP (order by publication) PMIDS, 
                     contact_email 
                from ( SELECT nvl(ds.dataset_name_pattern, ds.name) as name, 
                              ds.dataset_presenter_id as id, 
                              c.email as contact_email,
                              p.pmid as publication 
                         from ApidbTuning.DatasetPresenter ds,
                              APIDBTUNING.datasetcontact c,
                              APIDBTUNING.datasetpublication p
                        where ds.dataset_presenter_id = c.dataset_presenter_id 
                          and ds.dataset_presenter_id = p.dataset_presenter_id 
                          and ((ds.name = '$extdb' and ds.dataset_name_pattern is null) or ds.dataset_name_pattern = '$extdb')
                          and c.is_primary_contact =1 )
                     group by name, id, contact_email),
                     samples as ( select experiment, 
                                         listagg(sample_i,chr(10)) WITHIN GROUP (order by sample) sample_table
                                    from ( select (substr(internal_id, 0,instr('|', internal_id) - 1)) as experiment,
                                                  sample,
                                                  '<p style="color:' || html_color || '">' || sample || '<\p>' as sample_i
                                             from APIDBTUNING.massspecterms 
                                             where internal_id like '$extdb%'
                                          )
                                    group by experiment
                                           
                                 )
SELECT name, 
       dbms_lob.substr(description,4000,1) ||
       ' Primary Contact Email: '|| nvl(email,'unavailable')||
       ' PMID: ' || publications || 
       '<p style="color:black">Samples:<\p>' || sample_table || chr(10) ||
       ' Please note that subtrack labels will disappear if the selected subtracks number is over 15!' as citation 
  FROM (SELECT nvl(ds.dataset_name_pattern, ds.name) as name, 
               ds.summary as description, 
               pubs.contact_email as email, 
               pubs.PMIDS as publications,
               samples.sample_table as sample_table
          FROM ApidbTuning.DatasetPresenter ds, 
               pubs,
               samples
         where ds.dataset_presenter_id = pubs.id )
EOL
  my $sth = $self->{dbh}->prepare($sql);
  $sth->execute() or $self->throw($sth->errstr);
  while (my ($name,$value)  = $sth->fetchrow_array) {
    return "$value";
  }

}

1;
