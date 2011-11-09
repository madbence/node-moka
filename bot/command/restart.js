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
		this.sendPM('Restarting...');
		setTimeout(function(){ process.send({'restart': true}); }, 1000);
		return true;
	}
}