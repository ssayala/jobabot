/**
 * Created by sunil on 7/15/16.
 */


var jobaline = require('./Jobaline');
var LOCATION_QUESTION = "What location are you looking for jobs in, zipcode or city ?";
var JOBTYPE_QUESTION = "what type? you can use keyword, company name or job title";
var STATE_QUESTION = "what state? (two letter abbreviation)";


var Heard = function () {
};

Heard.prototype.createFbMessageTemplate = function(items, buttonTitle) {
    console.log(new Date() + ':' + 'creating fb message template...');
    var elements = [];
    for (var i = 0; i < items.length; i++) {
        elements.push({
            title: items[i].title,
            subtitle: items[i].description,
            buttons: [{
                type: "web_url",
                url: items[i].url,
                title: buttonTitle
            }]
        });
    }

    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

function processJobs(jobs, callback) {

    console.log(new Date() + ':' + "processing jobs...");
    if (!jobs) callback('error jobs is null');
    if (jobs.length == 0) {
        return callback(null, ["sorry, i did not find any jobs. can you please revise your query?"]);
    }
    else {
        return callback(null, ["great! I found " + jobs.length + " jobs"
            , Heard.prototype.createFbMessageTemplate(jobs, "Apply now")]);
    }
}

function searchJobs(response,convo) {

    var location = convo.extractResponse(LOCATION_QUESTION);
    var keyword = convo.extractResponse(JOBTYPE_QUESTION);
    var state = convo.extractResponse(STATE_QUESTION);
    console.log(JSON.stringify(location));
    jobaline.search({loc: location, keyword: keyword, state: state}, function (err, locs, jobs) {
        console.log(new Date() + ':' + "searched jobs " + location);
        if (err) {
            console.log(new Date() + ':' + "error after searching jobs");
            convo.say('sorry, something went wrong');
            convo.next();
        }
        else if (locs) {

            convo.ask(STATE_QUESTION,[ {
                pattern: '^([Aa][LKSZRAEPlkszraep]|[Cc][AOTaot]|[Dd][ECec]|[Ff][LMlm]|[Gg][AUau]|[Hh][Ii]|[Ii][ADLNadln]|[Kk][SYsy]|[Ll][Aa]|[Mm][ADEHINOPSTadehinopst]|[Nn][CDEHJMVYcdehjmvy]|[Oo][HKRhkr]|[Pp][ARWarw]|[Rr][Ii]|[Ss][CDcd]|[Tt][NXnx]|[Uu][Tt]|[Vv][AITait]|[Ww][AIVYaivy])$',
                callback: searchJobs
            },
                {
                    default: true,
                    callback: function() {
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);
            convo.next();
        }
        else {
            console.log(new Date() + ':' + "found jobs..");
            processJobs(jobs, function (err, messages) {

                for (var i = 0; i < messages.length; i++) {
                    convo.say(messages[i]);
                }
                convo.next();
            });
        }
    });
}

function yesOnType(response, conv) {
    conv.ask(JOBTYPE_QUESTION, searchJobs);
    conv.next();
}


function askKeywordQuestion(conv, bot) {
    conv.ask('are you looking for specific type of jobs ?', [
        {
            pattern: bot.utterances.yes,
            callback: yesOnType
        },
        {
            pattern: bot.utterances.no,
            callback: searchJobs
        },
        {
            default: true,
            callback: searchJobs
        }
    ]);
    conv.next();
}

function askLocationQuestion(conv, bot) {
    conv.ask(LOCATION_QUESTION, [
        {
            pattern: '^[0-9]{5}(?:-[0-9]{4})?$',
            callback: function(response, conv) {
                askKeywordQuestion(conv, bot);
            }

        },
        {
            default: true,
            callback: function(response, conv) {
                askKeywordQuestion(conv, bot);
            }
        }
    ]);
}

Heard.prototype.hello = function (bot, message) {

    bot.startConversation(message, function (err, conv) {
        conv.say("Hello!, I am Jobabot and I can help you find great hourly jobs");
        askLocationQuestion(conv,bot);
    });

};

Heard.prototype.findMeJob = function(bot, message) {
    bot.startConversation(message, function (err, conv) {
        askLocationQuestion(conv,bot);
    });
};

module.exports = new Heard();