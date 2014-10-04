var rest = require('restler');
var request = require('request');
var fs = require('fs');

var savedir = process.cwd() + '/gists';

if (!process.argv[2] || !process.argv[3]) {
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

    rest.get('https://api.github.com/gists?per_page=100&page=' + page, options).on('complete', function (data, response) {
		var increment = 1;
        data.forEach(function (gist) {
            var description = (gist.description == '') ? 'Untitled' : gist.description
			.replace(/\//gi, ' or ')
			.replace(/\>/gi, '')
			.replace(/\</gi, '')
			.replace(/\:/gi, '')
			.replace(/\"/gi, '')
			.replace(/\|/gi, '')
			.replace(/\?/gi, '')
			.replace(/\*/gi, '')
			.replace(/\\/gi, ' or ');
			
            var dir = savedir + '/' + description;

            try {
                fs.statSync(dir);
                dir = dir + ' duplicate ' + increment++;
                fs.mkdir(dir,function(error){
                    if (error) {
                        throw error;
                    } else {
                        console.log('successfully created ' + dir );
                    }

                });
            }
            catch (err) {
                fs.mkdir(dir,function(error){
                    if (error) {
                        console.log('Error: ' + error );
                    } else {
                        console.log('successfully created ' + dir );
                    }

                });
            }

            for (var file in gist.files) {
                var raw_url = gist.files[file].raw_url;
                var filename = gist.files[file].filename;
                request(raw_url).pipe(fs.createWriteStream(dir + '/' + filename,function(error){
                    if (error) {
                        throw error;
                    } else {
                        console.log('successfully created ' + dir + '/' + filename);
                    }

                }));
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