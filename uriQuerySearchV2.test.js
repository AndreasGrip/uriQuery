const UriQuerySearch = require("./uriQuerySearchV2");
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

test("new UriQuerySearch('?cols=first,second')", () => {
  const uriQuery = new UriQuerySearch("?cols=first,second");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first,second");
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery.error.error).toBe(false);
  expect(uriQuery.error.message).toBe("");
  expect(uriQuery._colsGet).toStrictEqual(["first", "second"]);
  expect(uriQuery._colsSet.length).toBe(0);
  expect(uriQuery._colsFilter.length).toBe(0);
  expect(uriQuery._sortBy.length).toBe(0);

  const sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse ? sqlResponse : typeof sqlResponse === "string" ? sqlResponse : "").toBe("SELECT 'first', 'second' FROM table");
});

test("new UriQuerySearch('?cols=first=2,second>20,third[asc]=John%[or]%Doe')", () => {
  const uriQuery = new UriQuerySearch("?cols=first=2,second>20,third[asc]=John%[or]%Doe");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first=2,second>20,third[asc]=John%[or]%Doe");
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery.error.error).toBe(false);
  expect(uriQuery.error.message).toBe("");
  expect(uriQuery._colsGet).toStrictEqual(["first", "second", "third"]);
  expect(uriQuery._colsSet.length).toBe(0);
  expect(uriQuery._colsFilter).toStrictEqual([
    { column: "first", comparisonOperator: "[eq]", compare: ["2"] },
    { column: "second", comparisonOperator: "[gt]", compare: ["20"] },
    { column: "third", comparisonOperator: "[eq]", compare: ["John%", "%Doe"] },
  ]);
  expect(uriQuery._sortBy).toEqual([{ column: "third", sortorder: "asc" }]);

  const sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse ? sqlResponse : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "SELECT 'first', 'second', 'third' FROM table WHERE 'first' = '2' AND 'second' > '20' AND ('third' LIKE 'John%' OR 'third' LIKE '%Doe') ORDER BY 'third' asc"
  );
});

test("new UriQuerySearch('?cols=first>2%,second>20,third[asc]=John%[or]%Doe') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first>2%,second>20,third[asc]=John%[or]%Doe");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first>2%,second>20,third[asc]=John%[or]%Doe");
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery.error.error).toBe(true);
  expect(uriQuery.error.message).toBe(
    `first>2% resulted in col: 'first' and comparisonOperator: '[gt]' compare: '["2%"]'
Invalid mix of compare: ["2%"] and comparisonOperator: [gt]
Only =,!=,[eq],[neq] is allowed to use with %, or multiple options
`
  );
  expect(uriQuery._colsGet).toStrictEqual([]);
  expect(uriQuery._colsSet.length).toBe(0);
  expect(uriQuery._colsFilter).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);

  const sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    `first>2% resulted in col: 'first' and comparisonOperator: '[gt]' compare: '["2%"]'
Invalid mix of compare: ["2%"] and comparisonOperator: [gt]
Only =,!=,[eq],[neq] is allowed to use with %, or multiple options
`
  );
});

test("new UriQuerySearch('?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40')", () => {
  const uriQuery = new UriQuerySearch("?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40");
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery.error.error).toBe(false);
  expect(uriQuery.error.message).toBe("");
  expect(uriQuery._colsGet).toStrictEqual(["first", "second", "third"]);
  expect(uriQuery._colsSet.length).toBe(0);
  expect(uriQuery._colsFilter).toStrictEqual([
    { column: "second", comparisonOperator: "[eq]", compare: ["cho%", "suga%"] },
    { column: "third", comparisonOperator: "[neq]", compare: ["kossa"] },
    { column: "id", comparisonOperator: "[eq]", compare: ["3", "4"] },
    { column: "forth", comparisonOperator: "[eq]", compare: ["sa"] },
    { column: "id", comparisonOperator: "[ge]", compare: ["10"] },
    { column: "id", comparisonOperator: "[le]", compare: ["40"] },
  ]);
  expect(uriQuery._sortBy).toEqual([
    { column: "second", sortorder: "asc" },
    { column: "third", sortorder: "desc" },
  ]);

  const sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "SELECT 'first', 'second', 'third' FROM table WHERE ('second' LIKE 'cho%' OR 'second' LIKE 'suga%') AND 'third' != 'kossa' AND ('id' = '3' OR 'id' = '4') AND 'forth' = 'sa' AND 'id' >= '10' AND 'id' <= '40' ORDER BY 'second' asc, 'third' desc"
  );
});

