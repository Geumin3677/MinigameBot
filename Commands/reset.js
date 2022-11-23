const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const { Autoreg } = require('./functions/Autoreg');
const { SheetLog } = require('./functions/Log');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('리더보드를 초기화 합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute(interaction) {
        //userData.json 불러오기
		var jsonBuffer = fs.readFileSync('userData.json')
		var dataJson = jsonBuffer.toString();
		const userData = JSON.parse(dataJson);
        for(var a of Object.keys(userData)) {
            userData[a].cntpoint = 0   
        }
        dataSave(userData, 'userData')
        interaction.reply({ content: '초기화 성공', ephemeral: true })
    }
}