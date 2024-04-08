const fs = require('fs');
const job_data = JSON.parse(fs.readFileSync('./data/Reincarnetion/job_data.json','utf8'));
const num_to_str = ["0","A","B","C","D","E","F","G"]

module.exports = async(db,user_id, val) => {
    let uuid = user_id + num_to_str[val[1]]
    const find_data = db.prepare('SELECT exp,lvl,job_lvl,job FROM reinc_chara WHERE uuid = ?');
    const rows = find_data.get(uuid);
    if (rows === undefined){
        return "`>ジョブデータが登録されていません。`"
    }
    // 経験値増減
    if (val.length == 3) {
        if (val[2].match(/[^0-9\+\-]/)){
            return "`>増減量が不正です。`"
        }

        var change_value = 0
        var send_msg = ""
        var lvl_up = 0
        var lvl_down = 0

        if (val[2].startsWith("+")){
            change_value = rows.exp + Number(val[2].replace("+",""))
        }else if(val[2].startsWith("-")){
            change_value = rows.exp - Number(val[2].replace("-",""))
            if(change_value < 0){return "`>増減量が不正です。`"}
        }else{
            return "`>増減量が不正です。`"
        }
        // レベルアップ判定
        switch (true){
            case change_value >= job_data["exp"][String(rows.lvl+5)]:
                lvl_up = 5;
                send_msg = `### > LEVEL UP: ${rows.lvl} >> ${rows.lvl+5}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl+5} | Exp: ${change_value}\``
                break;
            case change_value >= job_data["exp"][String(rows.lvl+4)]:
                lvl_up = 4;
                send_msg = `### > LEVEL UP: ${rows.lvl} >> ${rows.lvl+4}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl+4} | Exp: ${change_value}\``
                break;
            case change_value >= job_data["exp"][String(rows.lvl+3)]:
                lvl_up = 3;
                send_msg = `### > LEVEL UP: ${rows.lvl} >> ${rows.lvl+3}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl+3} | Exp: ${change_value}\``
                break;
            case change_value >= job_data["exp"][String(rows.lvl+2)]:
                lvl_up = 2;
                send_msg = `### > LEVEL UP: ${rows.lvl} >> ${rows.lvl+2}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl+2} | Exp: ${change_value}\``
                break;
            case change_value >= job_data["exp"][String(rows.lvl+1)]:
                lvl_up = 1;
                send_msg = `### > LEVEL UP: ${rows.lvl} >> ${rows.lvl+1}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl+1} | Exp: ${change_value}\``
                break;
            // ここからレベル低下
            case change_value < job_data["exp"][String(rows.lvl-1)]:
                lvl_down = 2;
                send_msg = `> LEVEL DOWN: ${rows.lvl} >> ${rows.lvl-2}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl-2} | Exp: ${change_value}\``
                break
            case change_value < job_data["exp"][String(rows.lvl)]:
                lvl_down = 1;
                send_msg = `> LEVEL DOWN: ${rows.lvl} >> ${rows.lvl-1}\n\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl-1} | Exp: ${change_value}\``
                break
            default:
                send_msg = `\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl} | Exp: ${change_value}\``
        }
        const upd_exp = db.prepare('UPDATE reinc_chara SET exp = ?, lvl = ? WHERE uuid = ?');
        if (val[2].startsWith("+")){
            upd_exp.run(change_value, rows.lvl + lvl_up, uuid)
        }else{
            upd_exp.run(change_value, rows.lvl - lvl_down, uuid)
        }
        return send_msg
    // 現在経験値・レベル確認
    }else if(val.length == 2){
        let send_msg = `\`>> Job: ${job_data[rows.job][rows.job_lvl][0]} | Lvl: ${rows.lvl} | Exp: ${rows.exp}\``
        return send_msg
    }else{
        return "aa"
    }

}