test("new UriQuerySearch('?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40') + allfilter createdAt>=2020-01-01", () => {
  const uriQuery = new UriQuerySearch("?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40");
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery.error.error).toBe(false);
  expect(uriQuery.error.message).toBe("");
  expect(uriQuery._colsGet).toStrictEqual(["first", "second", "third"]);
  expect(uriQuery._colsSet.length).toBe(0);
  expect(uriQuery._colsFilter).toStrictEqual([
    { column: "second", comparisonOperator: "[eq]", compare: ["cho%", "suga%"] },
    { column: "third", comparisonOperator: "[neq]", compare: ["kossa"] },
    { column: "id", comparisonOperator: "[eq]", compare: ["3", "4"] },
    { column: "forth", comparisonOperator: "[eq]", compare: ["sa"] },
    { column: "id", comparisonOperator: "[ge]", compare: ["10"] },
    { column: "id", comparisonOperator: "[le]", compare: ["40"] },
  ]);
  expect(uriQuery._sortBy).toEqual([
    { column: "second", sortorder: "asc" },
    { column: "third", sortorder: "desc" },
  ]);

  let sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "SELECT 'first', 'second', 'third' FROM table WHERE ('second' LIKE 'cho%' OR 'second' LIKE 'suga%') AND 'third' != 'kossa' AND ('id' = '3' OR 'id' = '4') AND 'forth' = 'sa' AND 'id' >= '10' AND 'id' <= '40' ORDER BY 'second' asc, 'third' desc"
  );

  uriQuery.enforcedFilters.push({ column: "createdAt", comparisonOperator: "[ge]", compare: ["2020-01-01"] });
  expect(uriQuery.enforcedFilters).toStrictEqual([{ column: "createdAt", comparisonOperator: "[ge]", compare: ["2020-01-01"] }]);
  sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "SELECT 'first', 'second', 'third' FROM table WHERE ('second' LIKE 'cho%' OR 'second' LIKE 'suga%') AND 'third' != 'kossa' AND ('id' = '3' OR 'id' = '4') AND 'forth' = 'sa' AND 'id' >= '10' AND 'id' <= '40' AND 'createdAt' >= '2020-01-01' ORDER BY 'second' asc, 'third' desc"
  );
});

test("Start to test POST", () => {
  expect(true).toBe(true);
});

test('new UriQuerySearch("?cols=first=firstValue,second=secondValue", "POST")', () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue", "POST");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first=firstValue,second=secondValue");
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.preventWildcard).toBe(true);
  expect(uriQuery.error.error).toBe(false);
  expect(uriQuery.error.message).toBe("");
  expect(uriQuery._colsGet).toStrictEqual([]);
  expect(uriQuery._colsSet).toStrictEqual([
    { column: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { column: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery._colsFilter).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);

  let sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe("INSERT INTO table ('first', 'second') VALUES ('firstValue', 'secondValue')");
});

