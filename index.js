// discord.jsライブラリの中から必要な設定を呼び出し、変数に保存します
const { Client, Events, GatewayIntentBits, Guild, GuildMessageManager, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { token } = require('./config.json');
const { channel } = require('diagnostics_channel');
const express = require('express');
const app = express();
app.use('/healthcheck', require('./routes/healthchecker'));
app.listen(80)

// DB
const Database = require('better-sqlite3');
const db = new Database('db.sqlite3', { verbose: console.log });

// 外部モジュール
const chara_func = require('./commands/chara.js');
const exp_func = require('./commands/exp.js');

const options = {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
};
const client = new Client(options);

client.once(Events.ClientReady, c => {
	console.log(`準備OKです! ${c.user.tag}がログインします。`);
});

// エリアデータを読み込み
const area_data = JSON.parse(fs.readFileSync('./data/explore_area.json','utf8'));
const order_data = JSON.parse(fs.readFileSync('./data/order.json','utf8'));
const chest_data = JSON.parse(fs.readFileSync('./data/chest.json','utf8'));
var order_progress = {test:0}
var area_progress = {test:0}

// 本体
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    // DBファイルの直ダウンロード
    if (message.content == "$getDB") {
        client.channels.cache.get('1073864827291840554').send({ files: ['db.sqlite3'] })
    }
    if (!message.content.startsWith("?")) return;
    
    // Garden of Pruner用のコマンド
    if (message.guildId === "1144251204235444285") {
        let commands = message.content.split(" ");
        let msg_channel_id = message.channel.id;

        if (message.content.includes("?exit")){
            if (msg_channel_id in order_progress){
                delete order_progress[msg_channel_id]
                message.channel.send("`>任務進捗が初期化されました。`");
            }else if(msg_channel_id in area_progress){
                delete area_progress[msg_channel_id]
                message.channel.send("`>探索進捗が初期化されました。`");
            }else{
                message.channel.send("`>任務または探索を開始していません。`");
            }
            return
        }

        if (commands.length === 1){
            message.channel.send("`>IDが指定されていません。`"); return
        }
        // }else if (isNaN(commands[1])){
        //     message.channel.send("`>不正なIDです。`"); return
        // }else if(Number(commands[1]) > 2){
        //     message.channel.send("`>不正なIDです。`"); return         
        // }

        // 探索コマンド
        if (message.content.includes('?area')) {
            var tmp = Math.floor(Math.random() * (20));

            if (commands[1] === "1"){
                if (msg_channel_id in area_progress) {
                    area_progress[msg_channel_id] += 1
                }else{
                    area_progress[msg_channel_id] = 1
                }
                if (area_progress[msg_channel_id] > 6) {tmp += 1}
            }
            // どのイベントを表示するか
            const areaName = area_data[commands[1]]["name"];
            const selectedResult = area_data[commands[1]]["events"][tmp];
            // エンベッドを作成
            const embed = new EmbedBuilder()
                .setColor('#ADFF2F')
                .setTitle(areaName)
                .setDescription(`${selectedResult}`);
            message.channel.send({ embeds: [embed] });

        // 任務コマンド
        }else if (message.content.includes('?order')) {
            // if (Number(commands[1]) > 1){
            //     message.channel.send("`>不正なIDです。`"); return
            // }
            var ev_data = "temp"
            // 既にチャンネルが登録済み
            if (msg_channel_id in order_progress) {
                order_progress[msg_channel_id] += 1;
                if (order_progress[msg_channel_id] == 3){
                    delete order_progress[msg_channel_id]
                    ev_data = order_data[commands[1]]["events"][3]
                }else{
                    ev_data = order_data[commands[1]]["events"][order_progress[msg_channel_id]]
                }
            // 未登録の場合
            }else{
                order_progress[msg_channel_id] = 0;
                ev_data = order_data[commands[1]]["events"][0]
            };
            // 送信
            const areaName = order_data[commands[1]]["name"]
            const embed = new EmbedBuilder()
                .setColor('#ADFF2F')
                .setTitle(areaName)
                .setDescription(`${ev_data}`);
            message.channel.send({ embeds: [embed] });
        }else if (message.content.includes("?chest")){
            if (Number(commands[1]) > 1){
                message.channel.send("`>不正なIDです。`"); return
            }
            var tmp = Math.floor(Math.random() * (2));
            ev_data = chest_data[commands[1]]["ev"][tmp]
            const embed = new EmbedBuilder()
                .setColor('#ADFF2F')
                .setTitle('▶チェスト開封結果')
                .setDescription(`${ev_data}`);
            message.channel.send({ embeds: [embed] });
        }
    // Reincarnetion用のコマンド
    }else if(message.guildId === "1136891962264391762"){
        let commands = message.content.split(" ");
        // キャラ状態管理コマンド
        if (message.content.includes('?job')) {
            if (message.content === '?job'){
                message.channel.send("`>引数が不正です`");
                return
            }
            if (isNaN(commands[1])){
                message.channel.send("`>ジョブIDが不正です`");
                return
            }
            if (0 >= Number(commands[1]) || Number(commands[1]) > 7){
                message.channel.send("`>ジョブIDが不正です`");
                return
            }
            let send_msg = await chara_func(db,message.author.id, commands);
            message.channel.send(send_msg);
        // 経験値管理コマンド
        }else if(message.content.includes('?exp')) {
            if (message.content === '?exp'){
                message.channel.send("`>引数が不正です`");
                return
            }
            if (isNaN(commands[1])){
                message.channel.send("`>ジョブIDが不正です`");
                return
            }
            if (0 >= Number(commands[1]) || Number(commands[1]) > 7){
                message.channel.send("`>ジョブIDが不正です`");
                return
            }
            let send_msg = await exp_func(db,message.author.id, commands);
            message.channel.send(send_msg);
        }
    }
    
});

client.login(token);