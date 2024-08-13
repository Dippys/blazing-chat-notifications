import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Events, GatewayIntentBits, GuildMember, Partials } from "discord.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const DiscordToken = process.env.DISCORD_TOKEN as string;
const PORT = process.env.PORT as string;
const APIKey = process.env.API_KEY as string;
const GuildID = process.env.GUILD_ID as string;

if (!DiscordToken || !PORT || !APIKey || !GuildID) {
    throw new Error("Missing environment variables.");
}

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const intentions = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
];

const partials = [
    Partials.Channel,
    Partials.GuildMember,
    Partials.User,
    Partials.Message
];

const client = new Client({ partials: partials, intents: intentions });

app.get("/", (req, res) => {
    res.json({ message: "Never gonna give you up" });
});

// quick middleware to check if the request has the correct API key

app.use((req, res, next) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== APIKey) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
});

app.post("/send-message", async (req: express.Request, res: express.Response) => {
    try {
        const { member, orderID, message, url } = req.body;

        if (!member || !orderID || !message || !url) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        // if any of the parameters are above 2000 characters, return an error

        if (member.length > 2000 || orderID.length > 2000 || message.length > 2000 || url.length > 2000) {
            return res.status(400).json({ message: "Parameters are too long" });
        }

        // Check if member is a user id or username based on Discord's snowflake
        const snowflakeRegex = new RegExp("^[0-9]{17,20}$"); // Updated regex

        let FullMember: GuildMember | null = null;

        if (snowflakeRegex.test(member)) {
            FullMember = await GetMemberByID(member);
        } else {
            FullMember = await GetMemberByUsername(member);
        }

        if (!FullMember) {
            return res.status(404).json({ message: "Member not found" });
        }

        await SendMessageToMember(FullMember, orderID, message, url);
        return res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error in /send-message endpoint:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

async function SendMessageToMember(member: GuildMember, orderID: string, message: string, url: string) {
    try {
        const dmChannel = await member.createDM();

        const Embed = new EmbedBuilder()
            .setTitle(`You got a new message in your order ${orderID}`)
            .setDescription(message)
            .setURL(url)
            .setTimestamp();

        const Button = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("View Order")
            .setURL(url); // Changed from setCustomId to setURL

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(Button);

        await dmChannel.send({ embeds: [Embed], components: [row] });
    } catch (error) {
        console.error("Error sending message to member:", error);
    }
}

async function GetMemberByID(memberID: string) {
    try {
        const guild = await client.guilds.fetch(GuildID);
        const member = await guild.members.fetch(memberID);
        return member;
    } catch (error) {
        console.error("Error fetching member by ID:", error);
        return null;
    }
}

async function GetMemberByUsername(username: string) {
    try {
        const guild = await client.guilds.fetch(GuildID);
        let members = await guild.members.search({ query: username, limit: 5 });
        // filter the member by username
        const member = members.find((member) => member.user.username === username);
        return member || null;
    } catch (error) {
        console.error("Error fetching member by username:", error);
        return null;
    }
}

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.login(DiscordToken);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