test('new UriQuerySearch("?cols=first=firstValue,second=secondValue", "POST")', () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue", "POST");
  uriQuery.requiredFilters.push({ column: "first" });
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.allowedSet).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([{ column: "first" }]);
  expect(uriQuery.requiredSet).toStrictEqual([{ column: "first" }]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.enforcedSet).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first=firstValue,second=secondValue");
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.preventWildcard).toBe(true);
  expect(uriQuery.error.error).toBe(false);
  expect(uriQuery.error.message).toBe("");
  expect(uriQuery._colsGet).toStrictEqual([]);
  expect(uriQuery._colsSet).toStrictEqual([
    { column: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { column: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery._colsFilter).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);

  let sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe("INSERT INTO table ('first', 'second') VALUES ('firstValue', 'secondValue')");
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue,third') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue,third", "POST");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.allowedSet).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.requiredSet).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.enforcedSet).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first=firstValue,second=secondValue,third");
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.preventWildcard).toBe(true);
  expect(uriQuery.error.error).toBe(true);
  expect(uriQuery.error.message).toBe(
    "third resulted in col: 'third' and comparisonOperator: 'undefined' compare: 'undefined'\n" +
      "comparisonOperator or compare is empty/missing\n" +
      "Got type POST, the only allowed comparisonOperator is [eq]. Got undefined\n"
  );
  expect(uriQuery._colsGet).toStrictEqual([]);
  expect(uriQuery._colsSet).toStrictEqual([]);
  expect(uriQuery._colsFilter).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);

  let sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "third resulted in col: 'third' and comparisonOperator: 'undefined' compare: 'undefined'\n" +
      "comparisonOperator or compare is empty/missing\n" +
      "Got type POST, the only allowed comparisonOperator is [eq]. Got undefined\n"
  );
});

test("new UriQuerySearch('?cols=first>=firstValue,second=secondValue,third') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first>=firstValue,second=secondValue,third", "POST");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.allowedSet).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.requiredSet).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.enforcedSet).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first>=firstValue,second=secondValue,third");
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.preventWildcard).toBe(true);
  expect(uriQuery.error.error).toBe(true);
  expect(uriQuery.error.message).toBe(
    "first>=firstValue resulted in col: 'first' and comparisonOperator: '[ge]' compare: '[\"firstValue\"]'\n" +
      "Got type POST, the only allowed comparisonOperator is [eq]. Got [ge]\n" +
      "third resulted in col: 'third' and comparisonOperator: 'undefined' compare: 'undefined'\n" +
      "comparisonOperator or compare is empty/missing\n" +
      "Got type POST, the only allowed comparisonOperator is [eq]. Got undefined\n"
  );
  expect(uriQuery._colsGet).toStrictEqual([]);
  expect(uriQuery._colsSet).toStrictEqual([]);
  expect(uriQuery._colsFilter).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);

  let sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "first>=firstValue resulted in col: 'first' and comparisonOperator: '[ge]' compare: '[\"firstValue\"]'\n" +
      "Got type POST, the only allowed comparisonOperator is [eq]. Got [ge]\n" +
      "third resulted in col: 'third' and comparisonOperator: 'undefined' compare: 'undefined'\n" +
      "comparisonOperator or compare is empty/missing\n" +
      "Got type POST, the only allowed comparisonOperator is [eq]. Got undefined\n"
  );
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue&filter=id=3') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue&filter=id=3", "POST");
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.enforcedCols).toStrictEqual([]);
  expect(uriQuery.allowedFilters).toStrictEqual([]);
  expect(uriQuery.allowedSet).toStrictEqual([]);
  expect(uriQuery.requiredFilters).toStrictEqual([]);
  expect(uriQuery.requiredSet).toStrictEqual([]);
  expect(uriQuery.enforcedFilters).toStrictEqual([]);
  expect(uriQuery.enforcedSet).toStrictEqual([]);
  expect(uriQuery.query).toBe("?cols=first=firstValue,second=secondValue&filter=id=3");
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.preventWildcard).toBe(true);
  expect(uriQuery.error.error).toBe(true);
  expect(uriQuery.error.message).toBe("id=3 resulted in col: 'id' and comparisonOperator: '[eq]' compare: '[\"3\"]'\n" + "Got a filter and type POST, filters are not used when create a object\n");
  expect(uriQuery._colsGet).toStrictEqual([]);
  expect(uriQuery._colsSet).toStrictEqual([]);
  expect(uriQuery._colsFilter).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);

  let sqlResponse = uriQuery.sqlGet("table");
  expect(sqlResponse instanceof Error ? sqlResponse.message : typeof sqlResponse === "string" ? sqlResponse : "").toBe(
    "id=3 resulted in col: 'id' and comparisonOperator: '[eq]' compare: '[\"3\"]'\n" + "Got a filter and type POST, filters are not used when create a object\n"
  );
});
