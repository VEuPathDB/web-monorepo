package GBrowse::Configuration;

@main::rainbow = qw(red green yellow blue khaki pink orange cyan purple);

use WDK::Model::ModelConfig;
use EbrcWebsiteCommon::Model::ModelXML;
use WDK::Model::DbUtils;
use Bio::Graphics::Browser2::ConnectionCache;

use DAS::Util::SynView;

use HTML::Template;

use LWP::UserAgent;
use JSON qw( decode_json );

require Exporter;


use Data::Dumper;
umask 0;

# Export Static Methods
@ISA = qw(Exporter);
@EXPORT = qw(init hover myfooter myheader mypostgrid);

sub new {
  my $class = shift;
  my $self  = { track_no => 0 };

  my $projectId = $ENV{PROJECT_ID};
  my $c = new WDK::Model::ModelConfig($projectId);
  my $dsn = WDK::Model::DbUtils->resolveOracleDSN($c->appDb->dbiDsn);
  my $user = $c->appDb->login;
  my $pass = $c->appDb->password;
  my $dbh = Bio::Graphics::Browser2::ConnectionCache->get_instance->connect($dsn, $user, $pass, "Configuration");
  $dbh->{'LongReadLen'} = 500000;  ##increase as overflowing in intron junction track
  #         #17815: Use ConnectionCache to share connection with GUS.pm
  #         DBI->connect( $dsn, $user, $pass) or $self->throw("unable to open db handle");
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
  my $c = new WDK::Model::ModelConfig($projectId);
  my $resolvedDsn = WDK::Model::DbUtils->resolveOracleDSN($c->appDb->dbiDsn);
  { -sqlfile   => $ENV{GUS_HOME} . '/lib/xml/gbrowse/' . $file,
    -dsn       => $resolvedDsn,
    -user      => $c->appDb->login,
    -pass      => $c->appDb->password,
    -projectId => $projectId,
    -docroot   => $docRoot
  }
}

# sub site_version {
# 
#   my $versionType = shift || 'buildNumber' ; # version type is releaseVersion or buildNumber 
# 
#   my $model = EbrcWebsiteCommon::Model::ModelXML->new('apiCommonModel.xml');
#   my $projectId = $ENV{PROJECT_ID};
# 
#   if($versionType eq 'buildNumber') {
#     return $model->getBuildNumberByProjectId($projectId);
#   }
# 
#   return->getSiteVersionByProjectId($projectId);
# }

sub getBuildNumber {

  my ($self) = @_;

  unless ($self->{_site_version}) {
    my $model = EbrcWebsiteCommon::Model::ModelXML->new('apiCommonModel.xml');
    my $projectId = $ENV{PROJECT_ID};
    $self->{_site_version} = $model->getBuildNumberByProjectId($projectId);
  }

    return $self->{_site_version};
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
    return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". $self->getBuildNumber. "/$orgDirName/bam";
  }

  return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". $self->getBuildNumber. '/bam';
}

sub bigwig_file_path {
  my ($self, $orgAbbrev) = @_;

  if($orgAbbrev) {
    my $orgDirName = $self->lookupOrganismDirectory($orgAbbrev);
    return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". $self->getBuildNumber. "/$orgDirName/bigwig";
  }

  return "/var/www/Common/apiSiteFilesMirror/webServices/$ENV{PROJECT_ID}/build-". $self->getBuildNumber. '/bigwig';
}

sub auxiliaryFilePath {
    my ($self) = @_;

    return "/var/www/Common/apiSiteFilesMirror/auxiliary/$ENV{PROJECT_ID}";
}

