const UriQuerySearch = require("./uriQuery");
let uri = "";

test("comparisonOperator2SQL", () => {
  const uriQuery = new UriQuerySearch();
  expect(uriQuery.comparisonOperator2SQL("=")).toBe("=");
  expect(uriQuery.comparisonOperator2SQL("!=")).toBe("!=");
  expect(uriQuery.comparisonOperator2SQL("<=")).toBe("<=");
  expect(uriQuery.comparisonOperator2SQL("<")).toBe("<");
  expect(uriQuery.comparisonOperator2SQL(">=")).toBe(">=");
  expect(uriQuery.comparisonOperator2SQL(">")).toBe(">");

  expect(uriQuery.comparisonOperator2SQL("[eq]")).toBe("=");
  expect(uriQuery.comparisonOperator2SQL("[neq]")).toBe("!=");
  expect(uriQuery.comparisonOperator2SQL("[le]")).toBe("<=");
  expect(uriQuery.comparisonOperator2SQL("[lt]")).toBe("<");
  expect(uriQuery.comparisonOperator2SQL("[ge]")).toBe(">=");
  expect(uriQuery.comparisonOperator2SQL("[gt]")).toBe(">");
});

test("SQL2comparisonOperator", () => {
  const uriQuery = new UriQuerySearch();
  expect(uriQuery.SQL2comparisonOperator("=")).toBe("[eq]");
  expect(uriQuery.SQL2comparisonOperator("!=")).toBe("[neq]");
  expect(uriQuery.SQL2comparisonOperator("<=")).toBe("[le]");
  expect(uriQuery.SQL2comparisonOperator("<")).toBe("[lt]");
  expect(uriQuery.SQL2comparisonOperator(">=")).toBe("[ge]");
  expect(uriQuery.SQL2comparisonOperator(">")).toBe("[gt]");

  expect(uriQuery.SQL2comparisonOperator("[eq]")).toBe("[eq]");
  expect(uriQuery.SQL2comparisonOperator("[neq]")).toBe("[neq]");
  expect(uriQuery.SQL2comparisonOperator("[le]")).toBe("[le]");
  expect(uriQuery.SQL2comparisonOperator("[lt]")).toBe("[lt]");
  expect(uriQuery.SQL2comparisonOperator("[ge]")).toBe("[ge]");
  expect(uriQuery.SQL2comparisonOperator("[gt]")).toBe("[gt]");
});

