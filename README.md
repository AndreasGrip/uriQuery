# uriQuery

## Reason for existence

Make SQL querys from url querys. Fairly easy and very useful when creating a REST api towards a database.

## History

It was created  to make creating api's reading/writing to databases into a breeze to get data from sql tables/databases for now just it just create SQL, but in the future other things might become supported.  
The current setup is for mysql, but if you need some other dialect tell me, support for Oracle, MSSQL could easy be added.
I thought this would be a simple small module to write, it have turned out to be a total sinkhole  :/ but during the process I learned alot, so good shit :).

## Usage

const uriQuery = require('uriQuery');

const uri = new uriQuery('?first=firstValue,second=secondValue');
console.log(uri.createSQL('table')); // "SELECT `first`, `second` FROM table WHERE 'first' in ('firstValue') AND 'second' in ('secondValue')"

### Filterparts  

The smallest part of uriQuerySearch is the filterpart.  
Filterpart is an object that looks like this  

    {
        column: 'columnName',
        comparisonOperator: '[eq]',
        compare: ['value1', 'value2']
    }

    and can be created by hand or createFilterPart() like this.
    uri.createFilterPart('first', '=', ['']);
    uri.createFilterPart('first', '[eq]', 'value');
  
### comparisonOperator

comparisonOperator can be translated like this:
"[neq]" is "!=" (Not Equal)  
"[eq]" is "=" (Equal)  
"[le]" is "<=" (Less or equal)  
"[lt]" is "<" (Less than)  
"[ge]" is ">=" (Greater or Equal)  
"[gt]" is ">" (Greater than)  
"[as]" is assigning operator for post and patch. [eq] is used for the filters.

#### RESTType  

- GET - Get data (sql select)  
- POST - Add a new row (sql insert)  
- DELETE - Delete a row (sql delete)  
- PATCH - Update data in a row (sql update)  

#### allowed, required, enforced

allowed: Only filters that match those filterparts are allowed.
required: There have to me matches for all filterparts in this array.
enforced: These filterparts will be added to all querys.

During matching all existing parts will be used, missing parts are considered wildcards.
{column: 'first'} and {column: 'first', comparisonOperator: '[eq]'} will both match '?first=ma'

uri.get.allowedGet[];
uri.get.enforcedGet[];
uri.get.allowedFilters[];
uri.get.enforcedFilters[];
uri.get.requiredFilters[];
uri.get.enforcedSortBy[];
uri.patch.allowedSets[];
uri.patch.enforcedSets[];
uri.patch.requiredSets[];
uri.patch.allowedFilters[];
uri.patch.enforcedFilters[];
uri.patch.requiredFilters[];
uri.post.allowedSets[];
uri.post.enforcedSets[];
uri.post.requiredSets[];
uri.delete.allowedFilters[];
uri.delete.enforcedFilters[];
uri.delete.requiredFilters[];

#### Sorting

Sorting will be done in the following order: First whatever is in cols, then the filters in the order they are in the string.
