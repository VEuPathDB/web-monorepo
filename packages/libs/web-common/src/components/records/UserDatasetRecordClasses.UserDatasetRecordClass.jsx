import React from 'react';
import DOMPurify from 'dompurify';
import { connect } from 'react-redux';
import { HelpIcon, Link } from '@veupathdb/wdk-client/lib/Components';
import { projectId } from '../../config';
import { BlockRecordAttributeSection } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';
import RecordAttribute from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttribute';
import { DataFilesSection } from './DataFilesSection';
import { BWFilesSection } from './BWFilesSection';

// formatLink(): we use now <Link> that takes target="blank"
//
function stripXML(str) {
  let div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}
export function formatLink(link, opts) {
  opts = opts || {};
  let newWindow = !!opts.newWindow;
  return (
    <a href={link.url} target={newWindow ? '_blank' : '_self'}>
      {stripXML(link.displayText)}
    </a>
  );
}

// The exports below are used in packages/libs/web-common/src/component-wrappers/RecordPage.jsx (dynamic wrapping)
//  1. RecordPage.jsx uses require.context to load components from components/records directory
//  2. At runtime, it looks for a file matching the record class name: UserDatasetRecordClasses.UserDatasetRecordClass.js
//  3. It then looks for exported components like RecordHeading, RecordTable, etc. from that file
//  4. These override the default WDK components
//
export function RecordHeading(props) {
  let { record, questions, recordClasses } = props;
  let { attributes, tables } = record;
  let {
    primary_publication,
    primary_contact_name,
    creation_date,
    summary,
    is_public,
    accessibility,
    owner_name,
    category,
    type_name,
    search_link,
    veupathdb_id,
    veupathdb_project,
  } = attributes;

  return (
    <>
      <props.DefaultComponent {...props} />
      <div className="wdk-RecordOverview eupathdb-RecordOverview">
        <dl>
          <dt>Primary publication:</dt>
          {primary_publication ? (
            <>
              <dd>{primary_publication}</dd>
            </>
          ) : null}

          <dt>Primary contact:</dt>
          {primary_contact_name ? (
            <>
              <dd>{primary_contact_name}</dd>
            </>
          ) : null}
          {veupathdb_project !== 'dataExplorer' ? (
            <>
              <dt>Data type:</dt>
              <dd>{category}</dd>
            </>
          ) : null}

          <dt>Uploaded by:</dt>
          <dd>{owner_name}</dd>

          <dt>VEuPathDB Dataset ID:</dt>
          <dd>{veupathdb_id}</dd>

          <dt>Dataset version / Date:</dt>
          <dd>v1, {creation_date}</dd>

          <dt>Summary:</dt>
          <dd
            style={{ whiteSpace: 'normal' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(summary) }}
          />

          <dt>Visibility:</dt>
          <dd>{is_public}</dd>
          <dt>Download access:</dt>
          <dd>
            {accessibility}
            {accessibility === 'Restricted' ? (
              <div style={{ color: '#666', fontSize: '.8em', fontWeight: 400 }}>
                This dataset can only be discovered, explored, and downloaded by
                the owner and explicitly invited collaborators.
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '.8em', fontWeight: 400 }}>
                No access restrictions; anyone can download the data without
                registering.
              </div>
            )}
          </dd>
          {type_name !== 'bigwigfiles' &&
          veupathdb_project !== 'dataExplorer' ? (
            <>
              <dt>Explore:</dt>
              <dd>
                <Link to={search_link.url}>{search_link.displayText}</Link>
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </>
  );
}

export function RecordAttributeSection(props) {
  const { DefaultComponent, ...restProps } = props;
  switch (restProps.attribute.name) {
    case 'description':
      return <BlockRecordAttributeSection {...restProps} />;
    case 'exp_organism':
      return <BlockRecordAttributeSection {...restProps} />;
    case 'ref_organism':
      return <BlockRecordAttributeSection {...restProps} />;
    case 'disclaimer':
      return <BlockRecordAttributeSection {...restProps} />;
    case 'dataFiles':
      return <DataFilesSection {...restProps} />;
    case 'bwFiles':
      if (
        props.record.attributes.type_name === 'bigwigfiles' ||
        props.record.attributes.type_name === 'rnaseq'
      )
        return <BWFilesSection {...restProps} />;
      else return null; // hides attribute in right side?
    default:
      return <UserDatasetInlineAttribute {...restProps} />;
  }
}

// Style for attributes: Wrapper to add fixed-width labels for aligned values in UserDataset records
//
function UserDatasetInlineAttribute(props) {
  const { attribute, record, recordClass } = props;
  const { displayName, help, name } = attribute;

  return (
    <div
      id={name}
      className={`wdk-RecordAttributeSectionItem wdk-RecordAttributeSectionItem__${name}`}
    >
      <div className="wdk-RecordAttributeInline">
        <div
          className="wdk-RecordAttributeName"
          style={{ width: '180px', display: 'inline-block' }}
        >
          {displayName}:
          {help && (
            <>
              {' '}
              <HelpIcon>{help}</HelpIcon>
            </>
          )}
        </div>
        <div className="wdk-RecordAttributeValue">
          <RecordAttribute
            attribute={attribute}
            record={record}
            recordClass={recordClass}
          />
        </div>
      </div>
    </div>
  );
}

