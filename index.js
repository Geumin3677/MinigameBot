const { token, holderRole } = require('./config.json');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const fs = require('fs')
const path = require('node:path');
const deploycommands = require('./deploy-commands');
const Loop = require('./Commands/functions/Loop');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const ment = ['로드클리닝 던전이 닫혔습니다.', '던전이 닫혔습니다. 아쉽지만 다음 던전에서 만나요~']
async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}

client.on('ready', async () => {
	Loop.updateloop()
    console.log('MinigameBot is Ready! dev by ABELA')
})

client.on('messageCreate', async msg => {
	try{
		if(msg.member.roles.cache.has(holderRole))
		{
			//plant.json 불러오기
			var jsonBuffer = fs.readFileSync('plant.json')
			var dataJson = jsonBuffer.toString();
			const plant = JSON.parse(dataJson);

			if(msg.member.id in plant)
			{
				if(plant[msg.member.id].reducecnt <= 120)
				{
					plant[msg.member.id].planttime -= 60
					plant[msg.member.id].reducecnt += 1
					dataSave(plant, 'plant')
				}
			}
		}
	}catch (error) {
		console.error(error);
	}
})

client.on('interactionCreate', async interaction => {

	if(interaction.isButton())
	{
		try{
			//Dungeondata.json 불러오기
			var jsonBuffer = fs.readFileSync('Dungeondata.json')
			var dataJson = jsonBuffer.toString();
			var Dungeondata = JSON.parse(dataJson);

			n = interaction.customId

			if(n in Dungeondata)
			{
				if(Dungeondata[n].state === 2)
				{
					interaction.reply({ content: `던전이 이미 닫혔습니다.`, ephemeral: true })
				}
				else if(Dungeondata[n].state === 3)
				{
					interaction.reply({ content: `던전이 이미 폐쇄 되었습니다.`, ephemeral: true })
				}
				else if(interaction.user.id in Dungeondata[n].player)
				{
					interaction.reply({ content: `이미 입장 하였습니다.`, ephemeral: true })
				}
				else if(Dungeondata[n].type === 'event' && !(interaction.member.roles.cache.has(Dungeondata[n].targetrole)))
				{
					interaction.reply({ content: '대상자가 아닙니다.', ephemeral: true })
				}
				else
				{
					var role = interaction.guild.roles.cache.find(role => role.id === Dungeondata[n].role)
					interaction.member.roles.add(role)
					Dungeondata[n].player[interaction.user.id] = 0
					dataSave(Dungeondata, 'Dungeondata')

					if(Object.keys(Dungeondata[n].player).length >= Dungeondata[n].playerLimit)
					{
						Dungeondata[n].state = 2
						dataSave(Dungeondata, 'Dungeondata')
						const row = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(n)
								.setStyle(ButtonStyle.Primary)
								.setLabel('입장')
								.setDisabled(true)
							);
						const embed = new EmbedBuilder()
							.setTitle(`${Dungeondata[n].dungeonName} ${ment[makeRandom(0, 1)]}`)
							.setDescription('정원 인원을 모두 채웠습니다.')
						interaction.update({ embeds: [embed], components: [row] })
					}
					else
					{
						const row = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(n)
								.setStyle(ButtonStyle.Primary)
								.setLabel('입장')
							);
						if(Dungeondata[n].type === 'event')
						{
							var role2 = interaction.guild.roles.cache.find(role => role.id === Dungeondata[n].targetrole)
							const embed = new EmbedBuilder()
								.setTitle(`${Dungeondata[n].dungeonName} 이벤트 던전이 오픈됩니다.`)
								.setDescription(`${role2} 역할 보유자 한정으로 아레 버튼을 통해 참가하실수 있습니다\n입장 현황 -${Object.keys(Dungeondata[n].player).length}/${Dungeondata[n].playerLimit}`)
							interaction.update({ embeds: [embed], components: [row] })
						}
						else
						{
							const embed = new EmbedBuilder()
								.setTitle(`${Dungeondata[n].dungeonName} 던전이 오픈됩니다.`)
								.setDescription(`아레 버튼을 통해 참가하실수 있습니다\n입장 현황 - ${Object.keys(Dungeondata[n].player).length}/${Dungeondata[n].playerLimit}`)
							interaction.update({ embeds: [embed], components: [row] })
						}
					}

					interaction.channel.send({ content: `${interaction.user} 님 ${Dungeondata[n].dungeonName} 던전 입장 성공`, ephemeral: true })
				}
			}
			else
			{
				interaction.reply({ content: `존재하지 않는 던전입니다.`, ephemeral: true })
			}
		}catch (error) {
			console.error(error);
			await interaction.reply({ content: '명령어 처리중 오류가 발생했습니다!', ephemeral: true });
		}
	}

	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '명령어 처리중 오류가 발생했습니다!', ephemeral: true });
	}
});

client.login(token);