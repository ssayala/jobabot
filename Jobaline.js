/**
 * Created by sunil on 7/13/16.
 */

var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var Jobaline = function () {};


function searchJobs(params, callback) {
    var location = params.loc;
    if (params.state) {
        location = location + ',' + params.state;
    }
    var url = "http://jobs.jobaline.com/?loc=" + location + "&range=500";
    if (params.keyword && params.keyword.length > 0) {
        url = url + '&q=' + params.keyword;
    }
    console.log(url);
    request(url, function(error, response,body) {
        if (!error && response.statusCode == 200) {
            callback(null,body);
        }
        else {
            callback(error);
        }
    });
}

function scrapeResults(body,callback) {
    var $ = cheerio.load(body);
    var items = $('.searchItem');
    var jobs = [];
    var locs = $('.multi-loc');
    if (locs.length > 0) {


        var multiLocations = [];
        locs.each(function(idx,item) {
            var loc = $(item).text();
            multiLocations.push(loc);
            console.log(loc);

        });
        callback(null,multiLocations);
    }
    else {
        items.each(function () {
            var title = $(this).find('.search_job_title');
            var desc = $(this)
                .find('#JobDetailsGroup')
                .find('.hidden-lg')
                .text().trim();

            jobs.push({
                title: title.text(),
                description: desc,
                url: title.attr('href')
            });
        });
        console.log("found jobs:", jobs.length);
        callback(null,null, jobs);
    }
}
Jobaline.prototype.search = function (params, func) {
        async.waterfall([
            async.apply(searchJobs, params),
            scrapeResults
    ],func);
};

module.exports = new Jobaline();