package  DAS::GUS::QueryRunner;

require Exporter;
@ISA = qw(Exporter);
@EXPORT_OK = qw(executeQuery); 

use Time::HiRes qw ( time );

sub executeQuery {
    my ($sth, $sql, $queryName, $logging);
    my $start_time = time();
    $sth->execute();
    if ($logging) {
	my $elapsed_time = time() - $start_time;
	print STDERR "=========================================================\n";
	print STDERR "QUERYTIME\t" . localtime() . "\t$queryName\t" . sprintf("%.2f sec", $elapsed_time) . "\n";
	print STDERR "=========================================================\n";
	print STDERR "$sql\n\n"
    }
}
