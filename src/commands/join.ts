import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceBasedChannel,
} from 'discord.js';
import { joinVoice } from '../voice.js';
import { Command } from './command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Joins voice with you'),
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceChannel: VoiceBasedChannel | null = member.voice?.channel;
    if (voiceChannel) {
      joinVoice(voiceChannel);
      await interaction.reply({ content: 'Joined!', ephemeral: true });
    } else {
      await interaction.reply({
        content: 'Your are not in a voice channel!',
        ephemeral: true,
      });
    }
  },
};

export { command };
