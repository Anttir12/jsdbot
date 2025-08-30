import { dirname, join } from 'path';
import { readdirSync } from 'fs';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';

(async () => {
  const commands = [];
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => file.endsWith('.js') && !file.startsWith('command'),
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file); // Slice the .js
    const commandFile = await import(filePath);
    commands.push(commandFile.command.data.toJSON());
  }

  let envVarsOk = true;
  if (!process.env.DISCORD_TOKEN) {
    console.log('Missing DISCORD_TOKEN');
    envVarsOk = false;
  }
  if (!process.env.APPLICATION_ID) {
    console.log('Missing APPLICATION_ID');
    envVarsOk = false;
  }
  if (!process.env.GUILD_ID) {
    console.log('Missing GUILD_ID');
    envVarsOk = false;
  }
  if (!envVarsOk) {
    return;
  }
  const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');
  rest
    .put(
      Routes.applicationGuildCommands(
        process.env.APPLICATION_ID ?? '',
        process.env.GUILD_ID ?? '',
      ),
      { body: commands },
    )
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
})();
