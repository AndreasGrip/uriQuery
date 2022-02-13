/*
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

[as] assign value to column, used for post/patch
*/

const sqlString = require("sqlstring");

module.exports = class uriQuery {
  constructor(uriQuery = "", RESTtype = "GET") {
    // if RESTtype === "GET" those array can contain information
    this.get = {
      gets: [],
      filters: [],
      sortBy: [],
      allowedGet: [],
      enforcedGet: [],
      allowedFilters: [],
      enforcedFilters: [],
      requiredFilters: [],
      enforcedSortBy: [],
      clear: this._getClear,
      validate: () => {
        this._getValidate();
      },
      validateFilterPart: this.validateFilterPart,
    };
    // if RESTtype === "PATCH" those array can contain information
    this.patch = {
      sets: [],
      filters: [],
      allowedSets: [],
      enforcedSets: [],
      requiredSets: [],
      allowedFilters: [],
      enforcedFilters: [],
      requiredFilters: [],
      clear: this._patchClear,
      validate: () => {
        this._patchValidate();
      },
      validateFilterPart: this.validateFilterPart,
    };
    // if RESTtype === "POST" those array can contain information
    this.post = {
      sets: [],
      allowedSets: [],
      enforcedSets: [],
      requiredSets: [],
      clear: this._postClear,
      validate: () => {
        this._postValidate();
      },
      validateFilterPart: this.validateFilterPart,
    };
    // if RESTtype === "DELETE" those array can contain information
    this.delete = {
      filters: [],
      allowedFilters: [],
      enforcedFilters: [],
      requiredFilters: [],
      clear: this._deleteClear,
      validate: () => {
        this._deleteValidate();
      },
      validateFilterPart: this.validateFilterPart,
    };
    this._dbSchema = ""; // This will be added before table name if set, not really recommended

    this._query = uriQuery;
    this.escape = sqlString.escape; // Used to escape values, not columns etc.
    this.escapeId = sqlString.escape; // If you can't trust an SQL identifier (database / table / column name) because it is provided by a user, you should escape it with SqlString.escapeId(identifier)
    this.RESTtype = RESTtype ? RESTtype.toUpperCase() : "GET"; //
  }

  get dbSchema() {
    return this._dbSchema;
  }

  set dbSchema(dbSchema) {
    if (this._dbSchema !== dbSchema) {
      // No reason to set the value to the same value.
      this._dbSchema = dbSchema;
    }
  }

  set query(q) {
    if (this._query !== q) {
      this._query = q;
      this.queryUpdate();
    }
  }

  get RESTtype() {
    return this._RESTtype;
  }

  set RESTtype(r) {
    const uppercase = r.toUpperCase();
    if (this._RESTtype !== uppercase) {
      // No reason to set the value to the same value.
      this._RESTtype = uppercase;
      this.queryUpdate();
    }
  }

  // Create a filterPart that is used by this class.
  createFilterPart(column, comparisonOperator, compare) {
    // test if what we got already seem to be a filterPart, in that case return it
    if (typeof column?.column === "string" || column?.comparisonOperator || typeof column.comparisonOperator === "string" || Array.isArray(column?.compare)) return column;

    if (column === undefined) throw new Error("No column defined to createFilterPart");
    // If comparisonOperator is set but compare is not, return error
    if (comparisonOperator !== undefined && compare === undefined) throw new Error("comparisonOperator is set but compare is not");
    // if (column === undefined && comparisonOperator === undefined && compare === undefined) return undefined;

    const filterPart = {};
    if (column !== undefined) filterPart.column = column;
    if (comparisonOperator !== undefined) filterPart.comparisonOperator = this.SQL2comparisonOperator(comparisonOperator);
    if (compare !== undefined) {
      switch (typeof compare) {
        case "number":
        case "string":
          filterPart.compare = [compare];
          break;
        default:
          filterPart.compare = compare;
      }
    }
    // default to eq is comparer is set but comparisonOperator is not.
    if (comparisonOperator === undefined && compare !== undefined) filterPart.comparisonOperator = this.SQL2comparisonOperator("[eq]");

    // if compare is array or undefined do nothing
    if (Array.isArray(filterPart.compare) || typeof filterPart.compare === "undefined") {
    } else if (typeof filterPart.compare === "string") {
      // if string split it
      filterPart.compare = filterPart.compare.split("[or]");
    } else {
      // if anything else than string or array, make undefined.
      throw new Error("Array or string was expected as compare, got " + JSON.stringify(filterPart.compare));
    }
    return filterPart;
  }

  // Should this be divided into filters,set/get?
  // Part meaning that compare/comparisonOperator can be missing
  validateFilterPart(filterPart, RESTtype, part = false) {
    const fp = this.createFilterPart(filterPart);
    filterPart = {};
    filterPart.column = fp.column;
    filterPart.compare = fp.compare;
    filterPart.comparisonOperator = fp.comparisonOperator;

    switch (RESTtype.toLowerCase()) {
      case "get":
        if (
          filterPart.comparisonOperator !== "[eq]" &&
          filterPart.comparisonOperator !== "[neq]" &&
          filterPart.compare?.length > 0 &&
          filterPart.compare.some((comparePart) => comparePart.includes("%"))
        )
          throw new Error("Got % wildcard on other operator than [eq]/[neq], not allowed.");
        break;

      case "post":
      case "patch":
      case "delete":
        if (!part && typeof filterPart.comparisonOperator === "undefined" && filterPart.comparisonOperator !== "[eq]" && filterPart.comparisonOperator !== "[as]")
          throw new Error("Got comparisonOperator " + filterPart.compare + " on something else than GET, not allowed.");
        if (!part && filterPart.compare === undefined) throw new Error("Got compare undefined on something else than GET, not allowed.");
        if (filterPart.compare?.length > 0 && filterPart.compare.some((comparePart) => comparePart.includes("%"))) throw new Error("Got wildcard % on something else than GET, not allowed.");

        break;
    }
    return;
  }

  comparisonOperator2SQL(comparisonOperator) {
    if (comparisonOperator === "=") return comparisonOperator;
    if (comparisonOperator === ">=") return comparisonOperator;
    if (comparisonOperator === "<=") return comparisonOperator;
    if (comparisonOperator === "!=") return comparisonOperator;
    if (comparisonOperator === ">") return comparisonOperator;
    if (comparisonOperator === "<") return comparisonOperator;
    if (comparisonOperator.toLowerCase() === "[neq]") return "!=";
    if (comparisonOperator.toLowerCase() === "[eq]") return "=";
    if (comparisonOperator.toLowerCase() === "[le]") return "<=";
    if (comparisonOperator.toLowerCase() === "[lt]") return "<";
    if (comparisonOperator.toLowerCase() === "[ge]") return ">=";
    if (comparisonOperator.toLowerCase() === "[gt]") return ">";
    throw new Error("comparisonOperator2SQL got invalid comparisonOperator " + comparisonOperator);
  }

  SQL2comparisonOperator(comparisonOperator) {
    if (comparisonOperator === "=") return "[eq]";
    if (comparisonOperator === ">=") return "[ge]";
    if (comparisonOperator === "<=") return "[le]";
    if (comparisonOperator === "!=") return "[neq]";
    if (comparisonOperator === ">") return "[gt]";
    if (comparisonOperator === "<") return "[lt]";
    if (comparisonOperator.toLowerCase() === "[neq]") return comparisonOperator.toLowerCase();
    if (comparisonOperator.toLowerCase() === "[eq]") return comparisonOperator.toLowerCase();
    if (comparisonOperator.toLowerCase() === "[le]") return comparisonOperator.toLowerCase();
    if (comparisonOperator.toLowerCase() === "[lt]") return comparisonOperator.toLowerCase();
    if (comparisonOperator.toLowerCase() === "[ge]") return comparisonOperator.toLowerCase();
    if (comparisonOperator.toLowerCase() === "[gt]") return comparisonOperator.toLowerCase();
    if (comparisonOperator.toLowerCase() === "[as]") return comparisonOperator.toLowerCase();
    throw new Error("SQL2comparisonOperator got invalid comparisonOperator " + comparisonOperator);
  }

  extractSortOrder(queryString) {
    const maxSortArg = 30;
    if ((queryString.match(/\[(asc|desc)\]/gi) || []).length > 30) throw new Error("More than max (" + maxSortArg + ") sorting arguments.");
    // extract asc / desc columns
    const regexSortOrder = /(\w+)\[(asc|desc)\]/gi;
    // For each asc/desc found....
    let sortOrder;
    const sortOrders = [];
    while ((sortOrder = regexSortOrder.exec(queryString))) {
      let sortobj = {};
      sortobj.column = sortOrder[1];
      sortobj.sortorder = sortOrder[2];
      sortOrders.push(sortobj);
    }
    return sortOrders;
  }

  removeSortOrder(queryString) {
    // extract asc / desc columns
    const regexSortOrder = /\[(asc|desc)\]/gi;
    queryString = queryString.replace(regexSortOrder, "");
    return queryString;
  }

  reset() {
    this.get.clear();
    this.get.allowedGet.length = 0;
    this.get.enforcedGet.length = 0;
    this.get.allowedFilters.length = 0;
    this.get.enforcedFilters.length = 0;
    this.get.requiredFilters.length = 0;
    this.get.enforcedSortBy.length = 0;

    this.patch.clear();
    this.patch.allowedSet.length = 0;
    this.patch.enforcedSet.length = 0;
    this.patch.requiredSet.length = 0;
    this.patch.allowedFilters.length = 0;
    this.patch.enforcedFilters.length = 0;
    this.patch.requiredFilters.length = 0;

    this.post.clear();
    this.post.allowedSet.length = 0;
    this.post.enforcedSet.length = 0;
    this.post.requiredSet.length = 0;

    this.delete.clear();
    this.delete.filters.length = 0;
    this.delete.allowedFilters.length = 0;
    this.delete.enforcedFilters.length = 0;
    this.delete.requiredFilters.length = 0;
  }

  queryClear() {
    this.get.clear();
    this.patch.clear();
    this.post.clear();
    this.delete.clear();
  }

  // Clear all values used to create SQL
  _getClear() {
    this.gets.length = 0;
    this.filters.length = 0;
    this.sortBy.length = 0;
  }
  _patchClear() {
    this.sets.length = 0;
    this.filters.length = 0;
  }
  _postClear() {
    this.sets.length = 0;
  }
  _deleteClear() {
    this.filters.length = 0;
  }

  _getValidate() {
    //if not all gets are proper filterParts, fix that.
    for (let i = 0; i < this.get.gets.length; i++) {
      this.get.gets[i] = this.createFilterPart(this.get.gets[i]);
    }
    this.get.gets.forEach((d) => this.validateFilterPart(d, "GET"));

    // This is just code to remove any duplicates, not pretty but works.
    for (let i = 0; i < this.get.gets.length; i++) {
      for (let i2 = i + 1; i2 < this.get.gets.length; ++i2) {
        // Find any duplicates located on higher index (lower is already checked.)
        while (this.get.gets[i]?.column === this.get.gets[i2]?.column) {
          // Remove one
          this.get.gets.splice(i2, 1);
        }
      }
    }
    this.get.filters.forEach((d) => this.validateFilterPart(d, "GET"));
    this.get.sortBy.forEach((d) => this.validateFilterPart(d, "GET"));
    this.get.allowedGet.forEach((d) => this.validateFilterPart(d, "GET", true));
    this.get.enforcedGet.forEach((d) => this.validateFilterPart(d, "GET"));
    this.get.allowedFilters.forEach((d) => this.validateFilterPart(d, "GET", true));
    this.get.enforcedFilters.forEach((d) => this.validateFilterPart(d, "GET"));
    this.get.requiredFilters.forEach((d) => this.validateFilterPart(d, "GET", true));
  }

  _patchValidate() {
    this.patch.sets.forEach((d) => this.validateFilterPart(d, "PATCH"));
    this.patch.filters.forEach((d) => this.validateFilterPart(d, "PATCH"));
    this.patch.allowedSets.forEach((d) => this.validateFilterPart(d, "PATCH", true));
    this.patch.enforcedSets.forEach((d) => this.validateFilterPart(d, "PATCH"));
    this.patch.requiredSets.forEach((d) => this.validateFilterPart(d, "PATCH", true));
    this.patch.allowedFilters.forEach((d) => this.validateFilterPart(d, "PATCH", true));
    this.patch.enforcedFilters.forEach((d) => this.validateFilterPart(d, "PATCH"));
    this.patch.requiredFilters.forEach((d) => this.validateFilterPart(d, "PATCH", true));
  }

  _postValidate() {
    this.post.sets.forEach((d) => this.validateFilterPart(d, "POST"));
    this.post.allowedSets.forEach((d) => this.validateFilterPart(d, "POST", true));
    this.post.enforcedSets.forEach((d) => this.validateFilterPart(d, "POST"));
    this.post.requiredSets.forEach((d) => this.validateFilterPart(d, "POST", true));
  }

  _deleteValidate() {
    this.delete.filters.forEach((d) => this.validateFilterPart(d, "DELETE"));
    this.delete.allowedFilters.forEach((d) => this.validateFilterPart(d, "DELETE", true));
    this.delete.enforcedFilters.forEach((d) => this.validateFilterPart(d, "DELETE"));
    this.delete.requiredFilters.forEach((d) => this.validateFilterPart(d, "DELETE", true));
  }

  queryString2FilterParts(string) {}

  queryUpdate() {
    this.queryClear();
    let queryString = this._query;

    // Validate all lists of gets/sets/filters, at this point it will just rules, like enforced and required populated
    switch (this._RESTtype) {
      case "GET":
        this.get.validate();
        break;
      case "PATCH":
        this.patch.validate();
        break;
      case "POST":
        this.post.validate();
        break;
      case "DELETE":
        this.delete.validate();
        break;
      default:
        throw new Error("RESTtype " + this._RESTtype + " is unknown or not supported");
    }

    // Add enforced gets/sets/filters
    switch (this._RESTtype) {
      case "GET":
        this.get.gets.push(...this.get.enforcedGet);
        this.get.filters.push(...this.get.enforcedFilters);
        break;
      case "PATCH":
        this.patch.sets.push(...this.patch.enforcedSets);
        this.patch.filters.push(...this.patch.enforcedFilters);
        break;
      case "POST":
        this.post.sets.push(...this.post.enforcedSets);
        break;
      case "DELETE":
        this.delete.filters.push(...this.delete.enforcedFilters);
        break;
      default:
    }

    // extract and remove the sortorder from the queryString
    let sortBy = this.extractSortOrder(queryString);
    queryString = this.removeSortOrder(queryString);

    const regex = /(\w+)(\!=|<>|\[neq\]|<=|\[le\]|\>=|\[ge\]|<|\[lt\]|>|\[gt\]|=|\[eq\]|\[as\])?((\w|-|\.|\%|\[or\])+)?/gi;
    let filterparts;

    const parts = [];
    while ((filterparts = regex.exec(queryString))) {
      // const filterpartFull = filterparts[0];
      const col = filterparts[1];
      const comparisonOperator = filterparts[2] && this.SQL2comparisonOperator(filterparts[2]);
      const compare = filterparts[3] && filterparts[3].split("[or]");
      parts.push(this.createFilterPart(col, comparisonOperator, compare));
    }

    // add all filters
    switch (this._RESTtype) {
      case "GET":
        parts.forEach((p) => {
          if (p.comparisonOperator && p.comparisonOperator !== "[as]") this.get.filters.push(p);
          this.get.gets.push(p);
        });
        break;
      case "PATCH":
        parts.forEach((p) => {
          if (!Array.isArray(p.compare) || typeof p.comparisonOperator === "undefined") throw new Error("Undefined comparisonoperator or compare not array on PATCH");
          if (p.comparisonOperator && p.comparisonOperator === "[as]") this.patch.sets.push(p);
          if (p.comparisonOperator && p.comparisonOperator !== "[as]") this.patch.filters.push(p);
        });
        break;
      case "POST":
        parts.forEach((p) => {
          if (!Array.isArray(p.compare) || typeof p.comparisonOperator === "undefined") throw new Error("Undefined comparisonoperator or compare not array on POST");
          if (p.comparisonOperator && p.comparisonOperator !== "[as]") throw new Error("Invalid comparisonoperator " + p.comparisonOperator + " on POST");
          if (p.comparisonOperator && p.comparisonOperator === "[as]") this.post.sets.push(p);
        });
        break;
      case "DELETE":
        parts.forEach((p) => {
          if (!Array.isArray(p.compare) || typeof p.comparisonOperator === "undefined") throw new Error("Undefined comparisonoperator or compare not array on DELETE");
          if (p.comparisonOperator && p.comparisonOperator !== "[as]") this.delete.filters.push(p);
        });
        break;
      default:
    }

    // check that only allowed exists
    switch (this._RESTtype) {
      case "GET":
        if (this.get.allowedGet.length > 0) {
          this.get.gets.forEach((p) => {
            if (!this.get.allowedGet.some((g) => g.column === p.column)) throw new Error("Get " + p.column + " is not allowed");
          });
        }
        if (this.get.allowedFilters.length > 0) {
          this.get.sets.forEach((p) => {
            if (
              !this.get.allowedFilters.some(
                (g) =>
                  g.column === p.column &&
                  (g.comparisonOperator === p.comparisonOperator || g.comparisonOperator === undefined) &&
                  (g.compare === undefined || g.compare.length === 0 || (p.compare.length === 1 && g.compare.includes(p.compare[0])))
              )
            ) {
              throw new Error("get filter " + JSON.stringify(p) + " is not allowed");
            }
          });
        }
        break;
      case "PATCH":
        if (this.patch.allowedSets.length > 0) {
          this.patch.sets.forEach((p) => {
            if (
              !this.patch.allowedSets.some(
                (g) =>
                  g.column === p.column &&
                  (g.comparisonOperator === p.comparisonOperator || g.comparisonOperator === undefined) &&
                  (g.compare === undefined || g.compare.length === 0 || (p.compare.length === 1 && g.compare.includes(p.compare[0])))
              )
            ) {
              throw new Error("patch " + p.column + " is not allowed");
            }
          });
        }

        if (this.patch.allowedFilters.length > 0) {
          this.patch.sets.forEach((p) => {
            if (
              !this.patch.allowedFilters.some(
                (g) =>
                  g.column === p.column &&
                  (g.comparisonOperator === p.comparisonOperator || g.comparisonOperator === undefined) &&
                  (g.compare === undefined || g.compare.length === 0 || (p.compare.length === 1 && g.compare.includes(p.compare[0])))
              )
            ) {
              throw new Error("patch filter " + JSON.stringify(p) + " is not allowed");
            }
          });
        }

        break;
      case "POST":
        if (this.post.allowedSets.length > 0) {
          this.post.sets.forEach((p) => {
            if (
              !this.post.allowedSets.some(
                (g) =>
                  g.column === p.column &&
                  (g.comparisonOperator === p.comparisonOperator || g.comparisonOperator === undefined) &&
                  (g.compare === undefined || g.compare.length === 0 || (p.compare.length === 1 && g.compare.includes(p.compare[0])))
              )
            ) {
              throw new Error("post " + p.column + " is not allowed");
            }
          });
        }

        break;
      case "DELETE":
        if (this.delete.allowedFilters.length > 0) {
          this.delete.sets.forEach((p) => {
            if (
              !this.delete.allowedFilters.some(
                (g) =>
                  g.column === p.column &&
                  (g.comparisonOperator === p.comparisonOperator || g.comparisonOperator === undefined) &&
                  (g.compare === undefined || g.compare.length === 0 || (p.compare.length === 1 && g.compare.includes(p.compare[0])))
              )
            ) {
              throw new Error("delete filter " + JSON.stringify(p) + " is not allowed");
            }
          });
        }

        break;
      default:
    }

    // check that all required exists.
    switch (this._RESTtype) {
      case "GET":
        if (this.get.requiredFilters.length > 0) {
          this.get.requiredFilters.forEach((f) => {
            // If the the column and the comaprison operator is the same or not defined as required
            if (
              !this.get.filters.some((p) => {
                (f.column === p.column || f.column === undefined) &&
                  (f.comparisonOperator === p.comparisonOperator || f.comparisonOperator === undefined) &&
                  // last part picked from https://www.geeksforgeeks.org/how-to-find-if-two-arrays-contain-any-common-item-in-javascript/
                  (f.compare === undefined || f.compare.length === 0 || f.some((required) => p.includes(required)));
              })
            ) {
              throw new Error("required filter " + JSON.stringify(f) + " is not found");
            }
          });
        }

        break;
      case "PATCH":
        if (this.patch.requiredFilters.length > 0) {
          this.patch.requiredFilters.forEach((f) => {
            // If the the column and the comaprison operator is the same or not defined as required
            if (
              !this.patch.filters.some((p) => {
                (f.column === p.column || f.column === undefined) &&
                  (f.comparisonOperator === p.comparisonOperator || f.comparisonOperator === undefined) &&
                  // last part picked from https://www.geeksforgeeks.org/how-to-find-if-two-arrays-contain-any-common-item-in-javascript/
                  (f.compare === undefined || f.compare.length === 0 || f.some((required) => p.includes(required)));
              })
            ) {
              throw new Error("required filter " + JSON.stringify(f) + " is not found");
            }
          });
        }

        if (this.patch.requiredSets.length > 0) {
          this.patch.requiredSets.forEach((f) => {
            // If the the column and the comaprison operator is the same or not defined as required
            if (
              !this.patch.sets.some((p) => {
                (f.column === p.column || f.column === undefined) &&
                  (f.comparisonOperator === p.comparisonOperator || f.comparisonOperator === undefined) &&
                  // last part picked from https://www.geeksforgeeks.org/how-to-find-if-two-arrays-contain-any-common-item-in-javascript/
                  (f.compare === undefined || f.compare.length === 0 || f.some((required) => p.includes(required)));
              })
            ) {
              throw new Error("required filter " + JSON.stringify(f) + " is not found");
            }
          });
        }
        break;
      case "POST":
        if (this.post.requiredSets.length > 0) {
          this.post.requiredSets.forEach((f) => {
            // If the the column and the comaprison operator is the same or not defined as required
            if (
              !this.post.sets.some((p) => {
                (f.column === p.column || f.column === undefined) &&
                  (f.comparisonOperator === p.comparisonOperator || f.comparisonOperator === undefined) &&
                  // last part picked from https://www.geeksforgeeks.org/how-to-find-if-two-arrays-contain-any-common-item-in-javascript/
                  (f.compare === undefined || f.compare.length === 0 || f.some((required) => p.includes(required)));
              })
            ) {
              throw new Error("required filter " + JSON.stringify(f) + " is not found");
            }
          });
        }

        break;
      case "DELETE":
        if (this.delete.requiredFilters.length > 0) {
          this.delete.requiredFilters.forEach((f) => {
            // If the the column and the comaprison operator is the same or not defined as required
            if (
              !this.delete.filters.some((p) => {
                (f.column === p.column || f.column === undefined) &&
                  (f.comparisonOperator === p.comparisonOperator || f.comparisonOperator === undefined) &&
                  // last part picked from https://www.geeksforgeeks.org/how-to-find-if-two-arrays-contain-any-common-item-in-javascript/
                  (f.compare === undefined || f.compare.length === 0 || f.some((required) => p.includes(required)));
              })
            ) {
              throw new Error("required filter " + JSON.stringify(f) + " is not found");
            }
          });
        }
        break;
      default:
    }

    // add the sortby
    switch (this._RESTtype) {
      case "GET":
        this.get.sortBy.push(...sortBy);
        break;
      case "PATCH":
      case "POST":
      case "DELETE":
        break;
    }
  }

  createSQL(table) {
    if (!table) throw new Error("sqlGet missing argument");
    switch (this._RESTtype) {
      case "GET":
        if (!this.get.gets.length) {
          if (this.get.allowedGet.length) {
            this.get.gets.push(...this.get.allowedGet);
          } else {
            throw new Error("REST GET but no defined columns to get.");
          }
        }
        break;
      case "POST":
        if (!this.post.sets.length) throw new Error("REST POST but no defined columns to set.");
        break;
      case "PATCH":
        if (!this.patch.sets.length) throw new Error("REST PATCH but no defined columns to set.");
        if (!this.patch.filters.length) throw new Error("REST PATCH but no defined filters.");
        break;
      case "DELETE":
        if (!this.delete.filters.length) throw new Error("REST DELETE but no defined filters.");
        break;
    }
    this.get.validate();
    this.post.validate();
    this.patch.validate();
    this.delete.validate();

    let sql = "";
    const esc = this.escape;
    const escId = this.escapeId;
    switch (this._RESTtype) {
      case "GET":
        sql += "SELECT ";
        sql += this.get.gets
          .map((filter) =>
            escId(filter.column) // extract the column name
              .replace(/\'/g, "`")
          ) // Escape ' char
          .join(", "); // create a comma separated list of
        sql += " FROM ";
        sql += this._dbSchema ? escId(this._dbSchema) + "." : "";
        sql += escId(table);
        if (this.get.filters.length > 0) {
          sql += " WHERE ";
          const filter = this.get.filters;
          filter.forEach((f, fidx, farr) => {
            // if more than one compare add "("
            if (f.compare.length > 1) sql += "(";
            // if any wildcard is present we need to split it with " OR " between as sql in don't handle wildcards.
            if (f.compare.find((e) => e.includes("%"))) {
              f.compare.forEach((compare, idx, arr) => {
                sql += escId(f.column) + " ";
                if (f.comparisonOperator === "[neq]") sql += "NOT ";

                sql += "LIKE ";
                sql += esc(compare);
                // If we are not one the last entity add " OR "
                if (idx !== arr.length - 1) sql += " OR ";
              });
            } else if (/\[n?eq\]/.test(f.comparisonOperator)) {
              // test if comparison operator is [eq] or [neq]
              sql += escId(f.column) + " ";
              if (f.comparisonOperator === "[neq]") sql += "NOT ";

              sql += "IN ";
              sql += "(" + f.compare.map((c) => esc(c)).join(",") + ")";
            } else {
              f.compare.forEach((compare, idx, arr) => {
                sql += escId(f.column) + " ";

                sql += this.comparisonOperator2SQL(f.comparisonOperator) + " ";
                sql += esc(compare);

                if (idx !== arr.length - 1) sql += " OR ";
              });
            }
            // if more than one compare add ")"
            if (f.compare.length > 1) sql += ")";
            if (fidx !== farr.length - 1) sql += " AND ";
          });
        }
        if (this.get.sortBy.length > 0) sql += " ORDER BY ";
        this.get.sortBy.forEach((so, soidx, soarr) => {
          sql += escId(so.column) + " " + so.sortorder;
          if (soidx !== soarr.length - 1) sql += ", ";
        });
        break;
      case "POST":
        sql += "INSERT INTO ";
        sql += this.dbSchema ? escId(this.dbSchema) + "." : "";
        sql += escId(table);
        sql += " (";
        sql += this.post.sets
          .map((filter) =>
            escId(filter.column) // extract the column name
              .replace(/\'/g, "`")
          ) // Escape ' char
          .join(", "); // create a comma separated list of
        sql += ") VALUES (";
        sql += this.post.sets
          .map((filter) => esc(filter.compare)) // create new array with escaped columns
          .join(", "); // create a comma separated list of
        sql += ")";
        break;
      case "PATCH":
        sql = "UPDATE ";
        sql += this._dbSchema ? escId(this._dbSchema) + "." : "";
        sql += escId(table);
        sql += " SET ";
        sql += this.patch.sets
          .map((filter) => escId(filter.column) + " = " + esc(filter.compare[0])) // create new array with escaped columns
          .join(", "); // create a comma separated list of
        if (this.patch.filters.length > 0) {
          sql += " WHERE ";
          const filter = this.patch.filters;
          filter.forEach((f, fidx, farr) => {
            // if more than one compare add "("
            if (f.compare.length > 1) string += "(";
            // if any wildcard is present we need to split it with " OR " between as sql in don't handle wildcards.
            if (f.compare.find((e) => e.includes("%"))) {
              f.compare.forEach((compare, idx, arr) => {
                sql += escId(f.column) + " ";
                if (f.comparisonOperator === "[neq]") sql += "NOT ";

                sql += "LIKE ";
                sql += esc(compare);
                // If we are not one the last entity add " OR "
                if (idx !== arr.length - 1) sql += " OR ";
              });
            } else if (/\[n?eq\]/.test(f.comparisonOperator)) {
              // test if comparison operator is [eq] or [neq]
              sql += escId(f.column) + " ";
              if (f.comparisonOperator === "[neq]") sql += "NOT ";

              sql += "IN ";
              sql += "(" + f.compare.map((c) => esc(c)).join(",") + ")";
            } else {
              f.compare.forEach((compare, idx, arr) => {
                sql += escId(f.column) + " ";

                sql += this.comparisonOperator2SQL(f.comparisonOperator) + " ";
                sql += esc(compare);

                if (idx !== arr.length - 1) sql += " OR ";
              });
            }
            // if more than one compare add ")"
            if (f.compare.length > 1) string += ")";
            if (fidx !== farr.length - 1) sql += " AND ";
          });
        }

        break;
      case "DELETE":
        sql = "DELETE FROM ";
        sql += this._dbSchema ? escId(this._dbSchema) + "." : "";
        sql += escId(table);
        if (this.delete.filters.length > 0) {
          sql += " WHERE ";
          const filter = this.delete.filters;
          filter.forEach((f, fidx, farr) => {
            // if more than one compare add "("
            if (f.compare.length > 1) string += "(";
            // if any wildcard is present we need to split it with " OR " between as sql in don't handle wildcards.
            if (f.compare.find((e) => e.includes("%"))) {
              f.compare.forEach((compare, idx, arr) => {
                sql += escId(f.column) + " ";
                if (f.comparisonOperator === "[neq]") sql += "NOT ";

                sql += "LIKE ";
                sql += esc(compare);
                // If we are not one the last entity add " OR "
                if (idx !== arr.length - 1) sql += " OR ";
              });
            } else if (/\[n?eq\]/.test(f.comparisonOperator)) {
              // test if comparison operator is [eq] or [neq]
              sql += escId(f.column) + " ";
              if (f.comparisonOperator === "[neq]") sql += "NOT ";

              sql += "IN ";
              sql += "(" + f.compare.map((c) => esc(c)).join(",") + ")";
            } else {
              f.compare.forEach((compare, idx, arr) => {
                sql += escId(f.column) + " ";

                sql += this.comparisonOperator2SQL(f.comparisonOperator) + " ";
                sql += esc(compare);

                if (idx !== arr.length - 1) sql += " OR ";
              });
            }
            // if more than one compare add ")"
            if (f.compare.length > 1) string += ")";
            if (fidx !== farr.length - 1) sql += " AND ";
          });
        }
        break;
    }
    return sql;
  }
};
