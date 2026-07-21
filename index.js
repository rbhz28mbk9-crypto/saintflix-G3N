// ============================================================
// AccountGen - Discord Account Generator Bot
// ============================================================
// Requirements: npm install discord.js
// ============================================================

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const PREFIX = ".";
const BOT_NAME = "SaintFlix Gen";
const FOOTER_TEXT = "Powered by AccountGen Bot";
const VOUCH_TIMEOUT_MINUTES = 10;
const VOUCH_MESSAGE = "Leave a vouch with .vouch <service> <message> + screenshot!";

// ─────────────────────────────────────────
// CHANNEL RESTRICTIONS - ADD THIS BLOCK
// ─────────────────────────────────────────
const CHANNEL_RESTRICTIONS = {
  "bgen": "1501651225710559477",
  "gen": "1501668467407851612",
  "vouch": "1502123594829004953",
  "restock": "1501688358668075172"
};

// ─────────────────────────────────────────
// SERVICES & STOCK
// ─────────────────────────────────────────
const SERVICES = [
  { id: 1, name: "Netflix", emoji: "🇳", category: "booster", cooldownMinutes: 60, stock: ["user1@gmail.com:Netflix123!","user2@yahoo.com:Pass456#","user3@hotmail.com:Secure789$","user4@gmail.com:Netflix321!","user5@proton.me:NflxPass111"] },
  { id: 2, name: "Netflix TV", emoji: "🇳", category: "booster", cooldownMinutes: 60, stock: ["tvuser1@gmail.com:NetflixTV1!","tvuser2@yahoo.com:TVPass234#","tvuser3@hotmail.com:NflxTV567$","tvuser4@gmail.com:TvAcc890!"] },
  { id: 3, name: "Crunchyroll", emoji: "🍊", category: "booster", cooldownMinutes: 60, stock: [] },
  { id: 4, name: "Prime Video", emoji: "🎬", category: "booster", cooldownMinutes: 60, stock: [] },
  { id: 5, name: "Disney+", emoji: "🏰", category: "booster", cooldownMinutes: 60, stock: [] },
  { id: 6, name: "Spotify", emoji: "🎵", category: "booster", cooldownMinutes: 60, stock: ["spot1@gmail.com:Spotify123!","spot2@yahoo.com:SpPass456#","spot3@hotmail.com:Spot789$","spot4@gmail.com:SpotifyAcc1","spot5@proton.me:SpotAcc2","spot6@gmail.com:SpotifyPass3","spot7@yahoo.com:SpotifyPass4","spot8@hotmail.com:SpotifyPass5","spot9@gmail.com:SpotifyPass6"] },
  { id: 7, name: "Steam", emoji: "🎮", category: "booster", cooldownMinutes: 120, stock: ["steamuser1@gmail.com:SteamPass1!","steamuser2@gmail.com:SteamPass2!","steamuser3@gmail.com:SteamPass3!","steamuser4@gmail.com:SteamPass4!","steamuser5@gmail.com:SteamPass5!","steamuser6@gmail.com:SteamPass6!","steamuser7@gmail.com:SteamPass7!","steamuser8@gmail.com:SteamPass8!","steamuser9@gmail.com:SteamPass9!","steamuser10@gmail.com:SteamPass10!","steamuser11@gmail.com:SteamPass11!","steamuser12@gmail.com:SteamPass12!","steamuser13@gmail.com:SteamPass13!","steamuser14@gmail.com:SteamPass14!","steamuser15@gmail.com:SteamPass15!","steamuser16@gmail.com:SteamPass16!","steamuser17@gmail.com:SteamPass17!","steamuser18@gmail.com:SteamPass18!","steamuser19@gmail.com:SteamPass19!","steamuser20@gmail.com:SteamPass20!","steamuser21@gmail.com:SteamPass21!","steamuser22@gmail.com:SteamPass22!","steamuser23@gmail.com:SteamPass23!","steamuser24@gmail.com:SteamPass24!","steamuser25@gmail.com:SteamPass25!","steamuser26@gmail.com:SteamPass26!","steamuser27@gmail.com:SteamPass27!","steamuser28@gmail.com:SteamPass28!"] },
  { id: 8, name: "ChatGPT", emoji: "🤖", category: "booster", cooldownMinutes: 60, stock: ["chatgpt1@gmail.com:ChatGPT123!","chatgpt2@yahoo.com:ChatPass456#","chatgpt3@hotmail.com:GPTAcc789$","chatgpt4@gmail.com:ChatGPT321!","chatgpt5@proton.me:GPTPass111"] },
  { id: 9, name: "Xbox", emoji: "🕹️", category: "booster", cooldownMinutes: 60, stock: ["xbox1@gmail.com:XboxPass1!","xbox2@gmail.com:XboxPass2!","xbox3@gmail.com:XboxPass3!","xbox4@gmail.com:XboxPass4!","xbox5@gmail.com:XboxPass5!","xbox6@gmail.com:XboxPass6!","xbox7@gmail.com:XboxPass7!"] },
  { id: 10, name: "Paramount+", emoji: "⭐", category: "booster", cooldownMinutes: 60, stock: ["paramount1@gmail.com:ParamPass1!","paramount2@gmail.com:ParamPass2!","paramount3@gmail.com:ParamPass3!","paramount4@gmail.com:ParamPass4!","paramount5@gmail.com:ParamPass5!","paramount6@gmail.com:ParamPass6!","paramount7@gmail.com:ParamPass7!"] },
  { id: 11, name: "HBO Max", emoji: "📺", category: "free", cooldownMinutes: 30, stock: [] },
  { id: 12, name: "Deezer", emoji: "🎶", category: "free", cooldownMinutes: 30, stock: [] }
];

