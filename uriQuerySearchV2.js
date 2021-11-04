/*
cols = columns that will be shown, filters possible. GET
cols = columns that will be changed/set, including new values. PUT, POST, PATCH
sortBy = column to sort by. GET
filter = columns to filter by. GET, PUT, POST, PATCH and DELETE

Cheat sheet
GET = get data (enforce cols)
POST = create new entry (enforce cols)
PUT = Update entire entry (enforce cols + filter with =)
PATCH = Update part of entry (enforce cols + filter with =)

Operators
Between column name and value
= Equal
[eq] Equal
[ne] Not equal
[lt] less than
[le] less than or equal
[gt] greater than
[ge] greater than or equal
[or] logical or, Only to be used with [eq] or [neq]
% is wildcard like *
After columnname
[asc] sort asc
[desc] sort desc

*/

function createFilterPart(column, comparisonOperator, compare) {
  const filterPart = {};
  filterPart.column = column;
  filterPart.comparisonOperator = comparisonOperator ? this.SQL2comparisonOperator(comparisonOperator) : undefined;
  if (Array.isArray(compare)) {
    filterPart.compare = compare;
  } else if (typeof myVar === "string") {
    filterPart.compare = compare.split("[or]");
  } else {
    filterPart.compare = undefined;
  }
  return filterPart;
}

const sqlString = require("sqlstring");

