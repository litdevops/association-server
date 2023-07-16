const dict = {
  auth: [
    // /api/auth/
    {
      file: "user",
      api: "auth",
    },
  ],
  business: [
    // /api/business/
    {
      file: "place",
      api: "business",
    },
    {
      file: "benefits",
      api: "business",
    },
    {
      file: "jobs",
      api: "business",
    },
    {
      file: "profile",
      api: "business",
    },
  ],

  // papi
  papi: [
    // /api/auth/
    {
      file: "google",
      api: "google",
      type: "papi",
    },
    {
      file: "upload",
      api: "upload",
      type: "papi",
    },
  ],
  search: [
    {
      file: "place",
      api: "search",
    },
  ],
};

function routeGenerator(app) {
  // get the the project keys, key is the folder name.
  let entries = Object.keys(dict);
  entries.forEach((folder) => {
    dict[folder].forEach((route) => {
      app.use(
        `/${route.type ? route.type : "api"}/${route.api || route.file}`, // if the page is the same as the api, we do not need to place the route.api
        require(`./${folder}/${route.file}`)
      );
    });
  });
}

exports.Generate = routeGenerator;
