const UriQuerySearch = require('./uriQuerySearch');

let queryText = '';
let command = '';

let query = new UriQuerySearch();

queryText = '?cols=first,second';
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
console.log("-SET- query._allfilters: " + JSON.stringify(query._allfilters));
console.log( '--- cols: ' + JSON.stringify(query._cols))
console.log( '--- error: ' + JSON.stringify(query._error))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');

queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
query.allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
console.log("--- query._allfilters: " + JSON.stringify(query._allfilters));
console.log( '--- cols: ' + JSON.stringify(query._cols))
console.log( '--- error: ' + JSON.stringify(query._error))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
query._allowedCols = [];
console.log('-SET- allowedCols: ' + JSON.stringify(query._allowedCols));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
console.log("--- query._allfilters: " + JSON.stringify(query._allfilters));
console.log( '--- cols: ' + JSON.stringify(query._cols))
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');



queryText = '?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3'
queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log( '--- error: ' + JSON.stringify(query._error))
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
query._allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query._allowedCols));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
query._allfilters.push("forth>=25");
console.log("-SET- query._allfilters: " + JSON.stringify(query._allfilters));
console.log( '--- cols: ' + JSON.stringify(query._cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');



queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log( '--- error: ' + JSON.stringify(query._error))
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
query._allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query._allowedCols));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
query._allfilters.length = 0;
console.log("-SET- query._allfilters: " + JSON.stringify(query._allfilters));
console.log( '--- cols: ' + JSON.stringify(query._cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');



queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log( '--- error: ' + JSON.stringify(query._error))
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
query._allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query._allowedCols));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
console.log("--- query._allfilters: " + JSON.stringify(query._allfilters));
console.log( '--- cols: ' + JSON.stringify(query._cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');



queryText = '?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3&filter="first[ge]20';
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log( '--- error: ' + JSON.stringify(query._error))
console.log("--- query._colsQuerys: " + JSON.stringify(query._colsQuerys));
console.log("--- query._filterQuerys: " + JSON.stringify(query._filterQuerys));
query._allowedCols =  ['first', 'third'];
console.log('-SET- allowedCols: ' + JSON.stringify(query._allowedCols));
console.log("--- query._sortBy: " + JSON.stringify(query._sortBy));
console.log("--- query._filters: " + JSON.stringify(query._filters));
console.log("--- query._allfilters: " + JSON.stringify(query._allfilters));
console.log('--- cols: ' + JSON.stringify(query._cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');
command = "query.sql('(select * from bananaboat)')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');
command = "query.sql('(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)')"
console.log(command);
console.log(eval(command));
console.log( '--- error: ' + JSON.stringify(query._error))
console.log('\n');

