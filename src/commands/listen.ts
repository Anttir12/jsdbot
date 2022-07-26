import 'dotenv/config';
import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {AudioReceiveStream, EndBehaviorType, getVoiceConnection} from '@discordjs/voice';
import * as prism from 'prism-media';
import {Command} from "./command";
import * as websocket from 'websocket-stream';
import {getWsToken} from "../dbot-client";

interface AudioListener {
    stream: AudioReceiveStream
    webSocket: websocket.WebSocketDuplex
}

const currentlyListening: Record<string, AudioListener> = {};

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('listen')
        .setDescription('Starts to listen and analyzing your speech'),
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember
        const userId = member.id.toString();
        if (userId in currentlyListening) {
            killListening(userId);
            await interaction.reply({content: 'No longer listening!', ephemeral: true});
        } else {
            const voiceChannel = member.voice?.channel;
            if (voiceChannel) {
                const userId = member.id.toString();
                const wsToken = await getWsToken();
                if (wsToken) {
                    const connection = getVoiceConnection(voiceChannel.guild.id);
                    const opusStream = connection.receiver.subscribe(userId, {
                        end: {
                            behavior: EndBehaviorType.Manual,
                        },
                    });
                    const ws = websocket(`${process.env.DBOT_LISTEN_STREAM}?wsToken=${wsToken}`)

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
                        console.log("Starting to listen!")
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

                    await interaction.reply({
                        content: `Listening you! Your stt feed: https://www.dbot.devduck.fi/stt/feed/${wsToken}`,
                        ephemeral: true});
                } else {
                    await interaction.reply({content: 'Failed to get WS token', ephemeral: true})
                }
            } else {
                await interaction.reply({content: 'Your are not in a voice channel!', ephemeral: true});
            }
        }
    },
};

const killListening = (userId: string) => {
    const audioListener = currentlyListening[userId]
    if (audioListener) {
        console.log("Killing listening things")
        audioListener.stream.destroy()
        audioListener.webSocket.destroy()
        delete currentlyListening[userId]
        return true
    }
    return false
}

export {command};
