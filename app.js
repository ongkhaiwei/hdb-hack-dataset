/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var path = require('path'), 
	fs = require('fs'),
	mime = require('mime'),
	unzip = require('unzip'),
	request = require('request');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.get('/file', function(req, res) {
	
	var uploadFolder = path.join(__dirname, 'upload/');
	request(req.query.url).pipe(fs.createWriteStream(uploadFolder + path.basename(req.query.url)));
	var file = uploadFolder + path.basename(req.query.url);
	res.send(path.basename(req.query.url)).status(200).end();

});

app.get('/extract', function(req, res) {
	
	var uploadFolder = path.join(__dirname, 'upload/');
	var file = uploadFolder + req.query.file;
	var shortfilename = req.query.file.toLowerCase().split('.');
	var shortfile = shortfilename[0].replace('-','_');
	var tempFolder = 'output/path';

	// Unzip file
	fs.createReadStream(file).pipe(unzip.Extract({ path: 'output/path'}));

	res.send(req.query.file).status(200).end();
	
});

app.get('/rendermap', function(req, res) {
	
	var uploadFolder = path.join(__dirname, 'upload/');
	var file = uploadFolder + req.query.file;
	var shortfilename = req.query.file.toLowerCase().split('.');
	var shortfile = shortfilename[0].replace('-','_');
	var tempFolder = 'output/path';
	var outputFolder = path.join(__dirname, tempFolder);

	fs.readdir(outputFolder, function(err, items) {
	    //console.log(items);
	    //console.log('leng:'+items.length)	 
	    for (var i=0; i<items.length; i++) {
	        //console.log("filename:"+items[i] + '-' + shortfile);
	        var shortitem = items[i].toLowerCase().split('.');
	        //console.log("filename2:"+shortitem[0] + '-' + shortfile);
	        if(shortitem[0].valueOf() === shortfile.valueOf()) {
	        	console.log('se:'+items[i]);
		        var file = outputFolder + '/'+ items[i];
	  			var filename = path.basename(file);
				var mimetype = mime.lookup(file);
		        fs.readFile(outputFolder + '/'+ items[i],function (err,data) {
		        	
					res.setHeader('Content-disposition', 'attachment; filename=' + filename);
					res.setHeader('Content-type', mimetype);

					var filestream = fs.createReadStream(file);
				  	filestream.pipe(res);
		        });
		    }
	    }
	});
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
