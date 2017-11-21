# Das adaptor for GUS

=head1 NAME

DAS::GUS - DAS-style accession to a gus database

=head1 SYNOPSIS

  # Open up a feature database
  $db = DAS::GUS->new(
      -dsn  => 'dbi:Oracle:sid=GUSDEV;host=localhost;port=1521',
      -user => 'user',
      -pass => 'pass', );
  
  @segments = $db->segment ( -name  => 'AAEE01000001',
                             -start => 1,
                             -end   => 1000000 );
  
  # segments are Bio::Das::SegmentI - compliant objects
  
  # fetch a list of features
  @features = $db->features( -type=>['type1', 'type2', 'type3'] );

  # invoke a callback over features
  $db->features( -type=>['type1', 'type2', 'type3'], 
                 -callback => sub { ... }
         );

  # get all featur types
  @types = $db->types

  # count types
  %types = $db->types( -enumerate=>1 );

  @feature = $db->get_feature_by_name( $class=>$name );
  @feature = $db->get_feature_by_target( $target_name );
  @feature = $db->get_feature_by_attribute( $att1=>$value1, 
                                            $att2=>$value2 );
  $feature = $db->get_feature_by_id( $id );

  $error = $db->error;

=cut

package DAS::GUS;

use strict;
use DAS::GUS::Segment;
use DAS::GUS::QueryLogger;
use Bio::Root::Root;
use Bio::DasI;
use Bio::PrimarySeq;
use DBI;
use Bio::Graphics::Browser2::ConnectionCache;
use Carp qw(longmess);
use vars qw($VERSION @ISA);

use ApiCommonWebsite::Model::SqlXmlParser;

use constant DEBUG => 0;

$VERSION = 0.11;
@ISA = qw(Bio::Root::Root Bio::DasI);

=head2 new

  Title    : new
  Usage    : $db = DAS::GUS->new (
            -dsn  => 'dbi:Oracle:sid=GUSDEV;host=localhost;port=1521',
            -user => 'user',
            -pass => 'pass', );
  Function  : Open up a Bio::DB::DasI interface to a GUS database
  Returns  : a new DAS::GUS object

=cut

