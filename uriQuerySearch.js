/*
cols = columns that will be shown
filter = filter that will be used (in addition to what ever is specified in cols)
each set of filter (all values in a filter will have AND between them, but between two filters there will be OR)
sortBy = what will the result be sorted by, considered in the order they are in the array.

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

cols are the columns to be returned. Cols can contain basic filters and sorting.
filter 

-----------------
// Get the columns kaka, baka, vaka and sort asc by vaka
?cols=kaka,baka,vaka[asc]
// Get the columns kaka, baka, vaka and sort asc by baka and secondary by vaka (filter always take presence)
?cols=kaka,baka,vaka[asc]&filter=baka[asc]

// Diffrent ways to get the columns kaka where id = 1 or 2.
?cols=kaka,id=1[or]2
?cols=kaka,id[eq]1[or]2
?cols=kaka,id[eq]1[or]2
?cols=kaka&filter=id=1[or]2
?cols=kaka&filter=id=1&filter=id=2

// Get the columns kaka where baka starts with cho or suga
?cols=kaka,baka=cho%[or]suga%
// Get the columns kaka where baka starts with cho or suga and saka is not equal to kossa
?cols=kaka,baka=cho%[or]suga%,saka[neq]kossa
// Get the columns kaka where baka starts with cho or suga and saka is not equal to kossa
// OR id is 4 or 5 OR id is greater or equal than 10 AND id is less than or equal than 40
?cols=kaka,baka=cho%[or]suga%,saka[neq]kossa&filter=id=3[or]4&filter=id[ge]10,id[le]40

*/

const sqlString = require("sqlstring");

