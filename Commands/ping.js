const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('ping'),
    async execute(interaction) {
        interaction.reply('pong!')
    }
}