const cooldowns = new Map();

// ─────────────────────────────────────────
// BOT SETUP
// ─────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  // ─── CHANNEL RESTRICTION CHECK ───
  const allowedChannel = CHANNEL_RESTRICTIONS[command];
  if (allowedChannel && message.channel.id !== allowedChannel) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("❌ Wrong Channel")
      .setDescription(`Please use this command in <#${allowedChannel}>`)
      .setFooter({ text: FOOTER_TEXT });
    return message.reply({ embeds: [embed] });
  }

  // ─── bgen OR gen <service> ───
  if (command === "bgen" || command === "gen") {
    const query = args.join(" ").toLowerCase();
    if (!query) {
      return message.reply(`Usage: ${PREFIX}${command} <service name>\nExample: ${PREFIX}${command} netflix`);
    }

    const service = SERVICES.find(
      (s) => s.name.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );

    if (!service) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Service Not Found")
        .setDescription(`No service matching **${query}** was found. Use ${PREFIX}restock to see available services.`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const cdKey = `${message.author.id}:${service.id}`;
    const lastUsed = cooldowns.get(cdKey);
    if (lastUsed) {
      const elapsed = (Date.now() - lastUsed) / 1000 / 60;
      const remaining = service.cooldownMinutes - elapsed;
      if (remaining > 0) {
        const mins = Math.floor(remaining);
        const secs = Math.round((remaining - mins) * 60);
        const embed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle("⏳ Cooldown Active")
          .setDescription(`You can generate again in **${mins}m ${secs}s**`)
          .setFooter({ text: `${service.emoji} ${service.name}` });
        return message.reply({ embeds: [embed] });
      }
    }

    const account = service.stock.shift();
    if (!account) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Out of Stock")
        .setDescription(`**${service.emoji} ${service.name}** is currently out of stock. Check back later!`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    cooldowns.set(cdKey, Date.now());

    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`${service.emoji} ${service.name} Account`)
        .setDescription(`\`\`\`${account}\`\`\``)
        .setFooter({ text: FOOTER_TEXT })
        .setTimestamp();
      await message.author.send({ embeds: [dmEmbed] });
    } catch {
      return message.reply("❌ Could not DM you. Please enable DMs from server members.");
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Account Generated!")
      .setDescription(
        `<@${message.author.id}> Your **${service.emoji} ${service.name}** account has been sent to your DMs!\n\n` +
        `📝 **NOTES** ${VOUCH_MESSAGE}\n` +
        `⚠️ **IMPORTANT:** You have **${VOUCH_TIMEOUT_MINUTES} minutes** to vouch or you'll be timed out for 1 day!`
      )
      .setFooter({ text: FOOTER_TEXT });

    return message.reply({ embeds: [confirmEmbed] });
  }

  // ─── restock ───
  if (command === "restock") {
    const boosterServices = SERVICES.filter((s) => s.category === "booster");
    const freeServices = SERVICES.filter((s) => s.category === "free");

    let description = "";
    if (boosterServices.length > 0) {
      description += "**🚀 Booster Services**\n";
      description += boosterServices.map((s) => `• ${s.emoji} ${s.name}: **${s.stock.length}**`).join("\n");
      description += "\n\n";
    }
    if (freeServices.length > 0) {
      description += "**🆓 Free Services**\n";
      description += freeServices.map((s) => `• ${s.emoji} ${s.name}: **${s.stock.length}**`).join("\n");
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📦 Account Stock")
      .setDescription(description || "No services configured.")
      .setFooter({ text: FOOTER_TEXT })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // ─── vouch ───
  if (command === "vouch") {
    const vouchText = args.join(" ");
    if (!vouchText) {
      return message.reply(`Usage: ${PREFIX}vouch <service> <your message>\nExample: ${PREFIX}vouch netflix great service!`);
    }
    const vouchEmbed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle("✅ Vouch Submitted")
      .setDescription(`Thank you for vouching, <@${message.author.id}>!`)
      .setFooter({ text: FOOTER_TEXT });
    return message.reply({ embeds: [vouchEmbed] });
  }

  // ─── help ───
  if (command === "help") {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${BOT_NAME} — Commands`)
      .addFields(
        { name: `${PREFIX}bgen <service>`, value: "Generate an account for a service", inline: false },
        { name: `${PREFIX}gen <service>`, value: "Alias for bgen", inline: false },
        { name: `${PREFIX}restock`, value: "View current stock counts", inline: false },
        { name: `${PREFIX}vouch <service> <msg>`, value: "Submit a vouch after receiving an account", inline: false },
        { name: `${PREFIX}help`, value: "Show this help message", inline: false }
      )
      .setFooter({ text: FOOTER_TEXT });
    return message.reply({ embeds: [embed] });
  }
});

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("❌ BOT_TOKEN environment variable is required.");
  process.exit(1);
}

client.login(token);
