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
		.setName('push')
		.setDescription('특정 유저에게 포인트를 지급 합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
            .setDescription('대상 유저')
            .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
            .setDescription('지급 포인트 수량')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('사유')
            .setDescription('포인트 지급 사유')
            .setRequired(true)),
    async execute(interaction) {
        
        const targtUser = interaction.options._hoistedOptions[0]
        const value = interaction.options._hoistedOptions[1].value
        const res = interaction.options._hoistedOptions[2].value
        //userData.json 불러오기
		var jsonBuffer = fs.readFileSync('userData.json')
		var dataJson = jsonBuffer.toString();
		const userData = JSON.parse(dataJson);

        const UserId = targtUser.user.id

        await Autoreg(targtUser)

        var oldpoint = userData[UserId].point
        userData[UserId].point += value
        userData[UserId].cntpoint += value
        
        dataSave(userData, 'userData')

        SheetLog({
            tname: `${targtUser.user.username}#${targtUser.user.discriminator}`,
            type: 4,
            res: res,
            gpoint: oldpoint,
            value: value,
            lpoint: userData[UserId].point,
            name: `${interaction.user.username}#${interaction.user.discriminator}`
        })

        interaction.reply({ content: '지급 성공', ephemeral: true })
    }
}