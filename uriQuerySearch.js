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
  constructor(query = "") {
    this._query = query; // Will contain the original query string
    this.colsQuerys = []; // Will contain the part of the query string that handels cols
    this.filterQuerys = []; // Will contain the parts of the query string that handles filters

    this.cols = []; // Will contain a array of the column names
    this.filters = []; // Will contain a array of filter objects filters[filterObject][subfilter]. "AND" will be set between subfilters, "OR" between filterObject
    this._allfiltersQuerys = []; // Will contains subfilters to be added to each filterobject.
    this._allowedCols = []; // Can contain column query is allowed to access.
    this.sortBy = []; // Can contain array of objects defining sort order. Order will be the same as in this array

    this.escape = sqlString.escape; // What function to use to escape sql variables

    if (query) this.queryUpdate(); // If query is not empty update the rest of the variables
  }

  get query() {
    return this._query;
  }

  set query(q) {
    this._query = q;
    this.queryUpdate();
  }

  get allfilters() {
    return this._allfiltersQuerys;
  }

  set allfilters(filter) {
    this._allfiltersQuerys = filter;
    this.queryUpdate();
  }

  get allowedCols() {
    return this._allowedCols;
  }
  set allowedCols(q) {
    this._allowedCols = q;
    this.queryUpdate();
  }

  queryUpdate() {
    this.colsQuerys = [];
    this.filterQuerys = [];
    const sortBy = (this.sortBy = []);
    const cols = (this.cols = []);
    const filters = (this.filters = []);
    const filterAll = this._filterAll;
    const allowedCols = this.allowedCols;
    // remove any leading '?'
    let query = this._query.charAt(0) === "?" ? this._query.slice(1) : this._query;
    let queryArray = query.split("&");
    queryArray.forEach((queryPart) => {
      if (queryPart.slice(0, 5).toLowerCase() === "cols=") {
        this.colsQuerys.push(queryPart.slice(5));
      } else if (queryPart.slice(0, 7).toLowerCase() === "filter=") {
        this.filterQuerys.push(queryPart.slice(7));
      }
    });

    function queryHandler(query, type) {
      // extract asc / desc columns
      let regex = /(\w+)\[(asc|desc)\]/gi;
      let result;
      while ((result = regex.exec(query))) {
        let sortobj = {};
        sortobj.col = result[1];
        sortobj.sortorder = result[2];
        sortBy.push(sortobj);
      }
      // remove the [asc]/[desc] using the same regex ensuring only extracted ones are removed.
      query = query.replace(regex, "$1");
      // Find all the "query" arguments
      regex = /(\w+)(\!=|<>|\[neq\]|<=|\[le\]|\>=|\[ge\]|<|\[lt\]|>|\[gt\]|=|\[eq\])?((\w|\%|\[or\])+)?/gi;
      const filter = [];
      while ((result = regex.exec(query))) {
        // If type is cols add it to cols if allowed.
        if (type === "cols" && (allowedCols.length === 0 || allowedCols.includes(result[1]))) cols.push(result[1]);
        if (!result[2] && !result[3]) {
          // this likly just a col line, do nothing
        } else if (!result[2] || !result[3]) {
          console.log(result[0] + " resulted in " + result[1] + " and " + result[2] + " cannot work with that so ignoring rule.");
        } else {
          // both result[2] and result[3] contain something, try to do things
          // If = replace with [eq] (= etc. is just syntetic sugar)
          if (result[2] === "=") result[2] = "[eq]";
          if (result[2] === ">=") result[2] = "[ge]";
          if (result[2] === "<=") result[2] = "[le]";
          if (result[2] === "!=") result[2] = "[neq]";
          if (result[2] === ">") result[2] = "[gt]";
          if (result[2] === "<") result[2] = "[lt]";

          result[2] = result[2].toLowerCase();
          const filterPart = {
            col: result[1],
            comparisonOperator: result[2],
            compare: result[3].split("[or]"),
          };
          // if (/!\[n?eq\]/i.test(filterPart.comparisonOperator) && filterPart.compare.find((e) => e.indexOf("%")) && filterPart.compare.find((e) => e.indexOf("[or]"))) {
          if (/!\[n?eq\]/i.test(filterPart.comparisonOperator) && filterPart.compare.find((e) => e.indexOf("%")) && filterPart.compare.length != 1) {
            console.log("invalid mix of compare: " + filterPart.compare + " and comparisonOperator: " + filterPart.comparisonOperator);
            console.log("Only =,[eq],[neq] is allowed to use with %, or multiple options");
            console.log("This filter will be ignored");
          } else {
            if (type === "allFilters") {
              if (filters.length === 0) {
                filters.push([filterPart]);
              } else {
                filters.forEach((filt) => {
                  // TODO better names FFS.
                  filt.push(filterPart);
                });
              }
            } else {
              filter.push(filterPart);
            }
          }
        }
      }
      // If no filter data don't ad a new filter
      if (filter.length > 0) {
        if (type !== "filterAll") {
          filters.push(filter);
        }
      }
    }

    this.colsQuerys.forEach((colsQuery) => {
      queryHandler(colsQuery, "cols");
    });
    this.filterQuerys.forEach((filterQuery) => {
      queryHandler(filterQuery, "filters");
    });
    // Add the allFilters to all the filters
    this.allfilters.forEach((filter) => {
      queryHandler(filter, "allFilters");
    });
    if (!colsQuery && allowedCols.length) {
      allowedCols = [...cols];
    }
  }

  sql(from) {
    if (!from) return;
    const esc = this.escape;

    let query = "SELECT ";
    query += this.cols
      .filter((c) => !this.allowedCols.length || this.allowedCols.includes(c)) // remove any column that don't exist in allowedCols. If AllowedCols is empty allow all.
      .map((col) => esc(col)) // create new array with escaped columns
      .join(", "); // create a comma separated list of
    query += " FROM " + esc(from) + " WHERE ";
    let string = "";

    for (let i = 0; i < this.filters.length; i++) {
      const filter = this.filters[i];
      if (filter.length > 1) string += "(";
      for (let i2 = 0; i2 < filter.length; i2++) {
        const subFilter = filter[i2];
        // if any wildcard
        if (subFilter.compare.find((e) => e.indexOf("%"))) {
          if (subFilter.compare.length > 1) string += "(";
          for (let i3 = 0; i3 < subFilter.compare.length; i3++) {
            string += esc(subFilter.col) + " ";
            switch (subFilter.comparisonOperator) {
              case "[neq]":
                string += "!= ";
                break;
              case "[eq]":
                string += "= ";
                break;
              case "[le]":
                string += "<= ";
                break;
              case "[lt]":
                string += "< ";
                break;
              case "[ge]":
                string += ">= ";
                break;
              case "[gt]":
                string += "> ";
                break;
            }
            string += esc(subFilter.compare[i3]);
            if (i3 + 1 !== subFilter.compare.length) string += " OR ";
          }
          if (subFilter.compare.length > 1) string += ")";
        } else {
          string += esc(subFilter.col) + " ";
          switch (subFilter.operator) {
            case "[neq]":
              string += "NOT ";
            case "[eq]":
              string += "IN ";
              string += "(" + subFilter.compare.map((col) => esc(col)).join(",") + ") ";
              break;
          }
        }
        if (filter.length !== i2 + 1) {
          string += " AND ";
        } else {
          if (filter.length > 1) string += ")";
        }

        query += string;
        string = "";
      }
      if (this.filters.length > i + 1) {
        string += " OR ";
      }
    }

    if (this.sortBy.length > 0) string += " ORDER BY ";
    for (let i = 0; i < this.sortBy.length; i++) {
      string += esc(this.sortBy[i].col) + " " + this.sortBy[i].sortorder;
      if (i + 1 !== this.sortBy.length) string += ", ";
    }
    query += string;

    return query;
  }
};
