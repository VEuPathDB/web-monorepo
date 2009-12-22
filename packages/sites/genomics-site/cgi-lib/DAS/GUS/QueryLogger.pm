package  DAS::GUS::QueryRunner;

use Time::HiRes qw ( time );
use Fcntl qw(:flock SEEK_END);
use File::Path qw(make_path);

# Log gbrowse queries.
# file locking is commented out, as it is probably overkill and a bit dangerous.

sub new {
    my ($class, $logFileDirectory) = @_;
    my $self = {};

    if ($logFileDirectory) {
      make_path($logFileDirectory);
      my $logFile = "$logFileDirectory/log1";
      open($self->{logHandle},">> $logFile") ||
	die "Can't open gbrowse log file '$logFile'\n";
    }
    bless($self,$class);
    return $self;
}

sub executeQuery {
    my ($self, $sth, $sql, $moduleName, $queryName, $range, $inGenePage) = @_;
    my $start_time = time();
    $sth->execute();

    if ($self->{logHandle}) {
      my $elapsed_time = time() - $start_time;
      if ($elapsed_time > .01) {
        my $fh = $self->{logHandle};
#        lock($fh);
	print $fh "============================================================================\n";
	print $fh "QUERYTIME\t" . localtime() . "\t$moduleName\t$queryName\t" . sprintf("%.2f sec", $elapsed_time) . "\n";
	print $fh "============================================================================\n";
	print $fh "$sql\n\n";
#	unlock($fh);
      }
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

