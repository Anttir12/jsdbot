const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder().setName('leave').setDescription('Leaves voice channel'),
	async execute(interaction) {
		const connection = getVoiceConnection(interaction.guild.id);
		if (connection) {
			connection.destroy();
			interaction.reply({ content: 'Left voice', ephemeral: true });
		}
		else {
			interaction.reply({ content: 'I\'m not in voice', ephemeral: true });
		}
	},
};