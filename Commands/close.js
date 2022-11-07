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
        .addStringOption(option => 
            option.setName('사유')
            .setDescription('던전 폐쇄 사유')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		const Dungeondata = JSON.parse(dataJson);

        if(interaction.channel.id in Dungeondata)
        {
            Dungeondata[interaction.channel.id].state = 3
			dataSave(Dungeondata, 'Dungeondata')
            var role = interaction.guild.roles.cache.find(role => role.name === Dungeondata[interaction.channel.id].dungeonName)
                    
            interaction.channel.permissionOverwrites.edit(role, {
                SendMessages: false,
            })

            SheetLog({
                dname: interaction.channel.name,
                dtype : Dungeondata[interaction.channel.id].type,
                role: '',
                state: 'CLOSE',
                type: 3,
                editor: `${interaction.user.username}#${interaction.user.discriminator}`,
                res: interaction.options._hoistedOptions[0].value,
                lpoint: (Dungeondata[interaction.channel.id].chance * 5)
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