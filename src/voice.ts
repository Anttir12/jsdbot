import { createAudioPlayer, createAudioResource } from '@discordjs/voice';
import { createClient } from 'redis';
import 'dotenv/config';
import { v4 as uuid } from 'uuid';

interface SoundItem {
    path: string,
    volume?: number,
    name: string,
    timestamp: string
}

const player = createAudioPlayer();
const r = createClient({
    url: 'redis://localhost:6379/7',
});



export const initialiseVoiceThing = async () => {
	await r.connect();
	setInterval(async () => {
        const soundJson = await r.get('SOUND_OVERRIDE');
        if(soundJson) {
            await r.del('SOUND_OVERRIDE');
            console.log("SOUND OVERRIDE!!!!");
            const soundItem = JSON.parse(soundJson);
            createAndPlayResource(soundItem);
        }
        else if (player.state.status === 'idle') {

            const soundJson = await r.lPop('SOUND_QUEUE');
            if (soundJson) {
                const soundItem: SoundItem = JSON.parse(soundJson);
                createAndPlayResource(soundItem);
            } else {
                //console.log('Idling');
            }
        }
        await r.set("BOT_STATUS", player.state.status);
	}, 50);
}

const createAndPlayResource = (soundItem: SoundItem) => {
    const volume = soundItem.volume ? Number(soundItem.volume) : 1;
    const inlineVolume = !isNaN(volume) && volume != 1;
    const resource = createAudioResource(soundItem.path, {
        inlineVolume: inlineVolume,
    });
    if(inlineVolume){
        resource.volume.setVolume(volume);
    }
    player.play(resource);
    console.log(`Playing (Volume: ${volume ?? 1}) :  ${soundItem.path})`);
}

const clearQueue = async () => {
    if(r.isReady) {
        await r.del("SOUND_QUEUE");
    }
}

const showQueue = async (): Promise<string[] | null> => {
    if(r.isReady) {
        const soundQueue = await r.lRange("SOUND_QUEUE", 0 , -1);
        return soundQueue.map(jsonString => {
            const item = JSON.parse(jsonString);
            return item.name;
        })
    }
    return null;
}

export { player, clearQueue, showQueue };