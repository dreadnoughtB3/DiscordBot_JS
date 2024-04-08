const fs = require('fs');
const num_to_str = ["0","A","B","C","D","E","F","G"]
const status_list = ["hp","str","mp","dex","pdef","skill","mdef","luc"]
const job_data = JSON.parse(fs.readFileSync('./data/Reincarnetion/job_data.json','utf8'));


module.exports = async(db,user_id, val) => {
    let uuid = user_id + num_to_str[val[1]]
    // ジョブ確認／ジョブ登録
    if (val.length == 2) {
        const stmt = db.prepare('SELECT * FROM reinc_chara WHERE uuid = ?');
        const rows = stmt.get(uuid);

        if (rows === undefined){
            let tmp = job_data[val[1]]["1"];
            const reg_job = db.prepare("INSERT INTO reinc_chara(uuid,job,job_lvl,lvl,exp,hp,str,mp,dex,pdef,skill,mdef,luc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
            reg_job.run(uuid,val[1],1,0,0,0,0,0,0,0,0,0,0);
            let send_msg = [` ***>> 以下の情報で登録を行いました。***`,
            `\`Job : ${tmp[0]} | Exp : 0 | Lvl : 0 \``,
            `\`\`\`体力: ${tmp[1]} / 力: ${tmp[2]} / 魔力: ${tmp[3]} / 速さ: ${tmp[4]}`,
            `守備: ${tmp[5]} / 技: ${tmp[6]} / 魔防: ${tmp[7]} / 幸運: ${tmp[8]} \`\`\``].join("\n");
            return send_msg
        }else{
            let tmp = job_data[rows.job][rows.job_lvl]
            let send_msg = [`\`Job : ${tmp[0]} | Exp : ${rows.exp} | Lvl : ${rows.lvl} \``,
            `\`\`\`体力: ${rows.hp+tmp[1]} / 力: ${rows.str+tmp[2]} / 魔力: ${rows.mp+tmp[3]} / 速さ: ${rows.dex+tmp[4]}`,
            `守備: ${rows.pdef+tmp[5]} / 技: ${rows.skill+tmp[6]} / 魔防: ${rows.mdef+tmp[7]} / 幸運: ${rows.luc+tmp[8]} \`\`\``].join("\n");
            return send_msg
        }
    // ジョブレベルアップ
    }else if(val[2] == "up"){
        const stmt = db.prepare('SELECT * FROM reinc_chara WHERE uuid = ?');
        const rows = stmt.get(uuid);
        if (rows === undefined){
            return "`>ジョブデータが登録されていません。`"
        }
        if (rows.job_lvl == 3){
            return "`>既に最上位ジョブです。`"
        }
        let tmp = job_data[rows.job][rows.job_lvl][0];
        let tmp_upd = job_data[rows.job][rows.job_lvl + 1][0];

        const upd_job = db.prepare('UPDATE reinc_chara SET job_lvl = ? WHERE uuid = ?');
        upd_job.run(rows.job_lvl + 1, uuid);
        return `\`>ジョブを${tmp}から${tmp_upd}に更新しました。\``
    }else if(status_list.includes(val[2])){
        if (val[3].match(/[^0-9\+\-]/)){
            return "`>増減量が不正です。`"
        }
        const bef_stat = db.prepare(`SELECT ${val[2]} FROM reinc_chara WHERE uuid = ?`);
        const row = bef_stat.get(uuid);
        const upd_stat = db.prepare(`UPDATE reinc_chara SET ${val[2]} = ? WHERE uuid = ?`);
        var change_value = 0
        if (val[3].startsWith("+")){
            change_value = row[val[2]] + Number(val[3].replace("+",""))
            upd_stat.run(change_value,uuid);
        }else if(val[3].startsWith("-")){
            change_value = row[val[2]] - Number(val[3].replace("-",""))
            if(change_value < 0){return "`>増減量が不正です。`"}
            upd_stat.run(change_value,uuid);
        }else{
            return "`>増減量が不正です。`"
        }
        return `\`>${val[2]}補正値を${row[val[2]]}から${change_value}に更新しました。\``
    }else{
        return "`>コマンドが不正です。`"
    }
}

