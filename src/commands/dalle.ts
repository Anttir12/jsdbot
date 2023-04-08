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
        .addStringOption(option =>
			option.setName("size")
				.setDescription("Size of the generated images")
				.setRequired(true)
				.addChoices(
        	    {name: "256", value:"256x256"},
				{name: "512", value: "512x512"},
    	        {name: "1024", value: "1024x1024"}
				))
		.addIntegerOption(option =>
                  option.setDescription("How many images to create (1-10)")
					    .setName("count")
                        .setMaxValue(10)
                        .setMinValue(1)
                        .setRequired(false))
		.setDescription('Create an image with Dalle!'),

	async execute(interaction: ChatInputCommandInteraction) {
		const prompt = interaction.options.getString("prompt");
		const size = interaction.options.getString("size");
		const count = interaction.options.getInteger("count") ?? 1;

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
			let i = 1;
			const urls = images.data.map(img => {
				return new EmbedBuilder().setTitle(`image #${i++}`).setImage(img.url)
			});
			await reply.edit({content: `${replyMessage} with prompt "${prompt}"`, embeds: urls});
		}).catch(async (reason) => {
			let replyReason = `Request failed (${reason?.response?.status})`;
			let errorMessage = reason?.response?.data?.error?.message;
			let errorLine2 = errorMessage ? `\n${errorMessage}` : "";
			await reply.edit({content: `${replyReason}${errorLine2}`});
		});
	},
};

export { command };