sub userDB {
  my $projectId = $ENV{PROJECT_ID};
  my $c = new WDK::Model::ModelConfig($projectId);
  my $resolvedDsn = WDK::Model::DbUtils->resolveOracleDSN($c->userDb->dbiDsn);
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
  my ($f, $data, $spanLast) = @_;

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
  return "url:/cgi-bin/gp?t=$type&n=$name".($spanLast ? "&c=yes" : "");
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
  # return getPageContent("http://$ENV{SERVER_NAME}/a/footer.jsp");
  return qq(<hr><!--#include virtual='/a/footer.jsp' -->); 
}

sub myheader {
  # return getPageContent("http://$ENV{SERVER_NAME}/a/header.jsp?originParam=http://$ENV{SERVER_NAME}$ENV{REQUEST_URI}");
  return qq(<!--#include virtual='/a/header.jsp?originParam=http://$ENV{SERVER_NAME}$ENV{REQUEST_URI}'-->);
}

sub getPageContent {
  my ($url) = @_;
  my $ua = LWP::UserAgent->new;
  $ua->timeout(10);
  my $response = $ua->get($url);
  if ($response->is_success) {
    return $response->decoded_content;
  }
  else {
    return "Unable to get content of $url " . $response->message;
  }
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



sub citationAndText {
    my ($self, $extdb, $text) = @_;

    my $citation = $self->citationFromExtDatabaseNamePattern($extdb);
    return $citation . $text;
}



sub citationFromExtDatabaseNamePattern {
  my ($self,$extdb) = @_;

  if(defined $self->{citation_from_ext_database_name_pattern}) {
    return $self->{citation_from_ext_database_name_pattern}->{$extdb};
  }

  my $sql =<<EOL;
WITH pubs as (select name, id, listagg(publication,',') WITHIN GROUP (order by publication) PMIDS, contact_email from ( SELECT nvl(ds.dataset_name_pattern, ds.name) as name, ds.dataset_presenter_id as id, c.email as contact_email, p.pmid as publication from ApidbTuning.DatasetPresenter ds, APIDBTUNING.datasetcontact c,APIDBTUNING.datasetpublication p where ds.dataset_presenter_id = c.dataset_presenter_id and ds.dataset_presenter_id = p.dataset_presenter_id and c.is_primary_contact =1 )group by name, id, contact_email)
SELECT name, dbms_lob.substr(description,3800,1) || '<br/>' || ' Primary Contact Email: '||nvl(email,'unavailable')|| '<br/>' || ' PMID: ' || publications as citation 
FROM (SELECT nvl(ds.dataset_name_pattern, ds.name) as name, CASE WHEN ds.description IS NULL THEN ds.summary ELSE ds.description END AS description, pubs.contact_email as email, pubs.PMIDS as publications FROM ApidbTuning.DatasetPresenter ds, pubs where ds.dataset_presenter_id = pubs.id(+) )
EOL
  my $sth = $self->{dbh}->prepare($sql);
  $sth->execute() or $self->throw($sth->errstr);

  while (my ($name,$value)  = $sth->fetchrow_array) {
    $self->{citation_from_ext_database_name_pattern}->{$name} = $value;
  }

  return $self->{citation_from_ext_database_name_pattern}->{$extdb};  
}

sub proteomicsCitationFromExtDatabaseName {
  my ($self,$extdb) = @_;

  if(defined $self->{proteomics_citation_from_ext_database_name}) {
    return $self->{proteomics_citation_from_ext_database_name}->{$extdb};
  }

  my $sql =<<EOL;
    select name, citation
    from ApidbTuning.ProteomicsCitation
EOL
  my $sth = $self->{dbh}->prepare($sql);
  $sth->execute() or $self->throw($sth->errstr);
  
  while (my ($name,$value)  = $sth->fetchrow_array) {
    
    $self->{proteomics_citation_from_ext_database_name}->{$name} = $value;
  }
  $sth->finish();

  return $self->{proteomics_citation_from_ext_database_name}->{$extdb};
}

sub getPbrowseOntologyCategoryFromTrackName {
  my ($trackName, $allTracks, $optionalTerminus) = @_;
  &getOntologyCategoryFromTrackName($trackName, $allTracks, $optionalTerminus,  'pbrowse');
}



sub getOntologyCategoryFromTrackName {
  my ($trackName, $allTracks, $optionalTerminus, $optionalScope) = @_;

  my $scope = $optionalScope ? $optionalScope : 'gbrowse';

  if($self->{_ontology_category_from_track_name}->{$trackName}) {
    $rv = $self->{_ontology_category_from_track_name}->{$trackName};
  }
  else {
    my $ua = LWP::UserAgent->new;
  
    my $server_endpoint = "https://$ENV{HTTP_HOST}/$ENV{CONTEXT_PATH}/service/ontologies/Categories/filteredOntologyTerms";

    # set custom HTTP request header fields
    my $req = HTTP::Request->new(POST => $server_endpoint);
    $req->header('content-type' => 'application/json');
 
    # add POST data to HTTP request body
    my $post_data = "{ 'scope': '$scope' }";
    $req->content($post_data);
 
    my $resp = $ua->request($req);
    if ($resp->is_success) {
      my %allTracks;

      foreach(@$allTracks) {
        $allTracks{$_} = 1;
      }

      my $decoded_json = decode_json( $resp->decoded_content  );

      my %trackNameToPathHashRef;
      my %nodeDisplayOrder;

      my $reallyBigOrderNumber = 10000000;

      foreach my $pathArrayRef (@$decoded_json) {

        my @pathLabels;

        my $lastIndex = scalar @$pathArrayRef - 1;

        my $track = $pathArrayRef->[$lastIndex]->{name}->[0];

        next unless($allTracks{$track});

        for(my $i = 1; $i < $lastIndex; $i ++) {
          my $pathLabel = $pathArrayRef->[$i]->{'EuPathDB alternative term'}->[0];

          my $displayOrder = defined $pathArrayRef->[$i]->{'display order'} ? $pathArrayRef->[$i]->{'display order'}->[0] : $reallyBigOrderNumber;

          push @pathLabels, $pathLabel;
          $nodeDisplayOrder{$pathLabel} = $displayOrder;
        }


        $trackNameToPathHashRef{$track} = \@pathLabels;
      }
  
      my @sortedNodeNames = sort { $nodeDisplayOrder{$a} <=> $nodeDisplayOrder{$b} || $a cmp $b } keys(%nodeDisplayOrder);
      my $neededZeros = length(scalar(@sortedNodeNames)) - 1;

      for(my $i = 0; $i < scalar @sortedNodeNames; $i++) {

        my $orderPrefix = sprintf("%0${$neededZeros}d", $i+1);

        # replace w/ new display order
        $nodeDisplayOrder{$sortedNodeNames[$i]} = $orderPrefix;

      }

      foreach my $trackName (keys %trackNameToPathHashRef) {
        my $pathLabels = $trackNameToPathHashRef{$trackName};
        my $firstNode = $pathLabels->[0];
        $pathLabels->[0] = $nodeDisplayOrder{$firstNode} . " $firstNode";

        my $pathLabelsAsString = join(" : ", @$pathLabels);
        $trackNameToPathHashRef{$trackName} = $pathLabelsAsString;
      }

      $self->{_ontology_category_from_track_name} = \%trackNameToPathHashRef;
    }
    else {
      print STDERR "HTTP POST error code: ", $resp->code, "\n";
      print STDERR "HTTP POST error message: ", $resp->message, "\n";
    }
    $rv = $self->{_ontology_category_from_track_name}->{$trackName};
  }

  if($optionalTerminus) {
    return "$rv : $optionalTerminus";
  }
  return $rv;
}

sub getSyntenySubtracks {
    my ($self) = @_;
    my $dbh = $self->dbh();
    my $sh = $dbh->prepare("select organism, public_abbrev,  phylum, kingdom, genus, species, class  from apidbtuning.OrganismSelectTaxonRank order by kingdom, class, phylum, genus, species, organism");
    $sh->execute();
    my @rv;
    my @synTypes = ('span','gene');

    my $i = 1;
    while (my ($organism, $publicAbbrev, $phylum, $kingdom, $genus, $species, $class)= $sh->fetchrow_array()){
	foreach my $synType (@synTypes) { 

          # strip off "-" and "." from public abbrev
          my $cleanPublicAbbrev = $publicAbbrev;
          $cleanPublicAbbrev =~ s/[\.-]//g;

        my $displaySynType = $synType eq 'span' ? 'contig' : 'genes';
	my $displayName = ":$publicAbbrev $displaySynType";
	my $urlName = "=${cleanPublicAbbrev}_$synType";
	my $synRow = [$displayName, $kingdom, $class, $phylum, $genus, $species, $organism, $synType, $urlName];

	push @rv, $synRow;
	}
    }

    $sh->finish();
    return @rv;
}


sub subTrackTable {
    my ($self, $experimentName, $subTrackAttr, $type) = @_;
    if ($subTrackAttr eq 'no_sub') {
        return;
    }

    my $dbh = $self->dbh();
    my $sh = $dbh->prepare("SELECT * FROM (
                                SELECT DISTINCT property AS term
                                , value
                                , value as display
                                FROM apidbtuning.InferredChars
                                WHERE dataset_name = '$experimentName'
                                UNION
                                SELECT DISTINCT property AS term
                                , value
                                , value as display
                                FROM apidbtuning.InferredParams
                                WHERE dataset_name = '$experimentName'
                                UNION
                                SELECT DISTINCT 'name' AS term
                                , pan_name as value
                                , replace(replace(regexp_replace(pan_name, '\\(.+\\)', ''), '_smoothed', ''), '_', ' ') as display
                                FROM apidbtuning.DefaultChars
                                WHERE dataset_name = '$experimentName'
                                AND (pan_name like '%$type%' OR '$type' = 'none')
                                )
                            WHERE term = '$subTrackAttr'");
    $sh->execute();
    my @subtrackTable;
    while (my ($term, $value, $display) = $sh->fetchrow_array()) {
        push (@subtrackTable, [":$display", $value]);
    }
    $sh->finish();

    return @subtrackTable;
}



sub subTrackSelect {
    my $subTrackAttr = shift;
    if ($subTrackAttr eq 'no_sub') {
        return;
    }

    my $ontologyTermToDisplayName = {'Antibody' => 'Antibody', 
                                     'Parasite genotype' => 'Genotype', 
                                     'name' => 'Name',
                                     'Compound' => 'Treatment',
                                     'Replicate' => 'Replicate',
                                     'Parasite lifecycle stage' => 'Lifecycle Stage',
                                     'immunoglobulin complex, circulating' => 'Antibody',
                                     'Parasite strain'   => 'Strain'};

    my $displayName = $ontologyTermToDisplayName->{$subTrackAttr};
    my $subTrackSelect = [$displayName, 'tag_value', $subTrackAttr];
    return $subTrackSelect;
}
1;   

