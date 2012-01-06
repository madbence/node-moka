var http=require('http');
exports.commands=
[
	{
		'name': 'lf',
		func: function(params)
		{
			var that=this;
			var verbose=false;
			var user=params[params.length-1];
			for(var i=0;i<params.length;i++)
			{
				switch(params[i])
				{
					case '-v':
					case '--verbose': verbose=true; break;
				}
			}
			http.get(
			{
				host: 'ws.audioscrobbler.com',
				path: '/2.0/?method=user.getrecenttracks&user='+encodeURIComponent(user)+'&api_key=a146a63252f43adef8fe055ca0113863&format=JSON&limit=1',
				port: 80}, function(response)
				{
					if(response.statusCode)
					{
						content='';
						response.on('data', function(data)
						{
							content+=data.toString();
						});
						response.on('end', function()
						{
							try
							{
								content=JSON.parse(content);
							}
							catch(err)
							{
								console.log(err);
								console.log(content);
								return;
							}
							if(content.error)
							{
								if(verbose)
								{
									that.reply(content.message);
								}
								else
								{
									that.reply('Valami gond van, -v hogy tobbet megtudj!');
								}
							}
							else
							{
								if(!content.recenttracks.track)
								{
									that.reply('ugy nez ki '+user+' meg nem hallgatott semmit :o');
									return;
								}
								var track=content.recenttracks.track.length?content.recenttracks.track[0]:content.recenttracks.track;
								var artist=track.artist?track.artist['#text']:'Ismeretlen eloado';
								var trackName=track.name?track.name:'Ismeretlen szam';
								var album=track.album?track.album['#text']:false;
								var song=artist+' - '+trackName+(album?(' ('+album+')'):'');
								if(track['@attr']&&track['@attr'].nowplaying)
								{
									that.reply(params[1]+' epp ezt hallgatja: '+song);
								}
								else
								{
									if(track.date)
									{
										var date=track.date.uts;
										var diff=Math.floor(new Date().getTime()/1000)-date;
										var since=
											diff<60?'kevesebb, mint egy perce':
												diff<3600?(Math.floor(diff/60)+' perce'):
													diff<86400?(Math.floor(diff/3600)+' oraja'):
														diff<86400*30?(Math.floor(diff/86400)+' napja'):
															'tobb mint egy honapja';
										that.reply(user+' '+since+' ezt hallgatta: '+song);
									}
									else
									{
										that.reply(user+' ezt hallgatta valamikor: '+song);
									}
								}
							}
						});
					}
					else
					{
						console.log('Somting vent vrong.', response);
					}
			});
		}
	}
]