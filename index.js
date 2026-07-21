// ============================================================
// AccountGen - Discord Account Generator Bot (FINAL FIX)
// ============================================================
// Requirements: npm install discord.js
// ============================================================

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const PREFIX = ".";
const BOT_NAME = "SaintFlix Gen";
const FOOTER_TEXT = "Powered by AccountGen Bot";
const VOUCH_TIMEOUT_MINUTES = 10;
const VOUCH_MESSAGE = "Leave a vouch with .vouch <service> <message> + screenshot!";

const OWNER_ID = "1399683999659593789";

const CHANNEL_RESTRICTIONS = {
  "bgen": "1501651225710559477",
  "gen": "1501668467407851612",
  "vouch": ["1501668467407851612", "1501651225710559477"],
  "restock": "1501688358668075172",
  "bstock": "1501688358668075172",
  "fstock": "1501688358668075172",
  "removecooldown": ["1501651225710559477", "1501668467407851612"],
  "untimeout": ["1501651225710559477", "1501668467407851612", "1501688358668075172"]
};

const VOUCH_CHANNEL_ID = "1502123594829004953";

const SERVICES = [
  { id: 1, name: "Netflix", emoji: "🇳", category: "booster", stock: [] },
  { id: 2, name: "Netflix TV", emoji: "🇳", category: "booster", stock: [] },
  { id: 3, name: "Crunchyroll", emoji: "🍊", category: "booster", stock: [] },
  { id: 4, name: "Prime Video", emoji: "🎬", category: "booster", stock: [] },
  { id: 5, name: "Disney+", emoji: "🏰", category: "booster", stock: [] },
  { id: 6, name: "Spotify", emoji: "🎵", category: "booster", stock: [] },
  { id: 7, name: "Steam", emoji: "🎮", category: "booster", stock: [] },
  { id: 8, name: "ChatGPT", emoji: "🤖", category: "booster", stock: [] },
  { id: 9, name: "Xbox", emoji: "🕹️", category: "booster", stock: [] },
  { id: 10, name: "Paramount+", emoji: "⭐", category: "booster", stock: [] },
  { id: 11, name: "Netflix", emoji: "🇳", category: "free", stock: [] },
  { id: 12, name: "Netflix TV", emoji: "🇳", category: "free", stock: [] }
];

const cooldowns = new Map();
const timedOutUsers = new Set();

// ─── PREVENT DUPLICATE INSTANCES ───
let isReady = false;
let isShuttingDown = false;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once("ready", () => {
  if (isReady) {
    console.log("⚠️ Duplicate instance detected - shutting down");
    if (!isShuttingDown) {
      isShuttingDown = true;
      process.exit(0);
    }
    return;
  }
  isReady = true;
  console.log(`✅ ${client.user.tag} is online!`);
});

