var utils = require('utils.js'),
path = require('path'),
fileName = 'packages.json',
packages = exports.packages = {},
updateGithub = function() {
    var keys = Object.keys(packages).filter(function(key) {
        var p = packages[key];
        return ! p.repo && p.repository && p.repository.url && p.repository.url.match(/github/i);
    });

    if (keys.length > 0) {
        var key = keys[0],
        origUrl = packages[key].repository.url,
        url = origUrl.replace(/(^.*\.com\/)|:|.git$/g, '');

        console.log('%d - %s - %s', keys.length, key, url);

        utils.getJSON({
            host: 'api.github.com',
            path: '/repos/' + url
        },
        function(repo) {
            packages[key].repo = repo;
            utils.saveJSON(fileName, packages, function() {
                setTimeout(updateGithub, 1000);
            });
        });
    } else {
        console.log('DONE!');
    }
},
update = exports.update = function() {
    console.log('Updating...');
    utils.loadJSON(fileName, function(err, data) {
        Object.keys(data).forEach(function(key) {
            packages[key] = data[key];
        });
        utils.getJSON({
            host: 'registry.npmjs.org'
        },
        function(data) {
            Object.keys(data).forEach(function(key) {
                if (!packages[key]) {
                    packages[key] = data[key];
                }
            });
            updateGithub();
        });
    });
};

console.log(fileName)

update();
setInterval(update, 60 * 60 * 1000);

