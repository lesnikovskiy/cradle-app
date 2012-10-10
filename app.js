var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var cradle = require('cradle');
var util = require('util');

// listen on port 8000
http.createServer(function(req, res) {	
	var pathname = url.parse(req.url).pathname;
	console.log(util.inspect(req.url));
	
	if (pathname === '/' || pathname === '/home') {
		fs.readFile('./index.html', function(err, data) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data);
		});	
	}
	
	if (pathname === '/addgadget' && req.method === 'POST') {
		var data = '';
		req.on('data', function(chunk) {
			data += chunk;
		});
		
		req.on('end', function() {
			var postData = querystring.parse(data);
			
			var db = new(cradle.Connection)('http://localhost', 5984, {
				auth: {
					username: 'lesnikovskiy',
					password: 'test'
				}
			}).database('gadgets');
			
			var items = querystring.parse(req);
			
			db.save({
				name: postData.name,
				company: postData.company
			}, function(err, response) {
				if (err)
					console.log(util.inspect(err));
				if (response) {
					console.log(util.inspect(response));
					var jsonResponse = JSON.stringify(response);
					
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end(jsonResponse);
				}
			});
		});	
	}

	if (pathname === '/createview' && req.method === 'POST') {
		var db = new(cradle.Connection)('http://localhost', 5984, {
			auth: {
				username: 'lesnikovskiy',
				password: 'test'
			}
		}).database('gadgets');
		
		db.save('_design/all_gadgets', {
			all: {
				map: function(doc) {
					if (doc.name && doc.company) {
						emit (doc.name, {id: doc._id, rev: doc._rev, name: doc.name, company: doc.company});
					}
				}
			}
		}, function(err, response) {
			if (err)
				console.log(util.inspect(err));
			if (response) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(response));
			}
		});		
	}
	
	if (pathname === '/all_gadgets' && req.method === 'POST') {
		var db = new(cradle.Connection)('http://localhost', 5984, {
			auth: {
				username: 'lesnikovskiy',
				password: 'test'
			}
		}).database('gadgets');
		
		db.view('all_gadgets/all', function(err, response) {
			if (err)
				console.log(util.inspect(err));
			if (response) {			
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(response));
			}
		});
	}
	
	if (pathname === '/getitem' && req.method === 'POST') {
		var data = '';
		req.on('data', function(chunk) {
			data += chunk;
		});
		req.on('end', function() {
			var postData = querystring.parse(data);
		
			var db = new(cradle.Connection)('http://localhost', 5984, {
				auth: {
					username: 'lesnikovskiy',
					password: 'test'
				}
			}).database('gadgets');
			
			db.get(postData.id, function(err, doc) {
				if(err) 
					console.log(util.inspect(err));
					
				if (doc) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end(JSON.stringify(doc));
				}
			});
		});
	}
	
	if (pathname === '/update' && req.method === 'POST') {
		var data = '';
		req.on('data', function(chunk) {
			data += chunk;
		});
		
		req.on('end', function() {
			var postData = querystring.parse(data);
			var db = new(cradle.Connection)('http://localhost', 5984, {
				auth: {
					username: 'lesnikovskiy',
					password: 'test'
				}
			}).database('gadgets');
			
			db.save(postData._id, {
				name: postData.name,
				company: postData.company,
				_id: postData._id,
				_rev: postData._rev
			}, function(err, doc) {
				if (err)
					console.log(util.inspect(err));
					
				if (doc) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end(JSON.stringify(doc));
				}
			});
		});
	}
}).listen(8000);