import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from './command.js';
import OpenAI from 'openai';
import 'dotenv/config';

type sizeChoices =
  | '256x256'
  | '512x512'
  | '1024x1024'
  | '1792x1024'
  | '1024x1792';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('dalle')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('The prompt to generate the image from')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('size')
        .setDescription('Size of the generated images')
        .setRequired(true)
        .addChoices(
          { name: '1024x1024', value: '1024x1024' },
          { name: '1792x1024', value: '1792x1024' },
          { name: '1024x1792', value: '1024x1792' },
        ),
    )
    .addBooleanOption((option) =>
      option
        .setName('hd')
        .setDescription('For enhanced detail')
        .setRequired(false),
    )
    .setDescription('Create an image with Dalle!'),

  async execute(interaction: ChatInputCommandInteraction) {
    const prompt = interaction.options.getString('prompt')!;
    const size = interaction.options.getString('size');
    const quality = interaction.options.getBoolean('hd') ? 'hd' : 'standard';

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const replyMessage = 'Generated image';
    const reply = await interaction.reply({
      content: 'Generating image...',
      ephemeral: false,
    });
    openai.images
      .generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        quality: quality,
        size: size as sizeChoices,
      })
      .then(async (response) => {
        const images = response.data;
        let i = 1;
        const urls = images?.map((img) => {
          return new EmbedBuilder()
            .setTitle(`image #${i++}`)
            .setImage(img.url ?? null);
        });
        await reply.edit({
          content: `${replyMessage} with prompt "${prompt}"`,
          embeds: urls,
        });
      })
      .catch(async (reason) => {
        console.log('Failed');
        console.log(reason);
        let replyReason = `Request failed (${reason?.error?.message})`;
        let errorMessage = reason?.response?.data?.error?.message;
        let errorLine2 = errorMessage ? `\n${errorMessage}` : '';
        await reply.edit({ content: `${replyReason}${errorLine2}` });
      });
  },
};

export { command };
