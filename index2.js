const request = require('request-promise');
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')

const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

server.listen(port, () => {
	console.log(`Server started on Port ${port}!`)
})

// to read input from terminal
//const stdin = process.openStdin();

const suggestions = require('./suggestions.json');

const getIntent = (inputChatMessage) => {
	const payload = {
		q: inputChatMessage
	};

	return new Promise((resolve, reject) => {
		request({
			method: 'post',
			uri: 'http://localhost:5000/parse',
			body: payload,
			json: true // Automatically stringifies the body to JSON
		}).then((response) => {
			if (response.intent) {
				resolve(response.intent.name);
			} else {
				reject('Error occured');
			}
		}).catch((err) => {
			console.log('============================================');
			console.log('Error: ', err);
			console.log('============================================');
			reject('Error occured');
		});
	});
}

// min, max both inclusive
const getRandomInt = ((min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
});

const getSuggestion = (intent, number) => {
	const suggestionsArrayLength = suggestions[intent][number].length;
	const randomIndex = getRandomInt(0, suggestionsArrayLength - 1);
	return suggestions[intent][number][randomIndex];
}

const getSuggestionsArray = (intent) => {
	const suggestionsArray = [];
	suggestionsArray.push(getSuggestion(intent, 'first'));
	suggestionsArray.push(getSuggestion(intent, 'second'));
	suggestionsArray.push(getSuggestion(intent, 'third'));
	return suggestionsArray;
}

console.log('Enter a chat message to get suggestions.');
console.log('First message will take time (around 15s)');

app.post('/getSuggestions', (req, res) => {	
	const enteredSentence = req.body.input;

	getIntent(enteredSentence).then((intent) => {
		//console.log(getSuggestionsArray(intent));
		let data=getSuggestionsArray(intent);
		console.log(data);
		console.log('------------------------');
		console.log();
		res.send(data);
	}).catch((e) => {
		console.log(e);
	});
})