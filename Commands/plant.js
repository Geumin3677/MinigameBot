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
		.setName('plant')
		.setDescription('씨앗을 심습니다. 씨앗이 이미 심어져 있다면 남은 시간을 표시합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        //plant.json 불러오기
		var jsonBuffer = fs.readFileSync('plant.json')
		var dataJson = jsonBuffer.toString();
		const plant = JSON.parse(dataJson);

        if(!(interaction.user.id in plant))
        {
            const isholder = interaction.member.roles.cache.has(holderRole)
            plant[interaction.user.id] = {
                seed : 0,
                seedtime : 0,
                IsHolder : isholder,
                reducecnt : 0,
                amplecnt : 0,
                ampletime : 0,
                planttime : 0,
                Isplanted : false
            }
            dataSave(plant, "plant")
        }

        if(plant[interaction.user.id].planttime === 0 && plant[interaction.user.id].Isplanted === false)
        {
            if(!(interaction.user.id in plant) || plant[interaction.user.id].seed === 0)
            {
                interaction.reply({ content: `보유 씨앗이 없습니다.`, ephemeral: true })
            }
            else
            {
                plant[interaction.user.id].seed -= 1
                plant[interaction.user.id].Isplanted = true
                plant[interaction.user.id].planttime = 60 * 60 * 12
                plant[interaction.user.id].reducecnt = 0
                dataSave(plant, "plant")
                const embed = new EmbedBuilder()
                    .setTitle(`씨앗 심기 성공`)
                    .setDescription(`소유 씨앗 - ${plant[interaction.user.id].seed}개`)
                interaction.reply({ embeds: [embed] })
            }
        }
        else
        {
            interaction.reply({ content: `수확 가능 시간까지 \`${plant[interaction.user.id].planttime.toString().toHHMMSS()}\` 남았습니다.`, ephemeral: true })
        }
    }
}