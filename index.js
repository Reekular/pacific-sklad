const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let sklad = {};

if (fs.existsSync('sklad.json')) {
  sklad = JSON.parse(fs.readFileSync('sklad.json'));
}

function save() {
  fs.writeFileSync('sklad.json', JSON.stringify(sklad, null, 2));
}

const commands = [
  new SlashCommandBuilder()
    .setName('pridat')
    .setDescription('Přidá surovinu')
    .addStringOption(option =>
      option.setName('surovina')
        .setDescription('Název suroviny')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('pocet')
        .setDescription('Počet')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('odebrat')
    .setDescription('Odebere surovinu')
    .addStringOption(option =>
      option.setName('surovina')
        .setDescription('Název suroviny')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('pocet')
        .setDescription('Počet')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('stav')
    .setDescription('Ukáže sklad')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log('Slash commands nahrány');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pridat') {
    const item = interaction.options.getString('surovina');
    const amount = interaction.options.getInteger('pocet');

    if (!sklad[item]) sklad[item] = 0;

    sklad[item] += amount;

    save();

    await interaction.reply(`Přidáno ${amount} ${item}`);
  }

  if (interaction.commandName === 'odebrat') {
    const item = interaction.options.getString('surovina');
    const amount = interaction.options.getInteger('pocet');

    if (!sklad[item]) sklad[item] = 0;

    sklad[item] -= amount;

    if (sklad[item] < 0) sklad[item] = 0;

    save();

    await interaction.reply(`Odebráno ${amount} ${item}`);
  }

  if (interaction.commandName === 'stav') {
    let text = '**SKLAD**\n';

    for (const item in sklad) {
      text += `${item}: ${sklad[item]}\n`;
    }

    await interaction.reply(text);
  }
});

client.login(token);
