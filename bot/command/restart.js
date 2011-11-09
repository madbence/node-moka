exports.command=
{
	name: 'restart',
	permission: 'restart',
	man:
	[
		'"%c"',
		'Restarts the bot'
	],
	func: function(params)
	{
		this.sendMessage('Restarting...');
		process.send({'restart': true});
		return true;
	}
}