const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { Autoreg } = require('./functions/Autoreg');

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('본인의 프로필을 조회합니다.'),
    async execute(interaction) {

        await Autoreg(interaction)

        //userData.json 불러오기
		var jsonBuffer = fs.readFileSync('userData.json')
		var dataJson = jsonBuffer.toString();
		const userData = JSON.parse(dataJson);

        ud = userData[interaction.user.id]

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${ud.name}`, iconURL: `${interaction.user.displayAvatarURL()}`, url: 'https://discord.js.org' })
            .setDescription(`Leaderboard Rank - None\nJE# - 💰${ud.point}`)
        interaction.reply({ embeds: [embed] })
    }
}