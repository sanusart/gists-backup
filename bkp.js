var rest = require('restler');
var request = require('request');
var fs = require('fs');

var savedir = process.cwd() + '/gists';

if(!process.argv[2] || !process.argv[3]) {
    usage();
    return false;
}

function usage() {
    console.info("\r\nUsage: node bkp.js USERNAME PASSWORD\r\n")
}

function getGists(page) {
    var options = {
        username: process.argv[2],
        password: process.argv[3],
        headers: {
            'User-Agent': 'Gists backup'
        }
    };
    rest.get('https://api.github.com/gists?per_page=30&page=' + page, options).on('success', function (data, response) {

        data.forEach(function (gist) {
            var dir = savedir + '/' + gist.id;
            fs.mkdir(dir);
            for (var file in gist.files) {
                var raw_url = gist.files[file].raw_url;
                var filename = gist.files[file].filename;
                request(raw_url).pipe(fs.createWriteStream(dir + '/' + filename));
            }
        });
        if (page === 1 && response.headers.link) {
            var links = response.headers.link.split(',');
            for (var link in links) {
                link = links[link];
                if (link.indexOf('rel="next') > -1) {
                    var pages = link.match(/[0-9]+/)[0];
                }
            }
            for (var p = 2; p < pages; p++) {
                getGists(p);
            }
        }
    });
}

getGists(1);