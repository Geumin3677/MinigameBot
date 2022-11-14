const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs');
const { SheetLog } = require('./functions/Log');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('이 던전을 삭제합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		const Dungeondata = JSON.parse(dataJson);

        if(interaction.channel.id in Dungeondata)
        {
            var role = interaction.guild.roles.cache.find(role => role.id === Dungeondata[interaction.channel.id].role)
            role.delete()

            interaction.guild.channels.cache.get(interaction.channel.id).delete()

            var role = '-'
            if(Dungeondata[interaction.channel.id]?.targetrole != undefined)
            {
                var trole = interaction.guild.roles.cache.find(role => role.id === Dungeondata[interaction.channel.id].targetrole)
                role = trole.name
            }


            SheetLog({
                dname: Dungeondata[interaction.channel.id].dungeonName,
                dtype: Dungeondata[interaction.channel.id].type,
                role: role,
                state: 'DELETE',
                type: 2,
                editor: `${interaction.user.username}#${interaction.user.discriminator}`
            })

            delete Dungeondata[interaction.channel.id]
            dataSave(Dungeondata, 'Dungeondata')
        }
    }
}