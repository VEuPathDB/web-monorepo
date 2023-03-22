// Needed to accommodate SVG imports (courtesy of https://stackoverflow.com/a/45887328)
declare module '*.svg' {
  const content: any;
  export default content;
}
