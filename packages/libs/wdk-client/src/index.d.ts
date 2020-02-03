// These are needed since they are untyped modules.
// We want to stop using these eventually.
declare module 'lib/jquery';
declare module 'lib/jquery-ui';
declare module 'lib/jquery-qtip';
declare module 'lib/jquery-datatables';
declare module 'lib/jquery-datatables-natural-type-plugin';
declare module 'lib/jquery-flot';
declare module 'lib/jquery-flot-categories';
declare module 'lib/jquery-flot-selection';
declare module 'lib/jquery-flot-time';

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}
