const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs')

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('던전을 오픈합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('name')
            .setDescription('던전의 이름을 통해 던전을 선택합니다')
            .setRequired(true)),

    async execute(interaction) {
        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		var Dungeondata = JSON.parse(dataJson);

        const name = interaction.options._hoistedOptions[0].value
        
        if(name in Dungeondata)
        {
            if(Dungeondata[name].state === 0)
            {
                Dungeondata[name].state = 1
                dataSave(Dungeondata, 'Dungeondata')

                if(Dungeondata[name].type === 'normal')
                {
                    const row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(name)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel('입장')
                        );

                    const embed = new EmbedBuilder()
                        .setTitle(`${name} 던전이 오픈됩니다.`)
                        .setDescription(`아레 버튼을 통해 참가하실수 있습니다\n입장 현황 - 0/${Dungeondata[name].playerLimit}`)
                    interaction.reply({ embeds: [embed], components: [row1] })
                } 
                else
                {
                    var role = interaction.guild.roles.cache.find(role => role.id === Dungeondata[name].targetrole)
                    const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(name)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel('입장')
                        );

                    const embed = new EmbedBuilder()
                        .setTitle(`${name} 이벤트 던전이 오픈됩니다.`)
                        .setDescription(`${role} 역할 보유자 한정으로 아레 버튼을 통해 참가하실수 있습니다\n입장 현황 - 0/${Dungeondata[name].playerLimit}`)
                    interaction.reply({ embeds: [embed], components: [row2] })
                }      
            }
            else
            {
                interaction.reply({ content: '이미 오픈된 던전입니다.', ephemeral: true })
            }
        }
        else
        {
            interaction.reply({ content: '존재하지 않는 던전입니다.', ephemeral: true })
        }
    }
}