self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/properties/[id]/summary": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/properties/[id]/summary.js"
    ],
    "/reports/share-success": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/reports/share-success.js"
    ],
    "/reports/shared/[uuid]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/reports/shared/[uuid].js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];