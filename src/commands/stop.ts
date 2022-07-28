import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { Command } from "./command";
import { player, clearQueue } from "../voice";

const command: Command = {
	data: new SlashCommandBuilder().setName('stop').setDescription('Stop audio and clear playlist'),
	async execute(interaction) {
		const connection = getVoiceConnection(interaction.guild.id);
		if (connection) {
			clearQueue();
			player.stop();
			interaction.reply({ content: 'Player stopped and queue cleared' });
		}
		else {
			interaction.reply({ content: 'I\'m not in voice', ephemeral: true });
		}
	},
};

export { command };