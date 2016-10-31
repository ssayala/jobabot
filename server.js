
var Botkit = require('botkit');
var cheerio = require('cheerio');
var heard = require('./heard.js');
var tokenFile = 'tokens.json';
var fs = require('fs');

var tokens = JSON.parse(
    fs.readFileSync(tokenFile)
);

var port = 8080;

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required but missing');
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required but missing');
if (!port) throw new Error('PORT is required but missing');

var controller = Botkit.facebookbot({
    access_token: tokens.accessToken,
    verify_token: tokens.verifyToken
});

var bot = controller.spawn();

controller.setupWebserver(port, function (err, webserver) {
    if (err) return console.error(err);
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log(new Date() + ':' + 'Jobabot Started');
    });
});

controller.hears(['hello', 'hi', 'hola'], 'message_received', heard.hello);
controller.hears(['find me a job', 'get me a job', 'i am looking for a job','i am looking for work','/work/g'],'message_received', heard.findMeJob);
controller.hears('message_received', function (bot, message) {
    console.log(message.text);
    bot.reply(message, 'I am sorry, I cant help you with that');
});

controller.on('facebook_postback', function (bot, message) {
    console.log(message.payload);
});
