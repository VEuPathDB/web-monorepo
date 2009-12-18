package  DAS::GUS::QueryRunner;

require Exporter;
@ISA = qw(Exporter);
@EXPORT_OK = qw(executeQuery);

use Time::HiRes qw ( time );
use Fcntl qw(:flock SEEK_END);;

sub new {
    my ($class) = @_;
    my $self = {};

    if ($ENV{GBROWSE_SQL_LOG}) {
	open($self->{logHandle},">> $ENV{GBROWSE_SQL_LOG}") ||
	  die "Can't open gbrowse log file (as set in env variable \$GBROWSE_SQL_LOG)\n";
    }
    bless($self,$class);
    return $self;
}

sub executeQuery {
    my ($self, $sth, $sql, $queryName) = @_;
    my $start_time = time();
    $sth->execute();
    if ($self->{logHandle}) {
        my $fh = $self->{logHandle};
	my $elapsed_time = time() - $start_time;
        lock($fh);
	print $fh "============================================================================\n";
	print $fh "QUERYTIME\t" . localtime() . "\t$queryName\t" . sprintf("%.2f sec", $elapsed_time) . "\n";
	print $fh "============================================================================\n";
	print $fh "$sql\n\n";
	unlock($fh);
    }
}

sub lock {
  my ($fh) = @_;
  flock($fh, LOCK_EX) or die "Cannot lock gbrowse log - $!\n";

  # and, in case someone appended while we were waiting...
  seek($fh, 0, SEEK_END) or die "Cannot seek - $!\n";
}

sub unlock {
  my ($fh) = @_;
  flock($fh, LOCK_UN) or die "Cannot unlock gbrowse log - $!\n";
}