sub new {
  my $proto = shift;
  my $self = bless {}, ref($proto) || $proto;
  my %arg = @_;

  my $projectId = $arg{-projectId};

  my $dsn       = $arg{-dsn};
  my $username  = $arg{-user};
  my $password  = $arg{-pass};
  my $sqlfile   = $arg{-sqlfile};
  my $docroot   = $arg{-docroot};

  $self->{db_args}->{dsn}      = $dsn;
  $self->{db_args}->{username} = $username;
  $self->{db_args}->{password} = $password;

  my $dbh = Bio::Graphics::Browser2::ConnectionCache->get_instance->connect($dsn, $username, $password, "GUS");
  #         #17815: Use ConnectionCache to share connection with Configuration.pm
  #         DBI->connect( $dsn, $username, $password ) or $self->throw("unable to open db handle");

  # solve oracle clob problem
  $dbh->{LongTruncOk} = 0;
  $dbh->{LongReadLen} = 10000000;

  # get 500 rows at a time for efficiency.
  $dbh->{RowCacheSize} = 500;

  $self->dbh($dbh);
  $self->parser(ApiCommonWebsite::Model::SqlXmlParser->new($sqlfile, $projectId, 0));

  my @path = split(/\//, $docroot); # /var/www/sfischer.plasmodb.org/..."
  my $site = $path[3]; # sfischer.plasmodb.org
  my $inGenePage = $ENV{QUERY_STRING} =~ 'genepage';
  $self->{queryLogger} = DAS::GUS::QueryLogger->new("/var/www/Common/tmp/gbrowseLogs/$site", $site, $inGenePage);

  return $self;
}

=head2 dbh

  Title    : dbh
  Usage    : $obj->dbh($newval)
  Function : get a database handle
  Returns  : value of dbh (a scalar)
  Args     : on set, new value (a scalar or undef, optional)

=cut

sub dbh {
  my $self = shift;

  return $self->{'dbh'} = shift if @_;
  return $self->{'dbh'};
}

sub getQueryLogger {
  my $self = shift;
  return $self->{queryLogger};
}

=head2 parser

  Title    : parser
  Usage    : $obj->parser($parserObj)
  Function : get an sql parser object
  Returns  : an sql parser object
  Args     : 

=cut

sub parser { 
  my $self = shift; 

  return $self->{'parser'} = shift if @_; 
  return $self->{'parser'}; 
}

=head2 segment

  Title    : segment
  Usage    : $db->segment(@args)
  Function : create a segment object
  Returns  : segment object(s)
  Args     : see below

This method generates a Bio::Das::SegmentI object 
(see L<Bio::Das::SegmentII>).  The segment can be used to find 
overlapping features and the raw sequence.  

When making the segment() call, you specify the ID of a sequence 
landmark (e.g. an accession number, a clone or contig), and a 
positional range relative to the landmark.  If no range is specified, 
then the entire region spanned by the landmark is used to generate 
the segment.

Arguments are -option=E<gt>value pairs as follows:

  -name    ID of the landmark sequence.

  -class   A namespace qualifier. It is not necessary for the 
           database to honor namespace qualifiers, but if it does, 
           this is where the qualifier is indicated.

  -version Version number of the landmark. It is not necessary 
           for the database to honor version, but if it does, 
           this is where the version is indicated.

  -start   Start of the segment relative to landmark. Positions 
           follow standard 1-based sequence rules.  If not 
           specified, defaults to the beginning of the landmark.
  
  -end     End of the segment relative to the landmark. If not 
           specified, defaults to the end of the landmark.

  -atts    Attribute of reference sequence

The return value is a list of Bio::Das::SegmentI objects. If the 
method is called in a scalar context and there are no more than 
one segments that satisfy the request, then it is allowed to return 
the segment. Otherwise, the method must throw a "multiple segment 
exception".

=cut

sub segment {
  my $self = shift;
  my ( $name,$base_start,$stop,$end,$class,$version,$atts ) =
    $self->_rearrange([qw(NAME
        START
        STOP 
        END 
        CLASS 
        VERSION 
        ATTS
       )], @_);

  $end ||= $stop;

  return DAS::GUS::Segment->new( $name,
                                 $self,
                                 $base_start,
                                 $end,
                                 $atts );
}

=head2 features

  Title    : fetures
  Usage    : $db->features(@args)
  Function : get all features, possibly filtered by type
  Returns  : a list of DAS::GUS::Segment::Feature objects
  Args     : see below
  Status   : public

This routine will retrieve features in the database regardless of 
position. It can be used to return all features, or a subset based 
on their method and source.

Arguments are -option=E<gt>value pairs as follows:

  -type       List of feature types to return. Argument is an array of i
              reference containing strings of the format "method:source"

  -callback   A callback to invoke on each feature. The subroutine will
              be passed each Bio::SeqFeatureI object in turn.

  -attributes A has reference containing attributes to match.

  -iterator   Whether to return an iterator across the features

Types are indicated using the nomenclature "method:source". Either of 
these fields can be omitted, in which case a wildcard is used for the
missing field. Type names without the colon (e.g. "exon") are 
interpreted as the method name and a source wild card. Regular 
expression are allowed in either field, as in: "similarity:BLAST.*".

The -attributes argument is a hashref containing one or more 
attributes to match against:

  -attributes => { Gene => 'abc-1',
                   Note => 'confirmed' }

Attribute matching is simple exact string match, and multiple 
attributes are ANDed together.

If one provides a callback, it will be invoked on each feature in 
turn. If the callback returns a false value, iteration will be 
interrupted. When a callback is provided, the method returns undef.

=cut

sub features {
  my $self = shift;
  my ( $type, $types, $callback, $attributes, $iterator, 
       $seq_id, $start, $end ) = 
                $self->_rearrange([qw(TYPE
                                      TYPES
                                      CALLBACK
                                      ATTRIBUTES
                                      ITERATOR
                                      SEQ_ID
                                      START
                                      END
                                      )], @_ );
        
  $type ||= $types;

  if($seq_id) {
    my @features = $self->segment($seq_id, $start, $end)->features(-type => $type);
    return @features; 
  }

  my @features = DAS::GUS::Segment->features(
                      -type       => $type, 
                      -attributes => $attributes,
                      -callback   => $callback, 
                      -iterator   => $iterator, 
                      -factory    => $self, );
  return @features;
}

=head2 get_feature_by_name

  Title   : get_feature_by_name
  Usage   : $db->get_feature_by_name($class => $name)
  Function: fetch features by their name
  Returns : a list of DAS::GUS::Segment::Feature objects
  Args    : the class and the name of the desired feature
  Status  : public

  Note    : You need to modify _feature_get() in Browser.pm currently. 
    Find "return unless @segments;" and change it to "return @segments;"    
    Debug it later. Also see multiple_choice() in gbrowse cgi script for
    getting features\'s attributes

=cut

sub get_feature_by_name {

  my $self = shift;
  my ( $name, $class, $ref, $base_start, $stop ) 
      = $self->_rearrange([qw(NAME CLASS REF START END)], @_);

  my ( @segs, @features, $sth, $segment, $seg_name );

  if( $name ) {  
    $name =~ s/[?*]\s*$/%/; # replace * with % in the sql

    # get features by locus name, genbank accession number or 
    # protein function keywords

    my $query = $self->parser->getSQL("GUS.pm", "get_feature_by_name");
    $query =~ s/(\$\w+)/eval $1/eg;
    $query =~ s/\*/\%/g;
    #my $un = uc($name);
    #$query =~ s/\?/\'\%$un\%\'/g;

    warn "vvvvvvvvvv Start get_feature_by_name vvvvvvvvvvvvv" if DEBUG;
    warn "$query" if DEBUG;
    warn "^^^^^^^^^^ End get_feature_by_name ^^^^^^^^^^^^^^^" if DEBUG;

    $sth = $self->dbh->prepare($query);

    my ($status, $startTime, $endTime) = $self->{queryLogger}->execute($sth);
    $status or $self->throw("getting feature by name query failed");


    while(my $hashref = $sth->fetchrow_hashref) {
      $seg_name = $$hashref{'CTG_NAME'};

      # if this is a segment, return a segment object
      return $self->segment($seg_name) if($seg_name =~ /$name/i);
      $segment = $self->segment($seg_name);

      my $feat = DAS::GUS::Segment::Feature->new(
              $self,
              $segment,               # parent
              $seg_name,              # the source sequence
              $$hashref{'STARTM'},    # start
              $$hashref{'END'},       # end
              $$hashref{'TYPE'}.':'.$$hashref{'SOURCE'},
              $$hashref{'SCORE'},     # score
              $$hashref{'STRAND'},    # strand
              $$hashref{'PHASE'},     # phase 
              $$hashref{'NAME'},      # group
              $$hashref{'ATTS'},      # attributes
              $$hashref{'NAME'},      # unique_name 
              $$hashref{'FEATURE_ID'} # feature_id
            );

      push @features, $feat;
    }
    $self->{queryLogger}->logQuery($startTime, $endTime, $query, "GUS.pm", "get_feature_by_name");
  }
  if (@features) { @features; } else { (); }
}

sub wdk_reference {
  warn ">>>>>>>>>>>>>>>>>";
  my $self = shift;
  my $track_name  = shift;
  warn ">>>>>>>>>>>>>>>>> $self | $track_name";
  my $dbh = $self->dbh;
  my $query = "SELECT name, value FROM ApidbTuning.DataSourceWdkRefText";
  my $sth = $dbh->prepare($query);
  my ($status, $startTime, $endTime) = $self->{queryLogger}->execute($sth);
  $status or $self->throw($sth->errstr);
  while (my ($name, $value)  = $sth->fetchrow_array) {
	  warn ">>> $name => $value";

  }
  $self->{queryLogger}->logQuery($startTime, $endTime, $query, "GUS.pm", "wdk_reference");

  return "test gus";

}

sub seq_ids_length {
  my $self = shift;
  my $dbh = $self->dbh;
  my $query = "SELECT distinct source_id, length FROM ApidbTuning.GenomicSeqAttributes";
  my $sth = $dbh->prepare($query);
  my ($status, $startTime, $endTime) = $self->{queryLogger}->execute($sth);
  $status or $self->throw($sth->errstr);
  my @result;
  while (my $rowref = $sth->fetchrow_arrayref) {
    push @result,[@$rowref];
  }
  $self->{queryLogger}->logQuery($startTime, $endTime, $query, "GUS.pm", "seqs_id_length");
  return @result;
}

sub default_class { return 'Sequence' }

# Compatible with other gbrowse related scripts - e.g. das
sub aggregators { return }

sub absolute { return }

sub reconnect {
  my $self = shift;
  my $dsn  = $self->{db_args}->{dsn};
  my $user = $self->{db_args}->{username};
  my $pass = $self->{db_args}->{password};

  my $new_dbh = DBI->connect($dsn,$user,$pass) or $self->throw($DBI::errstr);
  $self->{dbh} = $new_dbh;

}

sub clone {
    my $self = shift;
  # my $dsn  = $self->{db_args}->{dsn};
  # my $user = $self->{db_args}->{username};
  # my $pass = $self->{db_args}->{password};

  # $self->{dbh}->{InactiveDestroy} = 1;
  # my $new_dbh = DBI->connect($dsn,$user,$pass) or $self->throw($DBI::errstr);
  # $new_dbh->{InactiveDestroy} = 1;
  # $self->{dbh} = $new_dbh unless $self->is_temp;

  $self->{dbh}{InactiveDestroy} = 1;
  $self->{dbh} = $self->{dbh}->clone();
}

sub DESTROY {
  my $self = shift;
  $self->dbh->disconnect;
  return;
} 

sub get_seq_stream {
   my $self = shift;

   my ($type,$types,$callback,$attributes,$iterator,$feature_id,$seq_id,$start,$end,$sqlName,$sqlParam) = 
            $self->_rearrange([qw(TYPE TYPES CALLBACK ATTRIBUTES ITERATOR FEATURE_ID SEQ_ID START END SQLNAME SQLPARAM)], @_); 

  my $seg = $self->segment(-name    => $seq_id,
                           -factory => $self,
                           -start   => $start,
                           -stop    => $end );

  my @features = $seg->features(-type       => $type,
                                -attributes => $attributes,
                                -callback   => $callback,
                                -iterator   => $iterator,
                                -factory    => $self,
                                -feature_id =>$feature_id,
                                -seq_id     =>$seq_id,
                                -start      =>$start,
                                -end        =>$end,
                                -sqlName    => $sqlName,
                                -sqlParam   => $sqlParam,
                              );

  return DAS::GUSIterator->new(\@features);
}

package DAS::GUSIterator;

sub new {

  my $package = shift;
  my $features = shift;
  return bless $features, $package;
}

sub next_seq {

  my $self = shift;
  return unless @$self;

  my $next_feature = shift @$self;
  return $next_feature;
}

1;
