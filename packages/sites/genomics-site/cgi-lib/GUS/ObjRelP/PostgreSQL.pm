package GUS::ObjRelP::PostgreSQL;

############################################################
#
# Package:	PostgreSQL
# Description:	To support a PostgreSQL implementation of 
#		GUS, instantiate this class from 
#		DbiDatabase.pm.   Methods return sql
#		strings to query the system tables.
#		Note: In PostgreSQL, the system tables 
#		have lowercase names.
#
# Modified    By                 Description
# _________________________________________________________
#
# 3/22/2004   Jason Hackney      Created
#
############################################################

use strict;
use Carp;

############################################################
# Constructor
############################################################
sub new{
	my ($class)=@_;
	my $self={};
	bless $self, $class;
	return $self;
}

############################################################
# dateFunction
#
# Return the function that is used by the database engine 
# to return the current date/timestamp.
############################################################
sub dateFunction{
	my($self)=@_;
	return "now()";
}

############################################################
# sequenceIdSql
#
# Query the system tables to get (schemaname, sequencename) 
# Return them in uppercase.
############################################################
sub sequenceIdSql{
	my($self)=@_;
	return "select upper(schemaname),upper(relname) from pg_statio_user_sequences";
}

############################################################
# tableChildRelationsSql
#
# Return a list of (foreignSchema,selfSchema,selfTable,
# selfColumn,foreignTable,foreignColumn) for all foreign key 
# constraints within a schema (i.e., $owner).
############################################################
sub tableChildRelationsSql{
	my ($self,$owner)=@_;
	$owner=~tr/A-Z/a-z/;
	return "select  distinct n2.nspname,n1.nspname, r2.relname,a2.attname, r1.relname, a1.attname from    pg_namespace n1, pg_namespace n2, pg_class r1, pg_class r2, pg_attribute a1, pg_attribute a2, pg_constraint c where   n1.nspname = '$owner' and r1.relnamespace = n1.oid and r1.oid = c.conrelid and r1.oid = a1.attrelid and c.contype = 'f' and c.confrelid = r2.oid and r2.relnamespace = n2.oid and c.conkey[1] = a1.attnum and c.confkey[1] = a2.attnum and a2.attrelid = r2.oid";
}

############################################################
# attributeSql
#
# Returns attributes (columnName, dataType, nullable
# ('Y' or 'N'), columnId, dataPrecision, dataLength, dataScale)
# about the columns from a given table in a schema
############################################################
sub attributeSql{
	my($self,$owner,$table)=@_;
	$table=~tr/A-Z/a-z/;
	$owner=~tr/A-Z/a-z/;
	return "select a.attname as colname, t.typname as typ, case when a.attnotnull then 'N' else 'Y' end as nullable, a.attnum as colid , case when a.atttypid=21 then 16 when a.atttypid=23 then 32 when a.atttypid=20 then 64 when a.atttypid=1700 then (a.atttypmod-16)&65535 when a.atttypid=700 then 24 when a.atttypid=701 then 53 else null end as precision, case when a.atttypmod < 0 then null else a.atttypmod-4 end as data_length, case when  a.atttypid=21::oid or a.atttypid=23::oid or a.atttypid=20::oid then 0 when a.atttypid=1700::oid then (a.atttypmod-4)&65535 else null  end as scale from pg_attribute a, pg_class c, pg_type t, pg_namespace n where a.attrelid=c.oid and a.atttypid=t.oid and a.attnum > 0 and c.relname='$table' and n.nspname='$owner' and c.relnamespace=n.oid";
}

############################################################
# viewSql
#
# returns the sql statement that was used to 
# create a view ($table) in a given schema
############################################################
sub viewSql{
	my($self,$owner,$table)=@_;
	$owner=~tr/A-Z/a-z/;
	$table=~tr/A-Z/a-z/;
	return "select definition from pg_views where schemaname='$owner' and viewname='$table'";
}

############################################################
# parentRelationsSql
#
# Returns (selfSchema,selfTable,sefColumn,parentSchema,
# parentTable,parentColumn) for a particular table in a 
# schema. The return values are all upper case.
############################################################
sub parentRelationsSql{
	my ($self,$owner,$table)=@_;
	$owner=~tr/A-Z/a-z/;
	$table=~tr/A-Z/a-z/;
	return "select  distinct upper(n1.nspname), upper(r1.relname), upper(a1.attname), upper(n2.nspname), upper(r2.relname), upper(a2.attname) from pg_namespace n1, pg_namespace n2, pg_class r1, pg_class r2, pg_attribute a1, pg_attribute a2, pg_constraint c where r1.relname = '$table' and n1.nspname = '$owner' and r1.relnamespace = n1.oid and r1.oid = c.conrelid and r1.oid = a1.attrelid and c.contype = 'f' and c.confrelid = r2.oid and r2.relnamespace = n2.oid and c.conkey[1] = a1.attnum and c.confkey[1] = a2.attnum and a2.attrelid = r2.oid";
}                                       

############################################################
# primaryKeySql
#
# Return the primary key for a table in a schema.
############################################################
sub primaryKeySql{
	my($self,$owner,$table)=@_;
	$table=~tr/A-Z/a-z/;
	$owner=~tr/A-Z/a-z/;
	return " select distinct a.attname
       from    pg_namespace n,
               pg_class r,
               pg_attribute a,
               pg_constraint c
       where    n.nspname = '$owner' and
               r.relname = '$table' and
               n.oid = r.relnamespace and
               r.oid = a.attrelid and
               r.oid = c.conrelid and
               c.contype = 'p' and
               c.conkey[1] = a.attnum";
}

############################################################
# nextValSql
#
# Returns the sql to generate the select statement for next value in a sequence.
############################################################
sub nextValSelect{
	my($self,$table)=@_;
	$table=~tr/A-Z/a-z/;
	return "select nextval('${table}_sq')";
}

############################################################
# nextVal
#
# Returns the sql for the next value in a sequence,
# to be used directly in a statement, such as an insert.
############################################################
sub nextVal{
	my($self,$table)=@_;
	return "nextval('${table}_sq')";
}

############################################################
# dateFormatSql
#
# Tell the database engine in what format you will be 
# entering date/time information.
############################################################
sub dateFormatSql{
	my($self,$dateFormat)=@_;
	if($dateFormat=~/YYYY[\/\-]MM[\/\-]DD/i){
		return "set datestyle='ISO'";
	}
	elsif($dateFormat=~/MM[\/\-]DD[\/\-]YYYY/i){
		return "set datestyle='SQL'";
	}
	elsif($dateFormat=~/DD[\/\-]MM[\/\-]YYYY/){
		return "set datestyle='European'";
	}
	else{
		print STDERR "Can't parse date format: $dateFormat!\n";
		return undef;
	}
}

1;