// Hide certain tables for certain data types
//   (this does not hide the heading :(
//
export function RecordTable(props) {
  const { table, record, ontologyProperties } = props;
  const type_name = record.attributes.type_name;

  if (
    ((table.name === 'ExploreWebsiteEDA' || table.name === 'Variables') &&
      (type_name === 'genelist' ||
        type_name === 'bigwigfiles' ||
        type_name === 'rnaseq')) ||
    (table.name === 'ExploreWebsiteSearches' &&
      (type_name === 'isasimple' || type_name === 'bigwigfiles'))
  ) {
    return null; //could we remove heading?
  }

  return <props.DefaultComponent {...props} />;
}

// RecordMainCategorySection
// - dataexplorer : adhoc verbiage for category "characteristics" Field Study or Clinical Trial Characteristics
//    when the dataset is public and there are no data provided in attr and tables in this category
//   (is_clinical_field = 'No'). (not sure if is_clinical_field is ever false)
// - genomics: hide table headings for certain data types
//
export function RecordMainCategorySection(props) {
  const { category, record, children } = props;

  // Check if this is the characteristics category container (has children)
  const isCharacteristicsCategory =
    category?.properties?.name?.[0] === 'characteristics' && children != null;

  if (isCharacteristicsCategory) {
    const isClinicalField = record.attributes['is_clinical_field'];

    // If not a clinical field, replace children with message
    if (isClinicalField === 'No' || isClinicalField === false) {
      const customChildren = (
        <div
          className="wdk-RecordAttributeValue"
          style={{ paddingLeft: '2em', margin: '0.5em 0', fontStyle: 'italic' }}
        >
          Not a field study or clinical trial
        </div>
      );
      return <props.DefaultComponent {...props} children={customChildren} />;
    }
  }

  const type_name = record.attributes.type_name;
  const table_name = category?.properties?.name?.[0];
  if (
    ((table_name === 'ExploreWebsiteEDA' || table_name === 'Variables') &&
      (type_name === 'genelist' ||
        type_name === 'bigwigfiles' ||
        type_name === 'rnaseq')) ||
    (table_name === 'ExploreWebsiteSearches' &&
      (type_name === 'isasimple' || type_name === 'bigwigfiles'))
  ) {
    return null; //could we remove heading?
  }

  // Render default category section
  return <props.DefaultComponent {...props} />;
}

// RecordNavigationSection (record page left pane)
//
// dataExplorer: we hide the category 'characteristics' when the dataset is public
//   and there are no data provided in attr and tables in this category
//   (is_clinical_field = 'No'). (not sure if is_clinical_field is ever false)
//
// genomics: hide children of category 'Link Outs' (has no name assigned)
//   when they dont apply to certain data types
//
export function RecordNavigationSection(props) {
  const { record, categoryTree } = props;
  const type_name = record.attributes.type_name;

  // Check if this is a clinical field
  const isClinicalField = record?.attributes?.['is_clinical_field'];
  const shouldHideCharacteristics =
    isClinicalField === 'No' || isClinicalField === false;

  // If we need to hide the entire characteristics section, filter it from the tree
  let filteredCategoryTree = categoryTree;

  if (categoryTree?.children) {
    const nodesToHide = new Set();

    if (shouldHideCharacteristics) nodesToHide.add('characteristics');

    if (
      type_name === 'genelist' ||
      type_name === 'bigwigfiles' ||
      type_name === 'rnaseq'
    ) {
      nodesToHide.add('ExploreWebsiteEDA');
      nodesToHide.add('Variables');
    }

    if (type_name === 'isasimple' || type_name === 'bigwigfiles') {
      nodesToHide.add('ExploreWebsiteSearches');
    }

    if (
      type_name === 'isasimple' ||
      type_name === 'phenotype' ||
      type_name === 'genelist'
    ) {
      nodesToHide.add('bwFiles');
    }

    if (nodesToHide.size > 0) {
      console.log('[RecordNavigationSection] nodesToHide:', [...nodesToHide]);
      filteredCategoryTree = {
        ...categoryTree,
        children: categoryTree.children
          .filter((node) => {
            const categoryName = node.properties?.name?.[0];
            const shouldHide = nodesToHide.has(categoryName);
            console.log('[RecordNavigationSection] top-level category:', {
              categoryName,
              shouldHide,
            });
            return !shouldHide;
          })
          .map((node) => {
            if (!node.children?.length) return node;
            const filteredChildren = node.children.filter((child) => {
              const wdkName = child.wdkReference?.name;
              const childCategoryName = child.properties?.name?.[0];
              const childName = wdkName ?? childCategoryName;
              const shouldHide = nodesToHide.has(childName);
              console.log('[RecordNavigationSection] child node:', {
                wdkName,
                childCategoryName,
                childName,
                shouldHide,
              });
              return !shouldHide;
            });
            return { ...node, children: filteredChildren };
          }),
      };
    }
  }

  return (
    <props.DefaultComponent {...props} categoryTree={filteredCategoryTree} />
  );
}
