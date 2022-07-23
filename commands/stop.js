const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder().setName('stop').setDescription('Stop audio and clear playlist (NYI)'),
	async execute(interaction) {
		const connection = getVoiceConnection(interaction.guild.id);
		if (connection) {
			interaction.reply({ content: 'This functionality has not been implemented yet', ephemeral: true });
		}
		else {
			interaction.reply({ content: 'I\'m not in voice', ephemeral: true });
		}
	},
};