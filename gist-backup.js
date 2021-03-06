#!/usr/bin/env node
var rest = require('restler');
var request = require('request');
var fs = require('fs');
var mkdirp = require('mkdirp');
var prompt = require('readline-sync');

var ghUsername = process.argv[2] || prompt.question('Your GitHub Username? ');
var ghPassword = process.argv[3] || prompt.question('Your GitHub Password? ', { hideEchoBack: true });
var baseUrl = process.argv[4] || prompt.question('Base URL if enterprise (Press Enter to use GitHub "https://api.github.com" by default)? ') || 'https://api.github.com';
var savedir = process.argv[5] || prompt.question('Path to back-up dir (will create if not exists)? ') || 'gists';

mkdirp(savedir);

function getGists(page) {

    'use strict';

    var options = {
        username: ghUsername,
        password: ghPassword,
        url: baseUrl,
        headers: {
            'User-Agent': 'Gists backup'
        }
    };

    rest.get(baseUrl + '/gists?per_page=100&page=' + page, options).on('complete', function (data, response) {
        if (data instanceof Error) {
            console.log('Error:', data.message);
            return;
        }
        var increment = 1;
        data.forEach(function (gist) {
            var description = (!gist.description) ? 'Untitled' : gist.description
                .trim()
                .replace(/[^a-zA-Z0-9\s\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\%\.\+\~\_]/g, '');

            if (description.length > 255) {
                description = description.substring(0,255);
            }
            var dir = savedir + '/' + description;

            try {
                fs.statSync(dir);
                dir = dir + ' duplicate ' + increment++;
                mkdirp.sync(dir, function (error) {
                    if (error) {
                        throw error;
                    } else {
                        console.log('successfully created ' + dir);
                    }

                });
            }
            catch (err) {
                mkdirp.sync(dir, function (error) {
                    if (error) {
                        console.log('Error: ' + error);
                    } else {
                        console.log('successfully created ' + dir);
                    }

                });
            }

            for (var file in gist.files) {
                if (gist.files.hasOwnProperty(file)) {
                    var raw_url = gist.files[file].raw_url;
                    var filename = gist.files[file].filename;
                    var streamed = fs.createWriteStream(dir + '/' + filename);
                    request(raw_url).pipe(streamed);
                    streamed.on('error', function(error){
                        console.log('Write error: ' + error);
                    });
                }
            }
        });
        if (page === 1 && response.headers.link) {
            var links = response.headers.link.split(',');
            for (var link in links) {
                if (links.hasOwnProperty(link)) {
                    link = links[link];
                    if (link.indexOf('rel="next') > -1) {
                        var pages = link.match(/[0-9]+/)[0];
                    }
                }
                for (var p = 2; p < pages; p++) {
                    getGists(p);
                }
            }
        }
    }).on('error', function(err) {
        console.log('Error: ' + err);
        return;
    });
}

getGists(1);
