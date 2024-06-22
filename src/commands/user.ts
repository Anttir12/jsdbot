import { SlashCommandBuilder } from 'discord.js';
import { Command } from './command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Prints user info'),
  async execute(interaction) {
    const user = interaction.user;
    await interaction.reply(`User info:
		Your tag: ${user.tag}
		Your ID: ${user.id}
		Created at: ${user.createdAt}`);
  },
};

export { command };
