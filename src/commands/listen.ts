import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {AudioReceiveStream, EndBehaviorType, getVoiceConnection} from '@discordjs/voice';
import * as prism from 'prism-media';
import { Command } from "./command";
import * as websocket from 'websocket-stream';

interface AudioListener {
	stream: AudioReceiveStream
	webSocket: websocket.WebSocketDuplex
}
const currentlyListening: Record<string, AudioListener> = {};

const command: Command = {
	data: new SlashCommandBuilder()
		.setName('listen')
		.addBooleanOption(option =>
			option.setName('stop')
				.setDescription('Stop listening')
				.setRequired(false))
		.setDescription('test listen'),
	async execute(interaction: ChatInputCommandInteraction) {
		const stop = interaction.options.getBoolean('stop', false)
			const member = interaction.member as GuildMember
		const voiceChannel = member.voice?.channel;
		if (voiceChannel) {
			const userId = member.id.toString();
			if(userId in currentlyListening) {
				if(stop){
					if(killListening(userId)) {
						await interaction.reply({ content: 'No longer listening!', ephemeral: true });
					} else {
						await interaction.reply({ content: 'Couldnt stop listening. Maybe I wasn\'t listening ' +
								'you in the first place?', ephemeral: true });
					}
				}else{
					await interaction.reply({ content: 'Already listening you!', ephemeral: true });
				}
			} else {
				const connection = getVoiceConnection(voiceChannel.guild.id);
				const opusStream = connection.receiver.subscribe(userId, {
					end: {
						behavior: EndBehaviorType.Manual,
					},
				});
				const ws = websocket("ws://localhost:8000/stt/")
				console.log("Starting to listen!")

				currentlyListening[userId] = {stream: opusStream, webSocket: ws};

				const oggStream = new prism.opus.OggLogicalBitstream({
					opusHead: new prism.opus.OpusHead({
						channelCount: 2,
						sampleRate: 48000,
					}),
					pageSizeControl: {
						maxPackets: 10,
					},
				});

				ws.on('open', () => {
					console.log("Opened WebSocket connection!")
				})

				ws.on('error', (err) => {
					console.log("Websocket error!")
					console.log(err)
					killListening(userId)
				})

				ws.on('closed', () => {
					console.log("Closed WebSocket connection!")
					killListening(userId)
				})

				opusStream.pipe(oggStream).pipe(ws);

				await interaction.reply({content: 'Listening you!', ephemeral: true});
			}
		}
		else {
			await interaction.reply({ content: 'Your are not in a voice channel!', ephemeral: true});
		}
	},
};

const killListening = (userId: string) => {
	const audioListener = currentlyListening[userId]
	if(audioListener){
		console.log("Killing listening things")
		audioListener.stream.destroy()
		audioListener.webSocket.destroy()
		delete currentlyListening[userId]
		return true
	}
	return false
}

export { command };