module.exports = class uriQuery {
  constructor(query = "", RESTType = "GET") {
    // Anything starting with _ is automatically updated when query is set, the rest should be set manually.
    this._query = query; // Will contain the original query string. Any change should trigger queryUpdate()
    this._colsQuerys = []; // Will contain the part of the query string that handles cols
    this._filterQuerys = []; // Will contain the parts of the query string that handles filters
    this.allfiltersQuerys = []; // Will contain the parts of the query string, or manually added strings that should be added to all filters;
    this._allfiltersQuerys = []; // Will contain the parts of the query string, or manually added strings that should be added to all filters;
    this._setValues = []; // This will contain any filters from cols, used to set values using put,post, patch
    this._cols = []; // Will contain a array of the column names
    this._filters = []; // Will contain a array of filter objects filters[filterObject][filterPart]. "AND" will be set between filterParts, "OR" between filterObject
    // For get this will also contain any filters from colsQuerys
    this._allfilters = []; // will contain filterParts that will be added to each filterObject within filters.
    this._RESTType = RESTType.toUpperCase(); // Can be GET, POST, PATCH or DELETE
    this.filtersRequired = []; // Will contain filterpart without compare that is required. For patch {col: 'id', comparisonOperator: '='} is a good idea to require id to update. Filters not having this filterpart will be discarded.
    this.allowedCols = []; // Can contain column query is allowed to get/patch. (cols and setValues will be cleared of anything not in this.)
    this.requiredSets = []; // Can contain column query is allowed to patch. (error will be thrown if setValues or cols do not contain all of those)
    this.preventWildcard = this._RESTType === "GET" ? false : true;
    this._sortBy = []; // Can contain array of objects defining sort order. Order will be the same as in this array
    this._error = { error: false, message: "" };

    this.escape = sqlString.escape; // What function to use to escape sql variables

    if (query) this.queryUpdate(); // If query is not empty update the rest of the variables
  }

  get query() {
    return this._query;
  }

  set query(q) {
    this._query = q;
    this._queryOrg = q;
    this.queryUpdate();
  }

  get RESTType() {
    return this._RESTType;
  }

  set RESTType(r) {
    this._RESTType = r.toUpperCase();
    this.queryUpdate();
  }

  _comparisonOperator2SQL(comparisonOperator) {
    if (comparisonOperator === "[neq]") return "!=";
    if (comparisonOperator === "[eq]") return "=";
    if (comparisonOperator === "[le]") return "<=";
    if (comparisonOperator === "[lt]") return "<";
    if (comparisonOperator === "[ge]") return ">=";
    if (comparisonOperator === "[gt]") return ">";
  }

  queryUpdate() {
    // clear things that should be initialized by the query
    const colsQuerys = (this._colsQuerys = []);
    const filterQuerys = (this._filterQuerys = []);
    const allfiltersQuerys = (this._allfiltersQuerys = []);
    allfiltersQuerys.push(...this.allfiltersQuerys);
    const setValues = (this._setValues = []);
    const cols = (this._cols = []);
    const filters = (this._filters = []);
    const allfilters = (this._allfilters = []);
    const sortBy = (this._sortBy = []);

    const filtersRequired = this.filtersRequired;
    const allowedCols = this.allowedCols;
    const RESTType = this._RESTType;
    const requiredSets = this.requiredSets;

    const preventWildcard = this.preventWildcard = RESTType === 'GET' ? false : true;
    const error = this._error;
    error.error = false;
    error.message = "";

    // Make the sql function point to the correct sql function
    switch (RESTType) {
      case 'DELETE':
        this.sql = this.sqlDelete;
        break;
      case 'POST':
        this.sql = this.sqlPost;
        break;
      case 'PATCH':
        this.sql = this.sqlPatch;
        break;
      case 'GET':
      default:
        this.sql = this.sqlGet;
    }

    // remove any leading '?'
    let query = this._query.charAt(0) === "?" ? this._query.slice(1) : this._query;
    let queryArray = query.split("&");
    queryArray.forEach((queryPart) => {
      if (queryPart.slice(0, 5).toLowerCase() === "cols=") {
        colsQuerys.push(queryPart.slice(5));
      } else if (queryPart.slice(0, 7).toLowerCase() === "filter=") {
        filterQuerys.push(queryPart.slice(7));
      } else if (queryPart.slice(0, 10).toLowerCase() === "filterall=") {
        allfiltersQuerys.push(queryPart.slice(10));
        allfiltersQuerys.push(this.allfiltersQuerys); // Add anything manually added.
      }
    });

    function extractSortOrder(queryString) {
      // extract asc / desc columns
      const regexSortOrder = /(\w+)\[(asc|desc)\]/gi;
      // For each asc/desc found....
      let sortOrder;
      while ((sortOrder = regexSortOrder.exec(queryString))) {
        let sortobj = {};
        sortobj.col = sortOrder[1];
        sortobj.sortorder = sortOrder[2];
        sortBy.push(sortobj);
      }
      // remove the [asc]/[desc] using the same regex ensuring only extracted ones are removed.
      queryString = queryString.replace(regexSortOrder, "$1");
      return queryString;
    }

    function comparisonOperatorNormalizer(comparisonOperator) {
      if (comparisonOperator === "=") return "[eq]";
      if (comparisonOperator === ">=") return "[ge]";
      if (comparisonOperator === "<=") return "[le]";
      if (comparisonOperator === "!=") return "[neq]";
      if (comparisonOperator === ">") return "[gt]";
      if (comparisonOperator === "<") return "[lt]";
      return comparisonOperator.toLowerCase();
    }

    // Takes cols or a filter part and add to this.sortBy, this.cols,
    function queryHandler(queryString, type) {
      queryString = extractSortOrder(queryString);
      // Find all the "queryString" arguments
      const newFilter = []; // a complete filter created from filterparts.
      // Find the 3parts of a URL col, comparisonOperator and compare (what to find)
      const regex = /(\w+)(\!=|<>|\[neq\]|<=|\[le\]|\>=|\[ge\]|<|\[lt\]|>|\[gt\]|=|\[eq\])?((\w|-|\.|\%|\[or\])+)?/gi;
      let filterparts;
      while ((filterparts = regex.exec(queryString))) {
        const filterpartFull = filterparts[0];
        const col = filterparts[1];
        const comparisonOperator = filterparts[2] && comparisonOperatorNormalizer(filterparts[2]);
        const compare = filterparts[3] && filterparts[3].split("[or]");
        /*
        if (type === "cols" && !comparisonOperator && (!compare || compare.length === 0)) {
          // this is just a column to show. Do nothing.
        } else */
        // if not type col and any of comparisonOperator or compare is empty.
        if (type !== "cols" && (!comparisonOperator || !(compare && compare.length))) {
         // if (!(type === "cols" && !comparisonOperator && (!compare || compare.length === 0)) && (!comparisonOperator || compare.length === 0)) {
          // Todo if broken filterPart break
          error.error = true;
          error.message += filterpartFull + " resulted in col: '" + col + "' and comparisonOperator: '" + comparisonOperator + "' cannot work with that so ignoring rule.\n";
        } else if (type === 'cols' && (comparisonOperator && !(compare && compare.length) || !comparisonOperator && (compare && compare.length))){
          // if type cols and one of compare or comparisonOperator contain data but not the other.
          error.error = true;
          error.message += filterpartFull + " resulted in col: '" + col + "' and comparisonOperator: '" + comparisonOperator + "' cannot work with that so ignoring rule.\n";
        } else if (preventWildcard && compare && compare.some((comparePart) => comparePart.includes("%"))) {
          error.error = true;
          error.message += "preventWildcard is true and compare contains % (" + JSON.stringify(compare) + ")\n";
        } else {
          // Create the filterpart.
          const filterPart = {
            col: col,
            comparisonOperator: comparisonOperator,
            compare: compare,
          };

          // If comparisonOperator is not [eq] or [neq] and compare contains a % or compare contain more than one value
          if (!/\[n?eq\]/i.test(filterPart.comparisonOperator) &&  filterPart.compare && (filterPart.compare.find((e) => e.includes("%")) || filterPart.compare.length != 1)) {
            // Todo if broken filterPart break
            error.error = true;
            error.message += "Invalid mix of compare: " + JSON.stringify(filterPart.compare) + " and comparisonOperator: " + filterPart.comparisonOperator + "\n";
            error.message += "Only =,!=,[eq],[neq] is allowed to use with %, or multiple options\n";
          } else if (type === "allfilters") {
            // If not problem with filterpart, add it to the filter (or allfilters)
            allfilters.push(filterPart);
          } else if (type === "filters" && RESTType === "POST") {
            // if type is filters, Filterparts are always added to filter unless RESTType is POST, as filters are not used when create a object.
            error.error = true;
            error.message += "Post having a filter";
          } else if (type === "filters" && RESTType !== "POST") {
            // if type is filters, Filterparts are always added to filter unless RESTType is POST, as filters are not used when create a object.
            newFilter.push(filterPart);
          } else if (type === "cols" && RESTType === "GET") {
            // if type cols and filterpart is complete, add to filter
            if (filterPart.comparisonOperator && filterPart.compare) newFilter.push(filterPart);

            // If type is cols add it to cols if allowed (or allowedCols is empty).
            if (col && (allowedCols.length === 0 || allowedCols.includes(col))) {
              cols.push(col);
            } else {
              console.log("Ignored " + col + "\n");
            }
          } else if (type === "cols" && RESTType === "DELETE" && comparisonOperator === "[eq]") {
            newFilter.push(filterPart);
          } else if (type === "cols" && (RESTType === "POST" || RESTType === "PATCH") && comparisonOperator === "[eq]") {
            if (allowedCols.length === 0 || allowedCols.includes(col[1])) {
              setValues.push(filterPart);
            }
          } else if (type === "cols" && (RESTType === "POST" || RESTType === "PATCH") && (!comparisonOperator || !compare)) {
            error.error = true;
            error.message += "type: " + type + ", RESTType: " + RESTType + ", filterPart: " + JSON.stringify(filterPart) + ", missing setvalues.";
          } else if (type === "cols" && RESTType === "PATCH" && comparisonOperator === "[eq]") {
            setValues.push(filterPart);
          } else if (type === "cols" && comparisonOperator === "[eq]" && (allowedCols.length === 0 || allowedCols.includes(col[1]))) {
            // cols is used as setters for POST/PUT/PATCH, and only = is okay. And the col must be allowed.
            setValues.push(filterPart);
          } else {
            error.error = true;
            error.message += "type: " + type + ", filterPart: " + JSON.stringify(filterPart);
          }
        }
      }

      // If no filter data don't ad a new filter
      if (newFilter.length > 0) {
        if (type !== "allfilters") {
          filters.push(newFilter);
        }
      }
    }

    colsQuerys.forEach((colsQuery) => {
      queryHandler(colsQuery, "cols");
    });
    filterQuerys.forEach((filterQuery) => {
      queryHandler(filterQuery, "filters");
    });
    allfiltersQuerys.forEach((filterQuery) => {
      queryHandler(filterQuery, "allfilters");
    });
    allfilters.forEach((allfilterPart) => {
      filters.forEach((orgFilter) => {
        let allfilterFound = orgFilter.some(
          (orgFilterPart) => allfilterPart.col === orgFilterPart.col && allfilterPart.comparisonOperator === orgFilterPart.comparisonOperator && allfilterPart.compare === orgFilterPart.compare
        );
        if (!allfilterFound) orgFilter.push(allfilterPart);
      });
    });

    // If no cols are defined and allowedCols are defined then return all allowedCols
    if (!colsQuerys.length && allowedCols.length) {
      cols.push(...allowedCols);
    }

    // verify that all required setValues are defined
    if (requiredSets.length) {
      for (let i = 0; i < requiredSets.length; i++) {
        const rSet = requiredSets[i];
        if(!rSet.comparisonOperator) rSet.comparisonOperator = '[eq]';
        const found = setValues.some((setV) => (rSet.col === setV.col && (!rSet.comparisonOperator || rSet.comparisonOperator === setV.comparisonOperator)));
        if (!found) {
          this._error.error = true;
          this._error.message += "Required setValue " + JSON.stringify(rSet) + " is missing.\n";
        }
      }
    }
    if (filtersRequired.length) {
      for (let i = 0; i < filtersRequired.length; i++) {
        const filterR = filtersRequired[i];
        if(!filterR.comparisonOperator) filterR.comparisonOperator = '[eq]';
        const found = this._filters.some((fil) => fil.col === filterR.col && (!fil.comparisonOperator || fil.comparisonOperator === filterR.comparisonOperator));
        if (!found) {
          this._error.error = true;
          this._error.message += "Required filter " + JSON.stringify(filterR) + " is missing.\n";
        }
      }
    }
  }

  _createWhereString() {
    let string = "";
    const esc = this.escape;
    // if there is any filter in filters add "WHERE"
    if (this._filters.length > 0) {
      string += " WHERE ";
    }
    // for each filter in filters.
    for (let i = 0; i < this._filters.length; i++) {
      // each filter should be inside paranthesis and have "OR" after it.
      const filter = this._filters[i];
      // If the number of filterParts is more than one add a paranthesis around it.
      if (filter.length > 1) string += "(";
      for (let i2 = 0; i2 < filter.length; i2++) {
        const filterPart = filter[i2];
        // if any wildcard we need to split it with " OR " between as sql in don't handle wildcards.
        if (filterPart.compare.find((e) => e.includes("%"))) {
          // if more than one compare add "("
          if (filterPart.compare.length > 1) string += "(";
          for (let i3 = 0; i3 < filterPart.compare.length; i3++) {
            string += esc(filterPart.col) + " ";
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
            string += esc(filterPart.col) + " ";
            // create the not in / in string
            if (filterPart.operator === "[neq]") string += "NOT ";
            // the map will escape each string in array, they we join it by ","
            if (filterPart.operator === "[eq]") string += "in " + "(" + filterPart.compare.map((col) => esc(col)).join(",") + ") ";
          }
          // if more than one compare add ")"
          if (filterPart.compare.length > 1) string += ")";
        } else {
          // if more than one compare add "("
          if (filterPart.compare.length > 1) string += "(";
          for (let i3 = 0; i3 < filterPart.compare.length; i3++) {
            string += esc(filterPart.col) + " ";
            string += this._comparisonOperator2SQL(filterPart.comparisonOperator);
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
          if (filter.length > 1) string += ")";
        }
      }
      if (this._filters.length > i + 1) {
        string += " OR ";
      }
    }
    return string;
  }

  _createOrderString() {
    let string = "";
    const esc = this.escape;
    if (this._sortBy.length > 0) string += " ORDER BY ";
    for (let i = 0; i < this._sortBy.length; i++) {
      string += esc(this._sortBy[i].col) + " " + this._sortBy[i].sortorder;
      if (i + 1 !== this._sortBy.length) string += ", ";
    }
    return string;
  }

  sql = this.sqlGet; //backwards compatibility

  sqlGet(dbTable) {
    this.queryUpdate();
    if (!dbTable) return new Error("sqlGet missing argument");
    if (this._error.error) return new Error(this._error.message);
    const esc = this.escape;
    let query = "SELECT ";
    query += this._cols
      .filter((c) => !this.allowedCols.length || this.allowedCols.includes(c)) // remove any column that don't exist in allowedCols. If AllowedCols is empty allow all.
      .map((col) => esc(col)) // create new array with escaped columns
      .join(", "); // create a comma separated list of
    query += " FROM " + dbTable;
    query += this._createWhereString();
    query += this._createOrderString();

    return query;
  }

  sqlPost(dbTable) {
    this.queryUpdate();
    if (!dbTable) return new Error("sqlPost missing argument");
    if (!this._setValues.length) return new Error("sqlPost run but no setValues are defined.");
    if (this._error.error) return new Error(this._error.message);

    const esc = this.escape;
    let colsString = "";
    let valuesString = "";

    // if(this._setValues.length !== this._cols.length) return new Error("sqlPost and there seem to be 'columns' not setting values.")

    this._setValues.forEach((setValue) => {
      // We can only set one value at a time, and the setter must be = not for instance >
      if (setValue.compare.length === 1 && setValue.comparisonOperator === "[eq]") {
        colsString += esc(setValue.col) + ",";
        valuesString += esc(setValue.compare) + ",";
      } else {
        return new Error("sqlPost and more than one compare or operator not [eq]. comparisonOperator: " + JSON.stringify(setValue.compare) + " compare: " + JSON.stringify(setValue.compare));
      }
    });

    // Remove trailing coma
    if (colsString.length > 0) colsString = colsString.slice(0, -1);
    if (valuesString.length > 0) valuesString = valuesString.slice(0, -1);

    // break if there is no data to be inserted
    if (!colsString || !valuesString) return new Error("sqlPost colstring: " + colstring + " or valuesString: " + valuesString + " was empty.");

    let query = "INSERT INTO " + dbTable + " (";
    query += colsString;
    query += ") VALUES (";
    query += valuesString;
    query += ")";
    return query;
  }

  sqlDelete(dbTable) {
    this.queryUpdate();
    if (!dbTable) return new Error("sqlDelete missing argument");
    if (this._filters.length === 0) return new Error("sqlDelete run but no filters defined.");
    if (this._error.error) return new Error(this._error.message);

    const esc = this.escape;
    let query = "DELETE";
    query += " FROM " + dbTable;
    query += this._createWhereString();
    return query;
  }

  sqlPatch(dbTable) {
    this.queryUpdate();
    const esc = this.escape;
    if (!dbTable) return new Error("sqlPatch missing argument");
    if (!this.setValues.length) return new Error("sqlPatch run but no setValues are defined.");
    if (this._filters.length === 0) return new Error("sqlPatch run but no filters defined.");
    if (this._error.error) return new Error(this._error.message);

    let query = "UPDATE " + table + " SET ";
    // Add the set values
    this.setValues.forEach((setValue) => {
      // We can only set one value at a time, and the setter must be = not for instance >
      if (setValue.compare.length === 1 && setValue.comparisonOperator === "[eq]") {
        query += esc(setValue.col) + " = " + esc(setValue.compare) + ", ";
      }
    });
    // Remove trailing coma
    if (query.length > 0) query = query.slice(0, -1);

    query += this._createWhereString();

    return query;
  }
};
