const UriQuerySearch = require("./uriQuerySearch");
let uri = "";

test("_comparisonOperator2SQL", () => {
  const uriQuery = new UriQuerySearch();
  expect(uriQuery._comparisonOperator2SQL("[eq]")).toBe("=");
  expect(uriQuery._comparisonOperator2SQL("[neq]")).toBe("!=");
  expect(uriQuery._comparisonOperator2SQL("[le]")).toBe("<=");
  expect(uriQuery._comparisonOperator2SQL("[lt]")).toBe("<");
  expect(uriQuery._comparisonOperator2SQL("[ge]")).toBe(">=");
  expect(uriQuery._comparisonOperator2SQL("[gt]")).toBe(">");
});

test("Start to test GET", () => {
  expect(true).toBe(true);
});

test("new UriQuerySearch('?cols=first,second')", () => {
  const uriQuery = new UriQuerySearch("?cols=first,second");
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  expect(uriQuery._cols).toStrictEqual(["first", "second"]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first,second"]);
  expect(uriQuery._filterQuerys.length).toBe(0);
  expect(uriQuery._allfiltersQuerys.length).toBe(0);
  expect(uriQuery._sortBy.length).toBe(0);
  expect(uriQuery._filters.length).toBe(0);
  expect(uriQuery._allfilters.length).toBe(0);
  expect(uriQuery._setValues.length).toBe(0);
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.filtersRequired.length).toBe(0);
  expect(uriQuery.allowedCols.length).toBe(0);
  expect(uriQuery.requiredSets.length).toBe(0);
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  const sqlRespnse = uriQuery.sqlGet("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toBe("SELECT 'first', 'second' FROM table");
});

test("new UriQuerySearch('?cols=first=2,second>20,third[asc]=John%[or]%Doe')", () => {
  const uriQuery = new UriQuerySearch("?cols=first=2,second>20,third[asc]=John%[or]%Doe");
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  expect(uriQuery._cols).toStrictEqual(["first", "second", "third"]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first=2,second>20,third[asc]=John%[or]%Doe"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([{ col: "third", sortorder: "asc" }]);
  expect(uriQuery._filters).toStrictEqual([
    [
      { col: "first", comparisonOperator: "[eq]", compare: ["2"] },
      { col: "second", comparisonOperator: "[gt]", compare: ["20"] },
      { col: "third", comparisonOperator: "[eq]", compare: ["John%", "%Doe"] },
    ],
  ]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([]);
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  const sqlRespnse = uriQuery.sqlGet("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toBe(
    "SELECT 'first', 'second', 'third' FROM table WHERE ('first' = '2' AND 'second' > '20' AND ('third' LIKE 'John%' OR 'third' LIKE '%Doe')) ORDER BY 'third' asc"
  );
});

test("new UriQuerySearch('?cols=first>2%,second>20,third[asc]=John%[or]%Doe') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first>2%,second>20,third[asc]=John%[or]%Doe");
  expect(uriQuery._error.error).toBe(true);
  expect(uriQuery._error.message).toBe('Invalid mix of compare: ["2%"] and comparisonOperator: [gt]\nOnly =,!=,[eq],[neq] is allowed to use with %, or multiple options\n');
  expect(uriQuery._cols).toStrictEqual(["second", "third"]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first>2%,second>20,third[asc]=John%[or]%Doe"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([{ col: "third", sortorder: "asc" }]);
  expect(uriQuery._filters).toStrictEqual([
    [
      { col: "second", comparisonOperator: "[gt]", compare: ["20"] },
      { col: "third", comparisonOperator: "[eq]", compare: ["John%", "%Doe"] },
    ],
  ]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([]);
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery._error.error).toBe(true);
  expect(uriQuery._error.message).toBe('Invalid mix of compare: ["2%"] and comparisonOperator: [gt]\nOnly =,!=,[eq],[neq] is allowed to use with %, or multiple options\n');
  const sqlRespnse = uriQuery.sqlGet("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(
    new Error('Invalid mix of compare: ["2%"] and comparisonOperator: [gt]\nOnly =,!=,[eq],[neq] is allowed to use with %, or multiple options\n')
  );
});

test("new UriQuerySearch('?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40')", () => {
  const uriQuery = new UriQuerySearch("?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40");
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  expect(uriQuery._cols).toStrictEqual(["first", "second", "third"]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first,second[asc]=cho%[or]suga%,third[desc][neq]kossa"]);
  expect(uriQuery._filterQuerys).toStrictEqual(["id=3[or]4,forth=sa", "id[ge]10,id[le]40"]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([
    { col: "second", sortorder: "asc" },
    { col: "third", sortorder: "desc" },
  ]);
  expect(uriQuery._filters).toStrictEqual([
    [
      { col: "second", comparisonOperator: "[eq]", compare: ["cho%", "suga%"] },
      { col: "third", comparisonOperator: "[neq]", compare: ["kossa"] },
    ],
    [
      { col: "id", comparisonOperator: "[eq]", compare: ["3", "4"] },
      { col: "forth", comparisonOperator: "[eq]", compare: ["sa"] },
    ],
    [
      { col: "id", comparisonOperator: "[ge]", compare: ["10"] },
      { col: "id", comparisonOperator: "[le]", compare: ["40"] },
    ],
  ]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([]);
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  const sqlRespnse = uriQuery.sqlGet("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(
    "SELECT 'first', 'second', 'third' FROM table WHERE (('second' LIKE 'cho%' OR 'second' LIKE 'suga%') AND 'third' != 'kossa') OR (('id' = '3' OR 'id' = '4') AND 'forth' = 'sa') OR ('id' >= '10' AND 'id' <= '40') ORDER BY 'second' asc, 'third' desc"
  );
});

test("new UriQuerySearch('?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40') + allfilter createdAt>=2020-01-01", () => {
  const uriQuery = new UriQuerySearch("?cols=first,second[asc]=cho%[or]suga%,third[desc][neq]kossa&filter=id=3[or]4,forth=sa&filter=id[ge]10,id[le]40");
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  expect(uriQuery._cols).toStrictEqual(["first", "second", "third"]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first,second[asc]=cho%[or]suga%,third[desc][neq]kossa"]);
  expect(uriQuery._filterQuerys).toStrictEqual(["id=3[or]4,forth=sa", "id[ge]10,id[le]40"]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([
    { col: "second", sortorder: "asc" },
    { col: "third", sortorder: "desc" },
  ]);
  expect(uriQuery._filters).toStrictEqual([
    [
      { col: "second", comparisonOperator: "[eq]", compare: ["cho%", "suga%"] },
      { col: "third", comparisonOperator: "[neq]", compare: ["kossa"] },
    ],
    [
      { col: "id", comparisonOperator: "[eq]", compare: ["3", "4"] },
      { col: "forth", comparisonOperator: "[eq]", compare: ["sa"] },
    ],
    [
      { col: "id", comparisonOperator: "[ge]", compare: ["10"] },
      { col: "id", comparisonOperator: "[le]", compare: ["40"] },
    ],
  ]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([]);
  expect(uriQuery.RESTType).toBe("GET");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(false);
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  let sqlRespnse = uriQuery.sqlGet("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(
    "SELECT 'first', 'second', 'third' FROM table WHERE (('second' LIKE 'cho%' OR 'second' LIKE 'suga%') AND 'third' != 'kossa') OR (('id' = '3' OR 'id' = '4') AND 'forth' = 'sa') OR ('id' >= '10' AND 'id' <= '40') ORDER BY 'second' asc, 'third' desc"
  );
  uriQuery.allfiltersQuerys.push("createdAt>=2020-01-01");
  sqlRespnse = uriQuery.sqlGet("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(
    "SELECT 'first', 'second', 'third' FROM table WHERE (('second' LIKE 'cho%' OR 'second' LIKE 'suga%') AND 'third' != 'kossa' AND 'createdAt' >= '2020-01-01') OR (('id' = '3' OR 'id' = '4') AND 'forth' = 'sa' AND 'createdAt' >= '2020-01-01') OR ('id' >= '10' AND 'id' <= '40' AND 'createdAt' >= '2020-01-01') ORDER BY 'second' asc, 'third' desc"
  );
});

test("Start to test POST", () => {
  expect(true).toBe(true);
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue')", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue", "POST");
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  expect(uriQuery._cols).toStrictEqual([]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first=firstValue,second=secondValue"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);
  expect(uriQuery._filters).toStrictEqual([]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([
    { col: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { col: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(true);
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  const sqlRespnse = uriQuery.sqlPost("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual("INSERT INTO table ('first','second') VALUES ('firstValue','secondValue')");
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue')", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue", "POST");
  uriQuery.requiredSets.push({ col: "first" });
  expect(uriQuery._error.error).toBe(false);
  expect(uriQuery._error.message).toBe("");
  expect(uriQuery._cols).toStrictEqual([]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first=firstValue,second=secondValue"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);
  expect(uriQuery._filters).toStrictEqual([]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([
    { col: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { col: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([{ col: "first" }]);
  expect(uriQuery.preventWildcard).toBe(true);
  const sqlRespnse = uriQuery.sqlPost("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual("INSERT INTO table ('first','second') VALUES ('firstValue','secondValue')");
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue,third') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue,third", "POST");
  expect(uriQuery._error.error).toBe(true);
  expect(uriQuery._error.message).toBe('type: cols, RESTType: POST, filterPart: {"col":"third"}, missing setvalues.');
  expect(uriQuery._cols).toStrictEqual([]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first=firstValue,second=secondValue,third"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);
  expect(uriQuery._filters).toStrictEqual([]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([
    { col: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { col: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(true);
  const sqlRespnse = uriQuery.sqlPost("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(new Error('type: cols, RESTType: POST, filterPart: {"col":"third"}, missing setvalues.'));
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue,third') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue,third", "POST");
  expect(uriQuery._error.error).toBe(true);
  expect(uriQuery._error.message).toBe('type: cols, RESTType: POST, filterPart: {"col":"third"}, missing setvalues.');
  expect(uriQuery._cols).toStrictEqual([]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first=firstValue,second=secondValue,third"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);
  expect(uriQuery._filters).toStrictEqual([]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([
    { col: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { col: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(true);
  const sqlRespnse = uriQuery.sqlPost("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(new Error('type: cols, RESTType: POST, filterPart: {"col":"third"}, missing setvalues.'));
});

test("new UriQuerySearch('?cols=first>=firstValue,second=secondValue,third') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first>=firstValue,second=secondValue,third", "POST");
  expect(uriQuery._error.error).toBe(true);
  expect(uriQuery._error.message).toBe(
    'type: cols, filterPart: {"col":"first","comparisonOperator":"[ge]","compare":["firstValue"]}type: cols, RESTType: POST, filterPart: {"col":"third"}, missing setvalues.'
  );
  expect(uriQuery._cols).toStrictEqual([]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first>=firstValue,second=secondValue,third"]);
  expect(uriQuery._filterQuerys).toStrictEqual([]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);
  expect(uriQuery._filters).toStrictEqual([]);
  expect(uriQuery._allfilters).toStrictEqual([]);

  expect(uriQuery._setValues).toStrictEqual([{ col: "second", comparisonOperator: "[eq]", compare: ["secondValue"] }]);
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(true);
  const sqlRespnse = uriQuery.sqlPost("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(
    new Error('type: cols, filterPart: {"col":"first","comparisonOperator":"[ge]","compare":["firstValue"]}type: cols, RESTType: POST, filterPart: {"col":"third"}, missing setvalues.')
  );
});

test("new UriQuerySearch('?cols=first=firstValue,second=secondValue&filter=id=3') Error", () => {
  const uriQuery = new UriQuerySearch("?cols=first=firstValue,second=secondValue&filter=id=3", "POST");
  expect(uriQuery._error.error).toBe(true);
  expect(uriQuery._error.message).toBe("Post having a filter");
  expect(uriQuery._cols).toStrictEqual([]);
  expect(uriQuery._colsQuerys).toStrictEqual(["first=firstValue,second=secondValue"]);
  expect(uriQuery._filterQuerys).toStrictEqual(["id=3"]);
  expect(uriQuery._allfiltersQuerys).toStrictEqual([]);
  expect(uriQuery._sortBy).toEqual([]);
  expect(uriQuery._filters).toStrictEqual([]);
  expect(uriQuery._allfilters).toStrictEqual([]);
  expect(uriQuery._setValues).toStrictEqual([
    { col: "first", comparisonOperator: "[eq]", compare: ["firstValue"] },
    { col: "second", comparisonOperator: "[eq]", compare: ["secondValue"] },
  ]);
  expect(uriQuery.RESTType).toBe("POST");
  expect(uriQuery.filtersRequired).toStrictEqual([]);
  expect(uriQuery.allowedCols).toStrictEqual([]);
  expect(uriQuery.requiredSets).toStrictEqual([]);
  expect(uriQuery.preventWildcard).toBe(true);
  const sqlRespnse = uriQuery.sqlPost("table");
  expect(sqlRespnse ? sqlRespnse : typeof sqlRespnse === "string" ? sqlRespnse : "").toEqual(new Error("Post having a filter"));
});

test("Start to test PATCH", () => {
  expect(true).toBe(true);
});
