import { SlashCommandBuilder } from 'discord.js';
import { Command } from './command';
import { play } from '../dbot-client';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .addStringOption((option) =>
      option.setName('url').setDescription('YouTube URL').setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName('volume')
        .setDescription('Volume used to play this clip')
        .setRequired(false),
    )
    .setDescription('You can play music from youtube'),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    const volume = interaction.options.getNumber('volume');
    await interaction.reply('Please wait...');
    console.log('Attempting to play ' + url);
    let playing = false;
    const t2 = setTimeout(() => {
      interaction.editReply(
        'https://tenor.com/view/just-a-second-please-eric-cartman-south-park-s3e4-e304-gif-21551405',
      );
    }, 5000);
    const t1 = setTimeout(() => {
      interaction.editReply(
        'If this takes longer than 15 minutes this command will fail. If there ' +
          'are no errors the download will continue in background event if this command failed \n' +
          'https://tenor.com/view/please-be-patient-with-me-just-relax-persevering-sorry-to-keep-you-waiting-angrily-ever-after-gif-15122848',
      );
    }, 120000);
    const success = await play(url, volume);
    clearTimeout(t1);
    clearTimeout(t2);
    if (success) {
      playing = true;
      await interaction.editReply('Now playing! ' + url);
    } else {
      await interaction.editReply('Failed to play ' + url);
    }
  },
};

export { command };
