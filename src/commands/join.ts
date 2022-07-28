import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import { EndBehaviorType, joinVoiceChannel } from '@discordjs/voice';
import { player } from '../voice';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import * as prism from 'prism-media';
import { Command } from "./command";
import * as child_process from "child_process";


const command: Command = {
	data: new SlashCommandBuilder().setName('join').setDescription('Joins voice with you'),
	async execute(interaction: ChatInputCommandInteraction) {
		const member = interaction.member as GuildMember
		const voiceChannel = member.voice?.channel;
		if (voiceChannel) {
			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: false,
			});

			connection.subscribe(player);
			await interaction.reply({ content: 'Joined!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'Your are not in a voice channel!', ephemeral: true});
		}
	},
};

export { command };