// ─── PROCESS MESSAGES ───
const processedMessages = new Set();

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  // ─── DEDUPLICATION ───
  if (processedMessages.has(message.id)) return;
  processedMessages.add(message.id);
  setTimeout(() => processedMessages.delete(message.id), 5000);

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  const allowedChannel = CHANNEL_RESTRICTIONS[command];
  if (allowedChannel) {
    let isAllowed = false;
    if (Array.isArray(allowedChannel)) {
      isAllowed = allowedChannel.includes(message.channel.id);
    } else {
      isAllowed = message.channel.id === allowedChannel;
    }
    if (!isAllowed) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Wrong Channel")
        .setDescription(`Please use this command in <#${allowedChannel}>`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }
  }

  // ─── untimeout ───
  if (command === "untimeout") {
    if (message.author.id !== OWNER_ID) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Permission Denied")
        .setDescription("Only the bot owner can use this command.")
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const target = args[0];
    if (!target) {
      return message.reply(`Usage: ${PREFIX}untimeout <@user or userID>\nExample: ${PREFIX}untimeout @user`);
    }

    let userId = target;
    const mentionMatch = target.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
      userId = mentionMatch[1];
    }

    if (timedOutUsers.has(userId)) {
      timedOutUsers.delete(userId);
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ Timeout Removed")
        .setDescription(`<@${userId}> can now use .bgen and .gen again.`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("ℹ️ No Timeout Found")
        .setDescription(`<@${userId}> does not have a vouch timeout.`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }
  }

  // ─── removecooldown ───
  if (command === "removecooldown") {
    if (message.author.id !== OWNER_ID) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Permission Denied")
        .setDescription("You do not have permission to use this command.")
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const target = args[0];
    if (!target) {
      return message.reply(`Usage: ${PREFIX}removecooldown <@user or userID>\nExample: ${PREFIX}removecooldown @user`);
    }

    let userId = target;
    const mentionMatch = target.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
      userId = mentionMatch[1];
    }

    let removedCount = 0;
    const keysToRemove = [];
    for (const [key] of cooldowns) {
      if (key.startsWith(`${userId}:`)) {
        keysToRemove.push(key);
        removedCount++;
      }
    }

    for (const key of keysToRemove) {
      cooldowns.delete(key);
    }

    if (removedCount === 0) {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("ℹ️ No Cooldowns Found")
        .setDescription(`<@${userId}> has no active cooldowns.`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Cooldown Removed")
      .setDescription(`Removed **${removedCount}** cooldown(s) for <@${userId}>.`)
      .setFooter({ text: FOOTER_TEXT });
    return message.reply({ embeds: [embed] });
  }

  // ─── bstock ───
  if (command === "bstock") {
    if (message.author.id !== OWNER_ID) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Permission Denied")
        .setDescription("Only the bot owner can use this command.")
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const serviceName = args[0];
    const account = args.slice(1).join(" ");
    
    if (!serviceName || !account) {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("Usage")
        .setDescription(`${PREFIX}bstock <service> <account>\nExample: ${PREFIX}bstock Netflix account_here`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const service = SERVICES.find(
      (s) => s.name.toLowerCase() === serviceName.toLowerCase() && s.category === "booster"
    );

    if (!service) {
      return message.reply(`❌ Booster service **${serviceName}** not found.`);
    }

    service.stock.push(account);
    
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Booster Account Added")
      .setDescription(`Added **${service.emoji} ${service.name}** booster account.\nTotal: **${service.stock.length}** accounts`)
      .setFooter({ text: FOOTER_TEXT });
    
    return message.reply({ embeds: [embed] });
  }

  // ─── fstock ───
  if (command === "fstock") {
    if (message.author.id !== OWNER_ID) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Permission Denied")
        .setDescription("Only the bot owner can use this command.")
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const serviceName = args[0];
    const account = args.slice(1).join(" ");
    
    if (!serviceName || !account) {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("Usage")
        .setDescription(`${PREFIX}fstock <service> <account>\nExample: ${PREFIX}fstock Netflix account_here`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    const service = SERVICES.find(
      (s) => s.name.toLowerCase() === serviceName.toLowerCase() && s.category === "free"
    );

    if (!service) {
      return message.reply(`❌ Free service **${serviceName}** not found.`);
    }

    service.stock.push(account);
    
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("✅ Free Account Added")
      .setDescription(`Added **${service.emoji} ${service.name}** free account.\nTotal: **${service.stock.length}** accounts`)
      .setFooter({ text: FOOTER_TEXT });
    
    return message.reply({ embeds: [embed] });
  }

  // ─── bgen / gen ───
  if (command === "bgen" || command === "gen") {
    if (timedOutUsers.has(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("⛔ You are Timed Out")
        .setDescription(`You did not vouch within **${VOUCH_TIMEOUT_MINUTES} minutes** of your last generation.\nPlease contact an admin to use .untimeout @user`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

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
      const remaining = 60 - elapsed;
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
        .setTitle(`❌ ${service.name} Out of Stock`)
        .setDescription(`**${service.emoji} ${service.name}** is currently out of stock.`)
        .setFooter({ text: FOOTER_TEXT });
      return message.reply({ embeds: [embed] });
    }

    cooldowns.set(cdKey, Date.now());
    timedOutUsers.delete(message.author.id);
    setTimeout(() => {
      timedOutUsers.add(message.author.id);
    }, VOUCH_TIMEOUT_MINUTES * 60 * 1000);

    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`${service.emoji} ${service.name} Account`)
        .setDescription(`\`\`\`\n${account}\n\`\`\``)
        .setFooter({ text: FOOTER_TEXT })
        .setTimestamp();
      await message.author.send({ embeds: [dmEmbed] });
    } catch {
      service.stock.unshift(account);
      timedOutUsers.delete(message.author.id);
      return message.reply("❌ Could not DM you. Please enable DMs from server members.");
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Account Generated!")
      .setDescription(
        `<@${message.author.id}> Your **${service.emoji} ${service.name}** account has been sent to your DMs!\n\n` +
        `📝 **NOTES** ${VOUCH_MESSAGE}\n` +
        `⚠️ **IMPORTANT:** You have **${VOUCH_TIMEOUT_MINUTES} minutes** to vouch or you'll be **timed out**!`
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
      .setDescription(description || "No accounts in stock.")
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

    timedOutUsers.delete(message.author.id);

    const words = vouchText.split(" ");
    const serviceName = words[0];
    const vouchMessage = words.slice(1).join(" ") || "No message provided";

    const service = SERVICES.find(
      (s) => s.name.toLowerCase() === serviceName.toLowerCase()
    );

    const vouchEmbed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle(`✅ Vouch — ${service ? service.name : serviceName}`)
      .setDescription(`"${vouchMessage}"`)
      .addFields(
        { name: "Service", value: service ? `${service.emoji} ${service.name}` : serviceName, inline: true },
        { name: "Tier", value: service ? service.category : "Unknown", inline: true },
        { name: "Total Vouches by User", value: `#${Math.floor(Math.random() * 100) + 1}`, inline: true }
      )
      .setFooter({ text: `Vouched by ${message.author.username}` })
      .setTimestamp();

    const vouchChannel = client.channels.cache.get(VOUCH_CHANNEL_ID);
    if (vouchChannel) {
      await vouchChannel.send({ embeds: [vouchEmbed] });
      return message.reply("✅ Your vouch has been submitted! You can now use .bgen/.gen again.");
    } else {
      return message.reply("❌ Vouch channel not found. Please contact the owner.");
    }
  }

  // ─── help ───
  if (command === "help") {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${BOT_NAME} — Commands`)
      .addFields(
        { name: `${PREFIX}bgen <service>`, value: "Generate a booster account (10 min vouch required)", inline: false },
        { name: `${PREFIX}gen <service>`, value: "Alias for bgen", inline: false },
        { name: `${PREFIX}bstock <service> <account>`, value: "Add booster account to stock (Owner only)", inline: false },
        { name: `${PREFIX}fstock <service> <account>`, value: "Add free account to stock (Owner only)", inline: false },
        { name: `${PREFIX}restock`, value: "View current stock counts", inline: false },
        { name: `${PREFIX}vouch <service> <msg>`, value: "Submit a vouch (removes timeout)", inline: false },
        { name: `${PREFIX}removecooldown <@user>`, value: "Remove a user's cooldown (Owner only)", inline: false },
        { name: `${PREFIX}untimeout <@user>`, value: "Remove a user's vouch timeout (Owner only)", inline: false },
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
