# uriQuerySearch

Make SQL querys from url querys. Fairly easy and very useful when getting data from database using REST

It was created  to make creating api's reading/writing to databases into a breese to get data from sql tables/databases but can be used to get data from just about anything, and might in the future, but for now just SQL. Currently setup for mysql.

Filterparts:
The smallest part of uriQuerySearch is the filterpart. Filterpart is an object that looks like this {col: 'columnName',comparisonOperator: '[eq]',compare: ['value1', 'value2']}.

comparisonOperator can be translated like this:
"[neq]") is "!=" (Not Equal)
"[eq]" is "=" (Equal)
"[le]" is "<=" (Less or equal)
"[lt]" is "<" (Less than)
"[ge]" is ">=" (Greater or Equal)
"[gt]" is ">" (Greater than)


uriQuerySearch has 6 elements you need to know about.
.RESTType, GET, POST, DELETE, PATCH depending on what you want to do.
.query This is where you input your query data.
.allowedCols array of columns that can be requested (Persistent)
.allfiltersQuerys contains of an array of filterParts or be used if no filter exists. example 'vehicle=car' (Persistent)
.requiredSets For POST and PATCH setvalues that have to be defined for the sql to be created. Example {col: "id"} or {col:'id', comparisonOperator: '[eq]'}. comparisonOperator defaults to '[eq]' if not set
.filtersRequired filterparts that is required. Example {col: "id"} or {col:'id', comparisonOperator: '[eq]'}. comparisonOperator defaults to '[eq]' if not set
.sql('from') returns a select, insert, update or delete query depending on RESTType.

Sorting will be done in the following order: First whatever is in cols, then the filters in the order they are in the string.

RESTType and query can be defined upon creating the object.

    const UriQuerySearch = require('uriQuerySearch');
    const qs = new UriQuerySearch('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3','GET');
    const sql = sq.sql('table'); // will return
    // SELECT 'first', 'second', 'third' FROM 'fromTable' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') ORDER BY 'first' asc, 'second' desc

A few examples will follow

    const qs = new UriQuerySearch('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3');
    qs.allowedCols.push('first');
    qs.allowedCols.push('third');
    // qs.allowedCols = ['first', 'third']; // you can also do it this way.
    console.log(qs.sql('table'));
    // SELECT 'first', 'third' FROM 'table' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') ORDER BY 'first' asc, 'second' desc


    const qs = new UriQuerySearch('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3&filter="first[ge]20','GET');
    console.log(qs.sql('table'));
    // SELECT 'first', 'second', 'third' FROM 'table' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') OR 'first' >= '20' ORDER BY 'first' asc, 'second' desc
    console.log(qs.sql('(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)'));
    // SELECT 'first', 'second', 'third' FROM '(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') OR 'first' >= '20' ORDER BY 'first' asc, 'second' desc


    const qs = new UriQuerySearch('?cols=first=1,second=2','POST');
    console.log(qs.sql(table));
    // INSERT INTO 'table' ( 'first' , 'second') values ('1', '2');

    const qs = new UriQuerySearch('?cols=id=42','DELETE');
    console.log(qs.sql(table));
    // DELETE FROM 'table' WHERE id=42;