module.exports = class uriQuery {
  constructor(query = "", RESTTypes = "GET") {
    this.allowedCols = []; // Columns allowed to get/set
    this.enforcedCols = []; // Columns required to get/set
    this.allowedFilters = []; // if set, only this Filterparts allowed in querys fi
    this.allowedSet = this.allowedFilters;
    this.requiredFilters = []; // Filterparts required on each query {column: column, comparisonOperator: comparisonOperator}
    this.requiredSet = this.requiredFilters;
    this.enforcedFilters = []; // Filterparts enforced on all filters {column: column, comparisonOperator: comparisonOperator, compare: compare}
    this.enforcedSet = this.enforcedFilters;
    this._query = query; // Will contain the original query string. Any change should trigger queryUpdate()

    this._RESTType = RESTTypes.toUpperCase();
    this._preventWildcard = this._RESTType === "GET" ? false : true;
    this._colsGet = []; // Array of column names to get. Names only allowed if exists in allowedCols or allowedCols is empty.
    this._colsSet = []; // Array of objects to set. Object should look like this. {col: "columnName", value: "newValue"}
    // Names only allowed if exists in allowedCols or allowedCols is empty.
    this._colsFilter = []; // Array of filter objects, at least one of the filters must match all the parts included in a filter in filtersRequired
    this._sortBy = []; // Array of column names, in the order they should be sorted. {column: column, sortorder: (asc|desc)}
    this._error = { error: false, message: "" };

    this.escape = sqlString.escape; // What function to use to escape sql variables
    this.sql = this.createSQL;
    this.sqlGet = this.createSQL;
    if (query) this.queryUpdate(); // If query is not empty try to update
  }

  get query() {
    return this._query;
  }

  set query(q) {
    if (this._query !== q || this._queryOrg !== q) {
      this._query = q;
      this._queryOrg = q;
      this.queryUpdate();
    }
  }

  get RESTType() {
    return this._RESTType;
  }

  set RESTType(r) {
    if (this._RESTType !== r.toUpperCase) {
      this._RESTType = r.toUpperCase();
      this.queryUpdate();
    }
  }

  get preventWildcard() {
    return this._preventWildcard;
  }

  set preventWildcard(boolean) {
    if (this._preventWildcard != boolean) {
      this._preventWildcard = boolean;
      this.queryUpdate();
    }
  }

  get error() {
    return this._error;
  }

  comparisonOperator2SQL(comparisonOperator) {
    if (comparisonOperator === "=") return comparisonOperator;
    if (comparisonOperator === ">=") return comparisonOperator;
    if (comparisonOperator === "<=") return comparisonOperator;
    if (comparisonOperator === "!=") return comparisonOperator;
    if (comparisonOperator === ">") return comparisonOperator;
    if (comparisonOperator === "<") return comparisonOperator;
    if (comparisonOperator === "[neq]") return "!=";
    if (comparisonOperator === "[eq]") return "=";
    if (comparisonOperator === "[le]") return "<=";
    if (comparisonOperator === "[lt]") return "<";
    if (comparisonOperator === "[ge]") return ">=";
    if (comparisonOperator === "[gt]") return ">";
    throw new Error("comparisonOperator2SQL got invalid comparisonOperator " + comparisonOperator);
  }

  SQL2comparisonOperator(comparisonOperator) {
    if (comparisonOperator === "=") return "[eq]";
    if (comparisonOperator === ">=") return "[ge]";
    if (comparisonOperator === "<=") return "[le]";
    if (comparisonOperator === "!=") return "[neq]";
    if (comparisonOperator === ">") return "[gt]";
    if (comparisonOperator === "<") return "[lt]";
    if (comparisonOperator === "[neq]") return comparisonOperator.toLowerCase();
    if (comparisonOperator === "[eq]") return comparisonOperator.toLowerCase();
    if (comparisonOperator === "[le]") return comparisonOperator.toLowerCase();
    if (comparisonOperator === "[lt]") return comparisonOperator.toLowerCase();
    if (comparisonOperator === "[ge]") return comparisonOperator.toLowerCase();
    if (comparisonOperator === "[gt]") return comparisonOperator.toLowerCase();
    throw new Error("SQL2comparisonOperator got invalid comparisonOperator " + comparisonOperator);
  }

  queryUpdate() {
    this._colsGet = [];
    this._colsSet = [];
    this._colsFilter = [];
    this._sortBy = [];
    this._error = { error: false, message: "" };

    // Add to _colsGet
    this.enforcedCols.forEach((d) => {
      if (typeof d === "object") {
        // If no column is set.
        if (!d.column && (d.comparisonOperator || d?.compare?.length > 0)) {
          this._error.error = true;
          if (this._error.message) this._error.message += "\n";
          this._error.message = "enforcedCols=" + JSON.stringify(d) + " contains comparisonOperator and/or compare but no column";
        }
        // if there is a comparisonOperator but nothing to compare to (compare)
        if (d.comparisonOperator && !(d?.compare?.length > 0)) {
          this._error.error = true;
          if (this._error.message) this._error.message += "\n";
          this._error.message = "enforcedCols=" + JSON.stringify(d) + " contains comparisonOperator but no compare";
        }
        // if there is a compare but no comparisonOperator
        if (!d.comparisonOperator && d?.compare?.length > 0) {
          this._error.error = true;
          if (this._error.message) this._error.message += "\n";
          this._error.message = "enforcedCols=" + JSON.stringify(d) + " contains compare but no comparisonOperator";
        }
        // make sure the comparisonOperator is a correct one
        if (d.comparisonOperator) {
          try {
            d.comparisonOperator = SQL2comparisonOperator(d.comparisonOperator);
          } catch (e) {
            this._error.error = true;
            if (this._error.message) this._error.message += "\n";
            this._error.message = e.message;
          }
        }
        //
        if (!this._error.error) {
          if (d.column) {
            switch (this._RESTType) {
              case "GET":
                this._colsGet.push(d.column);
                if (d.comparisonOperator && d?.compare?.length > 0) this._colsFilter.push(d);
                break;
              case "POST":
              case "PATCH":
              case "DELETE":
                this._colsSet.push(d);
                break;
            }
          }
        }
      } else if (this._RESTType === "GET") {
        this._colsGet.push(d);
      }
    });

    function extractSortOrder(queryString) {
      // extract asc / desc columns
      const regexSortOrder = /(\w+)\[(asc|desc)\]/gi;
      // For each asc/desc found....
      let sortOrder;
      while ((sortOrder = regexSortOrder.exec(queryString))) {
        let sortobj = {};
        sortobj.column = sortOrder[1];
        sortobj.sortorder = sortOrder[2];
        this._sortBy.push(sortobj);
      }
      // remove the [asc]/[desc] using the same regex ensuring only extracted ones are removed.
      queryString = queryString.replace(regexSortOrder, "$1");
      return queryString;
    }

    // Takes cols or a filter part and add to this.sortBy, this.cols,
    function queryHandler(queryString, type) {
      // Find all the "queryString" arguments
      const newFilter = []; // a complete filter created from filterparts.
      // Find the 3parts of a URL col, comparisonOperator and compare (what to find)
      const regex = /(\w+)(\!=|<>|\[neq\]|<=|\[le\]|\>=|\[ge\]|<|\[lt\]|>|\[gt\]|=|\[eq\])?((\w|-|\.|\%|\[or\])+)?/gi;
      let filterparts;
      while ((filterparts = regex.exec(queryString))) {
        const filterpartFull = filterparts[0];
        const col = filterparts[1];
        const comparisonOperator = filterparts[2] && this.SQL2comparisonOperator(filterparts[2]);
        const compare = filterparts[3] && filterparts[3].split("[or]");
        const error = this._error;

        // if not type cols and col, comparisonOperator or compare is empty/missing/invalid.
        if (!col) {
          error.error = true;
          error.message += "col is missing/empty\n";
        }
        if (type !== "cols" && (!comparisonOperator || !compare?.length)) {
          error.error = true;
          error.message += "comparisonOperator is missing/empty/invalid or compare is missing/empty\n";
        }
        // If comparisonOperator or compare is empty/missing
        if (this._RESTType !== "GET" && (!comparisonOperator || !compare?.length)) {
          error.error = true;
          error.message += "comparisonOperator or compare is empty/missing\n";
        }
        // preventWildcard is true but there is wildcards
        if (this.preventWildcard && compare?.length > 0 && compare.some((comparePart) => comparePart.includes("%"))) {
          error.error = true;
          error.message += "preventWildcard set to true but found % in compare " + JSON.stringify(compare)+"\n";
        }
        //
        if (this._RESTType === "POST" && type === "filter") {
          error.error = true;
          error.message += "Got a filter and type POST, filters are not used when create a object\n";
        }
        // If comparisonOperator is not [eq] or [neq] and compare contains a % or compare contain more than one value
        if ((compare || comparisonOperator) && !/\[n?eq\]/i.test(comparisonOperator) && (compare?.length !== 1 || compare?.some((comparePart) => comparePart?.includes("%")))) {
          // Todo if broken filterPart break
          error.error = true;
          error.message += "Invalid mix of compare: " + JSON.stringify(compare) + " and comparisonOperator: " + comparisonOperator + "\n";
          error.message += "Only =,!=,[eq],[neq] is allowed to use with %, or multiple options\n";
        }
        // Only allowed comparisonOperator [eq] is allowed when RESTType is not GET
        if (this._RESTType !== "GET" && comparisonOperator !== "[eq]") {
          error.error = true;
          error.message += "Got type " + this._RESTType + ", the only allowed comparisonOperator is [eq]. Got " + comparisonOperator+"\n";
        }

        // Create the filterpart.
        const filterPart = createFilterPart.call(this, col, comparisonOperator, compare);
        switch (type) {
          case "filter":
            this._colsFilter.push(filterPart);
            break;
          case "cols":
            switch (this._RESTType) {
              case "GET":
                if (col && (this.allowedCols.length === 0 || this.allowedCols.includes(col))) {
                  this._colsGet.push(filterPart.column);
                } else {
                  error.error = true;
                  error.message += "col:" + col + " is not in allowedCols " + JSON.stringify(allowedCols) + "\n";
                }
              case "DELETE":
                if (filterPart.comparisonOperator && filterPart?.compare?.length > 0) this._colsFilter.push(filterPart);
                break;
              case "POST":
              case "PATCH":
                if (col && (this.allowedCols.length === 0 || this.allowedCols.includes(col))) {
                  this._colsSet.push(filterPart);
                } else {
                  error.error = true;
                  error.message += "col:" + col + " is not in allowedCols " + JSON.stringify(allowedCols) + "\n";
                }
                break;
            }
            break;
        }
        if (error.error) {
          error.message = filterpartFull + " resulted in col: '" + col + "' and comparisonOperator: '" + comparisonOperator + "' compare: '" + JSON.stringify(compare) + "'\n" + error.message;
          this._colsFilter.length = 0;
          this._colsGet.length = 0;
          this._colsSet.length = 0;
          this._sortBy.length = 0;
        }
      }
    }

    let query = "";
    // remove any leading '?'
    query = this._query.charAt(0) === "?" ? this._query.slice(1) : this._query;

    query = extractSortOrder.call(this, query);

    let queryArray = query.split("&");
    const colsQuerys = [];
    const filterQuerys = [];
    queryArray.forEach((queryPart) => {
      if (queryPart.slice(0, 5).toLowerCase() === "cols=") {
        colsQuerys.push(queryPart.slice(5));
      } else if (queryPart.slice(0, 7).toLowerCase() === "filter=") {
        filterQuerys.push(queryPart.slice(7));
      }
    });
    colsQuerys.forEach((colsQuery) => {
      queryHandler.call(this, colsQuery, "cols");
    });
    filterQuerys.forEach((filterQuery) => {
      queryHandler.call(this, filterQuery, "filter");
    });

    // If no cols are defined and allowedCols are defined then return all allowedCols
    if (this._colsGet.length === 0 && this.allowedCols.length) {
      cols.push(...allowedCols);
    }

    // verify that all required setValues are defined
    if (this.enforcedCols?.length) {
      for (let i = 0; i < this.requiredSets.length; i++) {
        const rSet = this.enforcedCols[i];
        // if the is only column assume it's [eq] (this should not happen)
        if (!rSet.comparisonOperator) rSet.comparisonOperator = "[eq]";
        const found = this._colsSet.some((setV) => rSet.column === setV.column && (!rSet.comparisonOperator || rSet.comparisonOperator === setV.comparisonOperator));
        if (!found) {
          this._error.error = true;
          this._error.message += "Required set " + JSON.stringify(setV) + " was not found among the sets " + JSON.stringify(this._colsSet);
          if (this._error.message) this._error.message += "\n";
        }
      }
    }

    if (this.enforcedFilters?.length) {
      for (let i = 0; i < this.enforcedFilters.length; i++) {
        const filterR = this.enforcedFilters[i];
        // if the is only column assume it's [eq]
        if (!filterR.comparisonOperator) filterR.comparisonOperator = "[eq]";
        const found = this._colsFilter.some((fil) => fil.column === filterR.column && fil.comparisonOperator === filterR.comparisonOperator && fil.compare === filterR.compare);
        if (!found) {
          this._colsFilter.push(filterR);
        }
      }
    }

    // verify that all required filtersRequired are used
    if (this.requiredFilters?.length) {
      // for each required filter,
      for (let i = 0; i < this.requiredFilters.length; i++) {
        //
        const filterR = this.requiredFilters[i];
        // if the is only column assume it's [eq]
        if (!filterR.comparisonOperator) filterR.comparisonOperator = "[eq]";
        let found = this._colsFilter.some(
          (fil) => fil.column === filterR.column && (!fil.comparisonOperator || this.SQL2comparisonOperator(fil.comparisonOperator) === this.SQL2comparisonOperator(filterR.comparisonOperator))
        );
        found =
          found ||
          this._colsSet.some(
            (fil) => fil.column === filterR.column && (!fil.comparisonOperator || this.SQL2comparisonOperator(fil.comparisonOperator) === this.SQL2comparisonOperator(filterR.comparisonOperator))
          );
        if (!found) {
          this._error.error = true;
          this._error.message += "Required filter " + JSON.stringify(filterR) + " is not found among the filters " + JSON.stringify(filterR);
          if (this._error.message) this._error.message += "\n";
        }
      }
    }
  }

  createSQL(table) {
    this.queryUpdate();
    if (!table) return new Error("sqlGet missing argument");
    if (this._error.error) return new Error(this._error.message);
    let sql = "";
    const esc = this.escape;
    switch (this.RESTType) {
      case "GET":
        sql = "SELECT ";
        sql += this._colsGet
          .filter((c) => !this.allowedCols.length || this.allowedCols.includes(c)) // remove any column that don't exist in allowedCols. If AllowedCols is empty allow all.
          .map((col) => esc(col)) // create new array with escaped columns
          .join(", "); // create a comma separated list of
        sql += " FROM " + table;
        break;
      case "POST":
        sql = "INSERT INTO " + table + " (";
        sql += this._colsSet
          .filter((c) => !this.allowedCols.length || this.allowedCols.includes(c)) // remove any column that don't exist in allowedCols. If AllowedCols is empty allow all.
          .map((col) => esc(col.column)) // create new array with escaped columns
          .join(", "); // create a comma separated list of
        sql += ") VALUES (";
        sql += this._colsSet
          .filter((c) => !this.allowedCols.length || this.allowedCols.includes(c)) // remove any column that don't exist in allowedCols. If AllowedCols is empty allow all.
          .map((col) => esc(col.compare)) // create new array with escaped columns
          .join(", "); // create a comma separated list of
        sql += ") FROM " + table;
        break;
    }
    sql += this.createSQLwhere();
    sql += this.createSQLOrder();
    return sql;
  }

  createSQLOrder() {
    let string = "";
    const esc = this.escape;
    if (this._sortBy.length > 0) string += " ORDER BY ";
    for (let i = 0; i < this._sortBy.length; i++) {
      string += esc(this._sortBy[i].column) + " " + this._sortBy[i].sortorder;
      if (i + 1 !== this._sortBy.length) string += ", ";
    }
    return string;
  }

  createSQLwhere() {
    let string = "";
    const esc = this.escape;
    // if there is any filter in filters add "WHERE"
    if (this._colsFilter.length > 0) {
      string += " WHERE ";
    }
    // each filter should be inside paranthesis and have "OR" after it.
    const filter = this._colsFilter;
    // If the number of filterParts is more than one add a paranthesis around it.
    // if (filter.length > 1) string += "(";
    for (let i2 = 0; i2 < filter.length; i2++) {
      const filterPart = filter[i2];
      // if any wildcard we need to split it with " OR " between as sql in don't handle wildcards.
      if (filterPart.compare.find((e) => e.includes("%"))) {
        // if more than one compare add "("
        if (filterPart.compare.length > 1) string += "(";
        for (let i3 = 0; i3 < filterPart.compare.length; i3++) {
          string += esc(filterPart.column) + " ";
          // string += this._comparisonOperator2SQL(filterPart.comparisonOperator);
          string += "LIKE";
          string += " ";
          string += esc(filterPart.compare[i3]);
          // If we are not one the last entity add " OR "
          if (i3 + 1 !== filterPart.compare.length) string += " OR ";
        }
        // if more than one compare add ")"
        if (filterPart.compare.length > 1) string += ")";
      } else if (filterPart.operator === "[neq]" || filterPart.operator === "[eq]") {
        // if more than one compare add "("
        if (filterPart.compare.length > 1) string += "(";
        for (let i3 = 0; i3 < filterPart.compare.length; i3++) {
          string += esc(filterPart.column) + " ";
          // create the not in / in string
          if (filterPart.operator === "[neq]") string += "NOT ";
          // the map will escape each string in array, they we join it by ","
          if (filterPart.operator === "[eq]") string += "in " + "(" + filterPart.compare.map((column) => esc(column)).join(",") + ") ";
        }
        // if more than one compare add ")"
        if (filterPart.compare.length > 1) string += ")";
      } else {
        // if more than one compare add "("
        if (filterPart.compare.length > 1) string += "(";
        for (let i3 = 0; i3 < filterPart.compare.length; i3++) {
          string += esc(filterPart.column) + " ";
          string += this.comparisonOperator2SQL(filterPart.comparisonOperator);
          string += " ";
          string += esc(filterPart.compare[i3]);
          // If we are not one the last entity add " OR "
          if (i3 + 1 !== filterPart.compare.length) string += " OR ";
        }
        // if more than one compare add ")"
        if (filterPart.compare.length > 1) string += ")";
      }
      // If we are not on the last filter add "AND" otherwise if there is more than one filter add ")"
      if (filter.length !== i2 + 1) {
        string += " AND ";
      } else {
        //if (filter.length > 1) string += ")";
      }
    }

    return string;
  }
};
