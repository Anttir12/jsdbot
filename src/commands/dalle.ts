import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from './command';
import {Configuration, CreateImageRequestSizeEnum, ImagesResponse, OpenAIApi} from 'openai';
import 'dotenv/config';


const command: Command = {
	data: new SlashCommandBuilder().setName('dalle')
		.addStringOption(option =>
            option.setName("prompt")
                  .setDescription("The prompt to generate the image from")
                  .setRequired(true))
        .addIntegerOption(option =>
                  option.setDescription("How many images to create (1-10)")
					    .setName("count")
                        .setMaxValue(10)
                        .setMinValue(1)
                        .setRequired(true))
        .addStringOption(option =>
			option.setName("size")
				.setDescription("Size of the generated images")
				.setRequired(true)
				.addChoices(
        	    {name: "256", value:"256x256"},
	            {name: "512", value: "512x512"},
    	        {name: "1024", value: "1024x1024"}
            	)).setDescription('Create an image with Dalle!'),

	async execute(interaction: ChatInputCommandInteraction) {
		const prompt = interaction.options.getString("prompt");
		const size = interaction.options.getString("size");
		const count = interaction.options.getInteger("count");

		const configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		})
		const openai = new OpenAIApi(configuration)
		const replyMessage = count > 1 ? "Generated images" : "Generated image"
		const reply = await interaction.reply({content: "Generating images...", ephemeral: false})
		openai.createImage({
			prompt: prompt,
			n:  count,
			size: size as CreateImageRequestSizeEnum
		}).then(async (response) => {

			const images = response.data as ImagesResponse;

			const urls = images.data.map(img => new EmbedBuilder().setTitle(prompt).setImage(img.url));
			await reply.edit({content: `${replyMessage} with prompt "${prompt}"`, embeds: urls})
		});
	},
};

export { command };