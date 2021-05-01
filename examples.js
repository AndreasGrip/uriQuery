const UriQuery = require('./uriQuery');

let queryText = '';
let command = '';

queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
let query = new UriQuery(queryText);
console.log("--- query.colsQuerys: " + JSON.stringify(query.colsQuerys));
console.log("--- query.filterQuerys: " + JSON.stringify(query.filterQuerys));
query.allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query.sortBy: " + JSON.stringify(query.sortBy));
console.log("--- query.filters: " + JSON.stringify(query.filters));
console.log("--- query.allfilters: " + JSON.stringify(query.allfilters));
console.log( '--- cols: ' + JSON.stringify(query.cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log('\n');
console.log("--- query.colsQuerys: " + JSON.stringify(query.colsQuerys));
console.log("--- query.filterQuerys: " + JSON.stringify(query.filterQuerys));
query.allowedCols = [];
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query.sortBy: " + JSON.stringify(query.sortBy));
console.log("--- query.filters: " + JSON.stringify(query.filters));
console.log("--- query.allfilters: " + JSON.stringify(query.allfilters));
console.log( '--- cols: ' + JSON.stringify(query.cols))
console.log(command);
console.log(eval(command));
console.log('\n');



queryText = '?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3'
queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log("--- query.colsQuerys: " + JSON.stringify(query.colsQuerys));
console.log("--- query.filterQuerys: " + JSON.stringify(query.filterQuerys));
query.allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query.sortBy: " + JSON.stringify(query.sortBy));
console.log("--- query.filters: " + JSON.stringify(query.filters));
query.allfilters.push("forth>=25");
console.log("-SET- query.allfilters: " + JSON.stringify(query.allfilters));
console.log( '--- cols: ' + JSON.stringify(query.cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log('\n');



queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log("--- query.colsQuerys: " + JSON.stringify(query.colsQuerys));
console.log("--- query.filterQuerys: " + JSON.stringify(query.filterQuerys));
query.allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query.sortBy: " + JSON.stringify(query.sortBy));
console.log("--- query.filters: " + JSON.stringify(query.filters));
query.allfilters.length = 0;
console.log("-SET- query.allfilters: " + JSON.stringify(query.allfilters));
console.log( '--- cols: ' + JSON.stringify(query.cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log('\n');



queryText = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40'
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log("--- query.colsQuerys: " + JSON.stringify(query.colsQuerys));
console.log("--- query.filterQuerys: " + JSON.stringify(query.filterQuerys));
query.allowedCols.push('kaka');
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query.sortBy: " + JSON.stringify(query.sortBy));
console.log("--- query.filters: " + JSON.stringify(query.filters));
console.log("--- query.allfilters: " + JSON.stringify(query.allfilters));
console.log( '--- cols: ' + JSON.stringify(query.cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log('\n');



queryText = '?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3&filter="first[ge]20';
console.log("-".repeat(50))
console.log(queryText);
console.log("-".repeat(50))
query.query = queryText;
console.log("--- query.colsQuerys: " + JSON.stringify(query.colsQuerys));
console.log("--- query.filterQuerys: " + JSON.stringify(query.filterQuerys));
query.allowedCols =  ['first', 'third'];
console.log('-SET- allowedCols: ' + JSON.stringify(query.allowedCols));
console.log("--- query.sortBy: " + JSON.stringify(query.sortBy));
console.log("--- query.filters: " + JSON.stringify(query.filters));
console.log("--- query.allfilters: " + JSON.stringify(query.allfilters));
console.log('--- cols: ' + JSON.stringify(query.cols))
command = "query.sql('table')"
console.log(command);
console.log(eval(command));
console.log('\n');
command = "query.sql('(select * from bananaboat)')"
console.log(command);
console.log(eval(command));
console.log('\n');
command = "query.sql('(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)')"
console.log(command);
console.log(eval(command));
console.log('\n');

