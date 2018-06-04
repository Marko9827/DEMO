import buble from 'rollup-plugin-buble';

export default {
  banner: `// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

// This is eronelit_editorv3 (http://eronelit_editorv3.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .
`,
  entry: "src/eronelit_editorv3.js",
  format: "umd",
  dest: "lib/eronelit_editorv3.js",
  moduleName: "eronelit_editorv3",
  plugins: [ buble({namedFunctionExpressions: false}) ]
};
