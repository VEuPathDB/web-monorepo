<DAS>
    <module name="GUS.pm">
		<sqlQuery>
			<name>get_feature_by_name</name>
			<description>
				fetch features by their name 
			</description>
			<sql>
				<!-- use CDATA because query includes angle brackets -->
				<![CDATA[
				SELECT nae.source_id ctg_name, 
					   trp.na_feature_id feature_id, 
					   trp.name type, 
					   'Genbank' source, 
					   trp.source_id name, 
					   decode (trp.codon_start, 1, 1, 2, 2, 3, 3, null) phase, 
					   s.na_feature_id parent_id, 
					   null score, 
					   nal.start_max  startp, 
					   nal.end_min end, 
					   decode (nal.is_reversed, 0, '+1', 1, '-1', '.') strand 
				FROM   
					   dots.NAENTRY nae, 
					   dots.TRANSCRIPT trp, 
					   dots.SOURCE s, 
					   dots.NALOCATION nal 
				WHERE  
					   nae.na_sequence_id = s.na_sequence_id and 
					   trp.na_sequence_id = nae.na_sequence_id and 
					   trp.na_feature_id = nal.na_feature_id and 
					   ( upper(trp.source_id) like ? or 
						 upper(nae.source_id) like ? or 
						 upper(trp.product) like ? )
				   ]]>
		   </sql>
		</sqlQuery>   
	</module>

	<module name="Segment.pm">
		<sqlQuery>
			<name>new</name>
			<description>
				fetch features by their name 
			</description>
			<sql>
				<![CDATA[
				SELECT nal.na_feature_id srcfeature_id, 
					   nal.start_max startm, 
					   nal.end_min end, 
					   nae.source_id name, 
					   'contig' type, 
					   'ID=' || nae.source_id || 
					   '$segdlm' || 'Name=' || nae.source_id || 
					   '$segdlm' || 'molecule_type=dsDNA' || 
					   '$segdlm' || 'Dbxref=taxon:' || 
					   decode (substr(nae.source_id, 1, 4), 'AAEE', 5807, 
															'AAEL', 237895) || 
					   ',Genbank:' || nae.source_id || 
					   '$segdlm' || 'size=' || 
					   decode (substr(nae.source_id, 1, 4), 'AAEE', '9.11Mb', 
															'AAEL', '9.16Mb') || 
					   '$segdlm' || 'organism_name=' || s.organism || 
					   '$segdlm' || 'strain=' || 
					   decode (substr(nae.source_id, 1, 4), 'AAEE', s.isolate, 
															'AAEL', s.strain) || 
					   '$segdlm' || 'translation_table=1' || 
					   '$segdlm' || 'topology=linear' || 
					   '$segdlm' || 'localization=nuclear' atts
				FROM   
					   dots.SOURCE s, 
					   dots.NAENTRY nae, 
					   dots.NALOCATION nal 
				WHERE  
					   nal.na_feature_id = s.na_feature_id and 
					   nae.na_sequence_id = s.na_sequence_id and 
					   upper(nae.source_id) = ?  
			   ]]>
		   </sql>
		</sqlQuery>   

		<sqlQuery>
			<name>gene_Genbank_sql</name>
			<description>
			</description>
			<sql>
				<![CDATA[ 
				SELECT gen.na_feature_id feature_id,
					   gen.name type, 
					   'Genbank' source, 
					   gen.source_id name, 
					   '.' score, 
					   src.na_feature_id parent_id, 
					   nal.start_max startm, 
					   nal.end_min end, 
					   decode (nal.is_reversed, 0, '+1', 1, '-1', '.') strand
				FROM 
					   dots.GENEFEATURE gen, 
					   dots.NALOCATION nal, 
					   dots.SOURCE src
				WHERE 
					   gen.na_feature_id = nal.na_feature_id and 
					   src.na_sequence_id = gen.na_sequence_id and 
					   nal.start_max <= $rend and 
					   nal.end_min >= $base_start and 
					   src.na_feature_id = $srcfeature_id 
				ORDER BY 
					   nal.start_max
			   ]]>
		   </sql>
		</sqlQuery>   
	</module>
</DAS>
