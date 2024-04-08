const Database = require('better-sqlite3');
const db = new Database('db.sqlite3', { verbose: console.log });

db.exec("create table if not exists reinc_chara(uuid,job,job_lvl,lvl,exp,hp,str,mp,dex,pdef,skill,mdef,luc)");
