const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder().setName('join').setDescription('Joins voice with you'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice?.channel;
		if (voiceChannel) {
			joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			});
			interaction.reply({ content: 'Joined!', ephemeral: true });
		}
		else {
			interaction.reply({ content: 'Your are not in a voice channel!', ephemeral: true});
		}
	},
};