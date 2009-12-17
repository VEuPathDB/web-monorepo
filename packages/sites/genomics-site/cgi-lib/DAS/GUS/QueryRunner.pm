package  DAS::GUS::QueryRunner;

require Exporter;
@ISA = qw(Exporter);
@EXPORT_OK = qw(executeQuery); 

use Time::HiRes qw ( time );
use FileHandle;

sub new {
    my ($class) = @_;
    my $self = {};

    if ($ENV{GBROWSE_SQL_LOG}) {
	$self->{logHandle} = FileHandle->new("> $ENV{GBROWSE_SQL_LOG}");
	die "Can't open gbrowse log file (as set in env variable \$GBROWSE_SQL_LOG)\n";
    }
    bless($self,$class);
    return $self;
}

sub executeQuery {
    my ($self, $sth, $sql, $queryName, $logging);
    my $start_time = time();
    $sth->execute();
    if ($self->{logHandle}) {
	my $elapsed_time = time() - $start_time;
	print $self->{logHandle} "=========================================================\n";
	print $self->{logHandle} "QUERYTIME\t" . localtime() . "\t$queryName\t" . sprintf("%.2f sec", $elapsed_time) . "\n";
	print $self->{logHandle} "=========================================================\n";
	print $self->{logHandle} "$sql\n\n"
    }
}
