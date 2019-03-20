module.exports = `<?xml version="1.0" encoding="UTF-8"?>
	<Response>
	<Say voice="woman">Hello! We need to book a table</Say>
	<Gather action="http://26f51af0.ngrok.io/api/twilio-book-response" input="dtmf speech" numDigits="1">
		<Say>Type 1 or 0</Say>
	</Gather>
</Response>`;
