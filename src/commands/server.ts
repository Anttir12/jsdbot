import { SlashCommandBuilder } from 'discord.js';
import { Command } from './command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Prints server info'),
  async execute(interaction) {
    const guild = interaction.guild;
    await interaction.reply(`Server info:
		Server name: ${guild?.name}
		Total members: ${guild?.memberCount}
		Created at: ${guild?.createdAt}
		Verification Level: ${guild?.verificationLevel}`);
  },
};

export { command };
