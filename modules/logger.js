var client=require('./db.js');

var loggerAPI=
{
	collection: 'messagelog',
	logMessage: function(user, channel, message)
	{
		client.insert(this.collection, 
		{
			'user': user,
			'channel': channel,
			'message': message,
			'date': new Date().getTime()
		}, function(){}, function(e){console.log(e);});
	}
}

exports.listeners=
[
	{
		'catch': 'messages',
		'func': function()
		{
			if(this.isChannel())
			{
				loggerAPI.logMessage(this.getUser(), this.getChannel(), this.getMessage());
			}
		}
	},
];