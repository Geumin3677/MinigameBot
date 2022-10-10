const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { holderRole } = require('../config.json');
const fs = require('fs')

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ample')
		.setDescription('식물에 물을 줍니다.'),
    async execute(interaction) {
        //plant.json 불러오기
		var jsonBuffer = fs.readFileSync('plant.json')
		var dataJson = jsonBuffer.toString();
		const plant = JSON.parse(dataJson);

        if(plant[interaction.user.id].Isplanted)
        {
            if(plant[interaction.user.id].ampletime != 0)
            {
                interaction.reply({ content: `다음 물주기 가능까지 \`${plant[interaction.user.id].ampletime.toString().toHHMMSS()}\` 남았습니다.`, ephemeral: true })
            }
            else
            {
                plant[interaction.user.id].amplecnt += 1
                plant[interaction.user.id].ampletime = 60 * 60
                dataSave(plant, "plant")
                const embed = new EmbedBuilder()
                    .setTitle(`물주기 성공`)
                    .setDescription(`누적 물주기 횟수 - ${plant[interaction.user.id].amplecnt}번`)
                interaction.reply({ embeds: [embed] })
            }
        }
        else
        {
            interaction.reply({ content: `씨앗이 심어져 있지 않습니다.`, ephemeral: true })
        }
    }
}