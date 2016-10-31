/**
 * Created by sunil on 7/13/16.
 */
'use strict';

var expect = require('chai').expect;
var jobaline = require('../Jobaline.js');
var heard = require('../heard.js');

//these are integration tests that call the actual web server
describe('jobaline job Search', function () {

    it('should return results for zipcode', function (done) {

        //set timeout for web calls on slow connections
        this.timeout(12000);

        jobaline.search({loc: '98012'}, function (e, d, j) {
            expect(e).to.be.null;
            expect(j).to.not.be.null;
            expect(j).to.have.length.above(0);
            done();
        });

    });

    it('should return no results for bad zipcode', function (done) {
        this.timeout(12000);
        jobaline.search({loc: '00000'}, function (e, d,j) {

            expect(e).to.be.null;
            expect(j).to.not.be.null;
            expect(j).to.have.length.of(0);
            done();
        });
    });

    it('should return multiple cities for columbus', function(done) {

        this.timeout(12000);
        jobaline.search({loc: 'columbus'}, function(e,d,j) {
            expect(e).to.be.null;
            expect(d).to.not.be.null;
            expect(d).to.have.length.above(0);
            done();
        });
    });

    it('should return jobs for city and state', function(done) {
        jobaline.search({loc: 'columbus', state: 'oh'}, function (e, d, j) {
            expect(e).to.be.null;
            expect(j).to.not.be.null;
            expect(j).to.have.length.above(0);
            done();
        });
    });
});

describe('utilities Tests', function () {
    it('should create a fb template', function () {
        var jobs = [{
            title: "cleaner",
            description: 'blah blah blah',
            url: 'http://jobs.jobaline.com/apply?jobid=1234'
        }];

        var template = heard.createFbMessageTemplate(jobs, "apply now");
        expect(template).to.not.be.null;
        expect(template.attachment).to.not.be.undefined;
        expect(template.attachment.type).to.equal('template');
        expect(template.attachment.payload.elements).to.have.length.of(1);
    });

});
