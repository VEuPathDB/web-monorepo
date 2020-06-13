README for MAL-ED 0-60m (phase 3) Download Files:


General notes:

• Column headers for each data file contain the variable label used on the ClinEpiDB.org website. Column headers for each data file also contain the Internationalized Resource Identifier (IRI), shown in brackets. 
• Each variable on ClinEpiDB.org has been mapped to an ontology term via the IRI. This approach generates a unified semantic framework, where the same variables across different studies are mapped to the same ontology term. IRIs can be searched on ontobee.org. Note that while most ontology terms used in ClinEpiDB are from existing OBO Foundry ontologies, some are placeholder terms that are created as needed and may not be published yet. 
• ISASimple_Gates_MAL-ED_phase3_RSRC_ontologyMetadata.txt links variables to their original study labels so users can reference study data collection forms and data dictionaries to learn more about each variable. 
• Delimited text files are used to store data. Each line represents a single household, participant, observation, or sample. Each line has fields separated by a tab delimiter. 
• Note that large file sizes may cause Excel to crash. We recommended using R (https://www.r-project.org/, a free software environment for statistical computing) instead. To read large files into R, we recommend using the fread( ) function from the data.table package. For example: 
	install.packages("data.table")
	library(data.table)
	setwd("~/Downloads")
	d <- fread("ISASimple_Gates_MAL-ED_phase3_RSRC.txt") 
• If you choose to use Excel: 
   ◦ For a primer on how to open tab delimited .txt files in Excel, see: https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba 
   ◦ When opening data files in Excel, date variables may read "00:00.0" for all values. This is not a data error, but will require reformatting the column using Excel’s ‘Text Import Wizard’ to obtain the actual data. See: https://support.office.com/en-us/article/text-import-wizard-c5b02af6-fda1-4440-899f-f78bafe41857#ID0EAAEAAA=Office_2010_-_Office_2016 





ISASimple_Gates_MAL-ED_phase3_RSRC_ontologyMetadata.txt, the ontology term association file includes the columns: 
• iri -- Internationalized Resource Identifier (IRI) assigned to variable (Example: "EUPATH_0000665") 
• label -- Displayed as variable name on ClinEpiDB (Example: "[Study-defined diarrhea") 
• type -- Whether data is formatted as number, string, or date. If empty, row belongs to parent term without data 
• parentLabel -- Term the variable falls directly under in the variable hierarchy tree on ClinEpiDB (Example: "Diarrheal episodes") 
• category -- Highest level parent term (Household, Participant, Observation, Sample) variable falls under (Example: "Observation") 
• definition -- Study specific description for variable that is displayed on ClinEpiDB under the label when variable is selected 
• min, max, upper_quartile, lower_quartile -- Provided for number and date variables 
• average -- Provided for number variables 
• number_distinct_values -- Count of all possible values for variable 
• distinct_values -- Pipe-delimited (|) list of all possible values for string variable 
• variable -- Column header, or variable name, from original data files. Pipe-delimited (|) list if multiple variables from original data files were mapped to one ontology term (Example: "illnessfull::diar") 
   ◦ Values are formatted as "data file::variable" (Example: "illnessfull::diar"; variable "diar" came from data file "illness full.csv") 



Data Files:

• Key identifiers: 
  ◦ Household_Observation_Id: unique identifier given to every unique observation for every household 
  ◦ Household_Id: unique identifier given to every household (For MAL-ED, there was only one participant enrolled per household) 
  ◦ Participant_Id: unique identifier given to every participant 
  ◦ Observation_Id: unique identifier given to every unique observation for every participant 
  ◦ Sample_Id: unique identifier given to every sample 

1. ISASimple_Gates_MAL-ED_phase3_RSRC_households.txt 
   • Key identifiers: Household_Observation_Id, Household_Id 
   • 1 row for each day of observation for each household 
   • 56 variables (columns) & 17,541 household observations (rows) 
	◦ 2,145 unique "Household_Id" 
	◦ 17,541 unique "Household_Observation_Id" 

2. ISASimple_Gates_MAL-ED_phase3_RSRC_participant.txt 
   • Key identifiers: Participant_Id, Household_Id 
   • 1 row for each participant 
   • 56 variables (columns) & 2,145 participants (rows) 
	◦ 2,145 unique "Participant_Id" 

3. ISASimple_Gates_MAL-ED_phase3_RSRC_observations.txt 
   • Key identifiers: Observation_Id, Participant_Id, Household_Id 
   • 1 row for each day of observation for each participant 
   • 239 variables (columns) & 1,848,829 observations (rows) 
	◦ 1,848,829 unique "Observation_Id" 

4. ISASimple_Gates_MAL-ED_phase3_RSRC_samples.txt 
   • Key identifiers: Sample_Id, Observation_Id, Participant_Id, Household_Id 
   • 1 row for each sample 
	◦ Note that multiple stool, blood, and/or urine samples may have been collected from the same participant on any given observation day 
	◦ "Sample ID [OBI_0001616]" gives the sample IDs assigned to each sample by the study team 
   • 564 variables (columns) & 77,498 samples (rows) 
	◦ 77,498 unique "Sample_Id" 

5. ISASimple_Gates_MAL-ED_phase3_RSRC.txt 
   • Merges the files indicated below using [Household_Observation_Id, Participant_Id, Observation_Id, and Sample_Id]: 
	◦ ISASimple_Gates_MAL-ED_phase3_RSRC_households.txt 
	◦ ISASimple_Gates_MAL-ED_phase3_RSRC_participant.txt 
	◦ ISASimple_Gates_MAL-ED_phase3_RSRC_observations.txt 
	◦ ISASimple_Gates_MAL-ED_phase3_RSRC_samples.txt 
   • Key identifiers: Household_Id, Household_Observation_Id, Participant_Id, Observation_Id, Sample_Id 
   • 909 variables (columns) & 1,870,909 rows 
