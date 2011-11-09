exports.command=
{
	name: 'uptime',
	man:
	[
		'"%c", megmondja miota fut a bot',
	],
	func: function(params)
	{
		var ut=process.uptime();
		utString=
			Math.floor(ut/3600/24)+':'+
			(((ut/3600)%3600)<10?'0':'')+Math.floor((ut/3600)%3600)+':'+
			(((ut/60)%60)<10?'0':'')+Math.floor((ut/60)%60)+':'+
			((ut%60)<10?'0':'')+Math.floor(ut%60);
		this.sendMessage('uptime: '+utString);
		return true;
	}
}