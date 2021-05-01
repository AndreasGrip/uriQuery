# uriQuerySearch

Make SQL querys from url querys. Fairly easy and very useful when getting data from database using REST

It was created to get data from sql tables/databases but can be used to get data from just about anything, and might in the future, but for now just SQL.

It has 6 elements you need to know about.  
.query This is where you input your query data.  
.allowedCols array of columns that can be requested
.allFilters contains an array of subfilters that will be applied to to all filters. (if there is no filters will create one).
.filters contains an array of sets of filters, each filter being an array of subfilters objects  
.sortBy contains an array of object on how to sort. Sorting will appear in the following order. First whatever is in cols, then the filters in the order they are in the string.  
.cols contains an array of columns to return  
.sql('from') returns a select

Assuming you know JSON this will be explained by example below

    const UriQuerySearch = require('uriQuerySearch');

Run

    const query = new UriQuerySearch('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3');

OR

    const query = new UriQuerySearch();
    query = '?cols=first,second[desc],third&filter=first[asc]=1,second=2,third=3';

Will make query contain

    query.filters = [
        [
            {col: 'first', comparisonOperator: '[eq]', compare: ['1']},
            {col: 'second', comparisonOperator: '[eq]', compare: ['2']},
            {col: 'third', comparisonOperator: '[eq]', compare: ['3']}
        ]
    ];
    query.sortBy = [{col: 'second', sortorder: 'desc'}, {col: 'first', sortorder: 'asc'}];
    query.cols = {first,second,third};

if you run

    query.sql('fromTable')

it will return

    SELECT 'first', 'second', 'third' FROM 'fromTable' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') ORDER BY 'first' asc, 'second' desc

Usually you'd like to limit the data users can get from databases.  
Here is an example of how to limit what user can get.

    const query = new UriQuerySearch('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3');
    query.allowedCols.push('first');
    query.allowedCols.push('third');
    // query.allowedCols = ['first', 'third']; // you can also do it this way.
    console.log(query.sql('fromTable'));

Will generate

    SELECT 'first', 'third' FROM 'table' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') ORDER BY 'first' asc, 'second' desc

And cols will look like this.

    query.cols = {first,third};

Possible operators are

= OR [eq] Equal  
!= OR [ne] Not equal  
 < OR [lt] less than  
<= OR [le] less than or equal  
 \> OR [gt] greater than  
\>= OR [ge] greater than or equal  
[or] logical or, Only to be used with [eq] or [neq]  
% is wildcard like \*  
After columnname  
[asc] sort asc  
[desc] sort desc

const query = new UriQuerySearch('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3&filter="first[ge]20');

Will generate the following sql when running query.sql('table');

    SELECT 'first', 'second', 'third' FROM 'table' WHERE  OR ('first' = '1' AND 'second' = '2' AND 'third' = '3') OR 'first' >= '20' ORDER BY 'first' asc, 'second'   desc

And

    query.sql('(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)');

Will return.

    SELECT 'first', 'third' FROM '(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)' WHERE  OR ('first' = '1' AND 'second' = '2'   AND 'third' = '3') OR 'first' >= '20' ORDER BY 'first' asc, 'second' desc
