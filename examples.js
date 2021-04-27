const UriQuery = require('./uriQuery');

const query = new UriQuery('?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40');
query.allowedCols.push('kaka');
console.log(query.sql('table'));
console.log('\n');
query.allowedCols = [];
console.log(query.sql('table'));
console.log('\n');

const query2 = new UriQuery('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3');
query2.query = '?cols=kaka,baka[asc]=cho%[or]suga%,saka[desc][neq]kossa&filter=id=3[or]4,kaka=sa&filter=id[ge]10,id[le]40';
console.log(query2.sql('table'));
console.log('\n');


const query3 = new UriQuery('?cols=first,second,third&filter=first[asc]=1,second[desc]=2,third=3&filter="first[ge]20');
//query.allowedCols.push('first');
//query.allowedCols.push('third');
query3.allowedCols = ['first', 'third'];
console.log(query3.sql('(select * from bananaboat)'));
console.log('\n');
console.log(query3.sql('(select t1.first, t2.second, t2.third from table1 t1 join table2 t2 on t1.id = t2.id)'));

