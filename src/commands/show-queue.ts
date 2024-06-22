import { SlashCommandBuilder } from 'discord.js';
import { Command } from './command';
import { showQueue } from '../voice';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('showqueue')
    .setDescription('Show what is currently in queue'),
  async execute(interaction) {
    const queue = await showQueue();
    if (!queue || queue.length == 0) {
      interaction.reply('Queue is empty');
    } else {
      let queueMessage = 'Queue: \n';
      for (let i = 0; i < queue.length; i++) {
        queueMessage += i + 1 + '. ' + queue[i] + '\n';
      }
      interaction.reply(queueMessage);
    }
  },
};

export { command };
