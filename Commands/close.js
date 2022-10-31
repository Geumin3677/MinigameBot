const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs');
const { SheetLog } = require('./functions/Log');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('던전을 폐쇄합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		const Dungeondata = JSON.parse(dataJson);

        if(interaction.channel.name in Dungeondata)
        {
            Dungeondata[interaction.channel.name].state = 3
			dataSave(Dungeondata, 'Dungeondata')
            var role = interaction.guild.roles.cache.find(role => role.name === interaction.channel.name)
                    
            interaction.channel.permissionOverwrites.edit(role, {
                SendMessages: false,
            })

            SheetLog({
                dname: interaction.channel.name,
                dtype : Dungeondata[interaction.channel.name].type,
                role: '',
                state: 'CLOSE',
                type: 2
            })

            const embed = new EmbedBuilder()
                .setTitle(`던전 폐쇄`)
                .setDescription(`관리자에 의해 던전이 강제로 폐쇄 되었습니다.`)
            interaction.reply({ embeds: [embed] })
            dataSave(Dungeondata, 'Dungeondata')
        }
        else
        {
            interaction.reply({ content: '알맞은 채널이 아닙니다.', ephemeral: true })
        }
    }
}