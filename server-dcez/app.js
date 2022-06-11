const express = require('express');
const request = require('request');
const app = express();
const port = 5000;

const { Client, Intents, Collection } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/card', (req, res) => {
    const member = client.guilds.cache.get('939799133177384990').members.cache.get('784141856426033233');
    const activity = member.presence.activities[0];
    // console.log(activity);
    res.send(activity);
})

// ask user for their discord id inside the api call to get the user's card info
app.get('/card/:id', (req, res) => {
    const id = req.params.id;
    const member = client.guilds.cache.get('939799133177384990').members.cache.get(id);
    const activity = member.presence.activities[0];
    // console.log(activity);
    res.send(activity);
})

client.on("presenceUpdate", function (oldPresence, newPresence, args, oldActivity, newActivity) {

    const currentActivity = newPresence.activities[0];

    if (newPresence.user.id === "784141856426033233" && newPresence.user.bot === false) {
        // console.log(`${newPresence.user.tag} is ${newPresence.status}`);
        if (currentActivity.name === "Spotify") {
            console.log(`${newPresence.user.username} is listening to ${currentActivity.details} \nby ${currentActivity.state}}`);
        } else if (currentActivity.name === "Code") {
            console.log(`${currentActivity.state}`);
        }   
    }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
client.login(process.env.DISCORD_TOKEN);