const tests = [
  // All Empty
  {
    uri: "",
    rest: "",
    result: {
      get: {
        gets: [],
        filters: [],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: { sets: [], allowedSets: [], enforcedSets: [], requiredSets: [] },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQueryError: true,
      sqlQuery: new Error("REST GET but no defined columns to get."),
      description: "no defined rest and no defined parameters",
    },
  },
  // GET One column, rest in lowercase
  {
    uri: "'?cols=first'",
    rest: "get",
    result: {
      get: {
        gets: [{ column: "cols", compare: ["first"], comparisonOperator: "[eq]" }],
        filters: [{ column: "cols", compare: ["first"], comparisonOperator: "[eq]" }],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQuery: "SELECT `cols` FROM `table` WHERE `cols` IN ('first')",
      description: "GET with one parameter",
    },
  },
  // One column DELETE
  {
    uri: "'?cols=first'",
    rest: "DELETE",
    result: {
      get: {
        gets: [],
        filters: [],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: { sets: [], allowedSets: [], enforcedSets: [], requiredSets: [] },
      delete: { filters: [{ column: "cols", compare: ["first"], comparisonOperator: "[eq]" }], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "DELETE",
      sqlTable: "table",
      sqlQuery: "DELETE FROM `table` WHERE `cols` IN ('first')",
      description: "delete using single filter",
    },
  },
  // One column POST
  {
    uri: "'?cols[as]first'",
    rest: "POST",
    result: {
      get: {
        gets: [],
        filters: [],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: { sets: [{ column: "cols", compare: ["first"], comparisonOperator: "[as]" }], allowedSets: [], enforcedSets: [], requiredSets: [] },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "POST",
      sqlTable: "table",
      sqlQuery: "INSERT INTO `table` (`cols`) VALUES ('first')",
      description: "POST single column",
    },
  },
  // One column PATCH
  {
    uri: "'?cols=first,cols[as]second'",
    rest: "PATCH",
    result: {
      get: {
        gets: [],
        filters: [],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [{ column: "cols", compare: ["second"], comparisonOperator: "[as]" }],
        filters: [{ column: "cols", compare: ["first"], comparisonOperator: "[eq]" }],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: { sets: [], allowedSets: [], enforcedSets: [], requiredSets: [] },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "PATCH",
      sqlTable: "table",
      sqlQuery: "UPDATE `table` SET `cols` = 'second' WHERE `cols` IN ('first')",
      description: "PATCH one col using single filter",
    },
  },
  // GET two columns
  {
    uri: "'?cols=first,second'",
    rest: "GET",
    result: {
      get: {
        gets: [{ column: "cols", compare: ["first"], comparisonOperator: "[eq]" }, { column: "second" }],
        filters: [{ column: "cols", compare: ["first"], comparisonOperator: "[eq]" }],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQuery: "SELECT `cols`, `second` FROM `table` WHERE `cols` IN ('first')",
      description: "GET with two parameters",
    },
  },
  // GET with three parameters, dual wildcard filters on same parameter, sorting
  {
    uri: "'?first=2,second>20,third[asc]=John%[or]%Doe'",
    rest: "GET",
    result: {
      get: {
        gets: [
          { column: "first", compare: ["2"], comparisonOperator: "[eq]" },
          { column: "second", compare: ["20"], comparisonOperator: "[gt]" },
          { column: "third", compare: ["John%", "%Doe"], comparisonOperator: "[eq]" },
        ],
        filters: [
          { column: "first", compare: ["2"], comparisonOperator: "[eq]" },
          { column: "second", compare: ["20"], comparisonOperator: "[gt]" },
          { column: "third", compare: ["John%", "%Doe"], comparisonOperator: "[eq]" },
        ],
        sortBy: [{ column: "third", sortorder: "asc" }],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQuery: "SELECT `first`, `second`, `third` FROM `table` WHERE `first` IN ('2') AND `second` > '20' AND (`third` LIKE 'John%' OR `third` LIKE '%Doe') ORDER BY `third` asc",
      description: "GET with three parameters, dual wildcard filters on same parameter, sorting",
    },
  },
  // GET with three parameters, dual wildcard filters on same parameter, sorting. Error Greater than wildcard
  {
    uri: "'?first>2%,second>20,third[asc]=John%[or]%Doe'",
    rest: "GET",
    result: {
      get: {
        gets: [
          { column: "first", compare: ["2%"], comparisonOperator: "[gt]" },
          { column: "second", compare: ["20"], comparisonOperator: "[gt]" },
          { column: "third", compare: ["John%", "%Doe"], comparisonOperator: "[eq]" },
        ],
        filters: [
          { column: "first", compare: ["2%"], comparisonOperator: "[gt]" },
          { column: "second", compare: ["20"], comparisonOperator: "[gt]" },
          { column: "third", compare: ["John%", "%Doe"], comparisonOperator: "[eq]" },
        ],
        sortBy: [{ column: "third", sortorder: "asc" }],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQueryError: true,
      sqlQuery: "Got % wildcard on other operator than [eq]/[neq], not allowed.",
      description: "GET with three parameters, dual wildcard filters on same parameter, sorting. Error Greater than wildcard",
    },
  },
  // GET complex #1
  {
    uri: "'?first,second[asc]=cho%[or]suga%,third[desc][neq]kossa,id=3[or]4,forth=sa,id[ge]10,id[le]40'",
    rest: "GET",
    result: {
      get: {
        gets: [
          { column: "first" },
          { column: "second", compare: ["cho%", "suga%"], comparisonOperator: "[eq]" },
          { column: "third", compare: ["kossa"], comparisonOperator: "[neq]" },
          { column: "id", compare: ["3", "4"], comparisonOperator: "[eq]" },
          { column: "forth", compare: ["sa"], comparisonOperator: "[eq]" },
          { column: "id", compare: ["10"], comparisonOperator: "[ge]" },
          { column: "id", compare: ["40"], comparisonOperator: "[le]" },
        ],
        filters: [
          { column: "second", compare: ["cho%", "suga%"], comparisonOperator: "[eq]" },
          { column: "third", compare: ["kossa"], comparisonOperator: "[neq]" },
          { column: "id", compare: ["3", "4"], comparisonOperator: "[eq]" },
          { column: "forth", compare: ["sa"], comparisonOperator: "[eq]" },
          { column: "id", compare: ["10"], comparisonOperator: "[ge]" },
          { column: "id", compare: ["40"], comparisonOperator: "[le]" },
        ],
        sortBy: [
          { column: "second", sortorder: "asc" },
          { column: "third", sortorder: "desc" },
        ],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQueryError: false,
      sqlQuery:
        "SELECT `first`, `second`, `third`, `id`, `forth` FROM `table` WHERE (`second` LIKE 'cho%' OR `second` LIKE 'suga%') AND `third` NOT IN ('kossa') AND (`id` IN ('3','4')) AND `forth` IN ('sa') AND `id` >= '10' AND `id` <= '40' ORDER BY `second` asc, `third` desc",
      description: "Get complex #1",
    },
  },
  // GET complex #2
  {
    uri: "'?first,second[asc]=cho%[or]suga%,third[desc][neq]kossa,id=3[or]4,forth=sa,id[ge]10,id[le]40'",
    rest: "GET",
    result: {
      get: {
        gets: [
          { column: "first" },
          { column: "second", compare: ["cho%", "suga%"], comparisonOperator: "[eq]" },
          { column: "third", compare: ["kossa"], comparisonOperator: "[neq]" },
          { column: "id", compare: ["3", "4"], comparisonOperator: "[eq]" },
          { column: "forth", compare: ["sa"], comparisonOperator: "[eq]" },
          { column: "id", compare: ["10"], comparisonOperator: "[ge]" },
          { column: "id", compare: ["40"], comparisonOperator: "[le]" },
        ],
        filters: [
          { column: "second", compare: ["cho%", "suga%"], comparisonOperator: "[eq]" },
          { column: "third", compare: ["kossa"], comparisonOperator: "[neq]" },
          { column: "id", compare: ["3", "4"], comparisonOperator: "[eq]" },
          { column: "forth", compare: ["sa"], comparisonOperator: "[eq]" },
          { column: "id", compare: ["10"], comparisonOperator: "[ge]" },
          { column: "id", compare: ["40"], comparisonOperator: "[le]" },
        ],
        sortBy: [
          { column: "second", sortorder: "asc" },
          { column: "third", sortorder: "desc" },
        ],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [{ column: "createdAt", comparisonOperator: "[ge]", compare: ["2020-01-01"] }],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "GET",
      sqlTable: "table",
      sqlQueryError: false,
      sqlQuery:
        "SELECT `first`, `second`, `third`, `id`, `forth` FROM `table` WHERE (`second` LIKE 'cho%' OR `second` LIKE 'suga%') AND `third` NOT IN ('kossa') AND (`id` IN ('3','4')) AND `forth` IN ('sa') AND `id` >= '10' AND `id` <= '40' ORDER BY `second` asc, `third` desc",
      description: "Get complex #2, #1 + enforcedFilters",
    },
  },
  // Basic post
  {
    uri: "?first[as]firstValue,second[as]secondValue",
    rest: "POST",
    result: {
      get: {
        gets: [],
        filters: [],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [
          { column: "first", compare: ["firstValue"], comparisonOperator: "[as]" },
          { column: "second", compare: ["secondValue"], comparisonOperator: "[as]" },
        ],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "POST",
      sqlTable: "table",
      sqlQueryError: false,
      sqlQuery: "INSERT INTO `table` (`first`, `second`) VALUES ('firstValue', 'secondValue')",
      description: "Basic post",
    },
  },
  // Basic post, required column
  {
    uri: "?first[as]firstValue,second[as]secondValue",
    rest: "POST",
    result: {
      get: {
        gets: [],
        filters: [],
        sortBy: [],
        allowedGet: [],
        enforcedGet: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
        enforcedSortBy: [],
      },
      patch: {
        sets: [],
        filters: [],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [],
        allowedFilters: [],
        enforcedFilters: [],
        requiredFilters: [],
      },
      post: {
        sets: [
          { column: "first", compare: ["firstValue"], comparisonOperator: "[as]" },
          { column: "second", compare: ["secondValue"], comparisonOperator: "[as]" },
        ],
        allowedSets: [],
        enforcedSets: [],
        requiredSets: [{ column: "first" }],
      },
      delete: { filters: [], allowedFilters: [], enforcedFilters: [], requiredFilters: [] },
      _dbSchema: "",
      _RESTtype: "POST",
      sqlTable: "table",
      sqlQueryError: false,
      sqlQuery: "INSERT INTO `table` (`first`, `second`) VALUES ('firstValue', 'secondValue')",
      description: "Basic post, required column",
    },
  },
  // Error: Undefined comparisonoperator or compare not array on POST
  {
    uri: "?first[ge]firstValue,second[as]secondValue",
    rest: "POST",
    result: {
      uriError: "Invalid comparisonoperator [ge] on POST",
      description: "Invalid comparisonoperator [ge] on POST",
    },
  },
  // Error: Undefined comparisonoperator or compare not array on POST
  {
    uri: "?first=firstValue,second[as]secondValue",
    rest: "POST",
    result: {
      uriError: "Invalid comparisonoperator [eq] on POST",
      description: "Invalid comparisonoperator [eq] on POST",
    },
  },
  // Error: Undefined comparisonoperator or compare not array on POST
  {
    uri: "?first[as]firstValue,second[as]secondValue,third",
    rest: "POST",
    result: {
      uriError: "Undefined comparisonoperator or compare not array on POST",
      description: "Error: Undefined comparisonoperator or compare not array on POST",
    },
  },
];

describe.each(tests)(uri, ({ uri, rest, result }) => {
  test("uri: " + uri + ", rest: " + rest + ", description: " + result.description, () => {
    let t;
    console.log(result.uriError);
    if (result.uriError) {
      expect(() => {
        t = new UriQuerySearch(uri ? uri : "", rest ? rest : "");
      }).toThrowError(result.uriError);
      expect(t).toStrictEqual(undefined);
    } else {
      t = new UriQuerySearch(uri ? uri : "", rest ? rest : "");
      t.get.allowedGet.push(...result.get.allowedGet);
      t.get.enforcedGet.push(...result.get.enforcedGet);
      t.get.allowedFilters.push(...result.get.allowedFilters);
      t.get.enforcedFilters.push(...result.get.enforcedFilters);
      t.get.requiredFilters.push(...result.get.requiredFilters);
      t.get.enforcedSortBy.push(...result.get.enforcedSortBy);

      expect(t.get.gets).toStrictEqual(result.get.gets);
      expect(t.get.filters).toStrictEqual(result.get.filters);
      expect(t.get.sortBy).toStrictEqual(result.get.sortBy);
      expect(t.get.allowedGet).toStrictEqual(result.get.allowedGet);
      expect(t.get.enforcedGet).toStrictEqual(result.get.enforcedGet);
      expect(t.get.allowedFilters).toStrictEqual(result.get.allowedFilters);
      expect(t.get.enforcedFilters).toStrictEqual(result.get.enforcedFilters);
      expect(t.get.requiredFilters).toStrictEqual(result.get.requiredFilters);
      expect(t.get.enforcedSortBy).toStrictEqual(result.get.enforcedSortBy);

      t.patch.allowedSets.push(...result.patch.allowedSets);
      t.patch.enforcedSets.push(...result.patch.enforcedSets);
      t.patch.requiredSets.push(...result.patch.requiredSets);
      t.patch.allowedFilters.push(...result.patch.allowedFilters);
      t.patch.enforcedFilters.push(...result.patch.enforcedFilters);
      t.patch.requiredFilters.push(...result.patch.requiredFilters);

      expect(t.patch.sets).toStrictEqual(result.patch.sets);
      expect(t.patch.filters).toStrictEqual(result.patch.filters);
      expect(t.patch.allowedSets).toStrictEqual(result.patch.allowedSets);
      expect(t.patch.enforcedSets).toStrictEqual(result.patch.enforcedSets);
      expect(t.patch.requiredSets).toStrictEqual(result.patch.requiredSets);
      expect(t.patch.allowedFilters).toStrictEqual(result.patch.allowedFilters);
      expect(t.patch.enforcedFilters).toStrictEqual(result.patch.enforcedFilters);
      expect(t.patch.requiredFilters).toStrictEqual(result.patch.requiredFilters);

      t.post.allowedSets.push(...result.post.allowedSets);
      t.post.enforcedSets.push(...result.post.enforcedSets);
      t.post.requiredSets.push(...result.post.requiredSets);

      expect(t.post.sets).toStrictEqual(result.post.sets);
      expect(t.post.allowedSets).toStrictEqual(result.post.allowedSets);
      expect(t.post.enforcedSets).toStrictEqual(result.post.enforcedSets);
      expect(t.post.requiredSets).toStrictEqual(result.post.requiredSets);

      t.delete.allowedFilters.push(...result.delete.allowedFilters);
      t.delete.enforcedFilters.push(...result.delete.enforcedFilters);
      t.delete.requiredFilters.push(...result.delete.requiredFilters);

      expect(t.delete.filters).toStrictEqual(result.delete.filters);
      expect(t.delete.allowedFilters).toStrictEqual(result.delete.allowedFilters);
      expect(t.delete.enforcedFilters).toStrictEqual(result.delete.enforcedFilters);
      expect(t.delete.requiredFilters).toStrictEqual(result.delete.requiredFilters);

      expect(t._dbSchema).toStrictEqual(result._dbSchema);
      expect(t._RESTtype).toStrictEqual(result._RESTtype);
      if (result.sqlQueryError) {
        expect(() => {
          t.createSQL(result.sqlTable);
        }).toThrowError(result.sqlQuery);
      } else {
        expect(t.createSQL(result.sqlTable)).toStrictEqual(result.sqlQuery);
      }
    }
  });
});
