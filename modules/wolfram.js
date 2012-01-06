var fs=require('fs');
var http=require('http');

exports.commands=
[
	{
		name: 'wolfram',
		aliases: ['w'],
		func: function(params)
		{
			var req=params.slice(1).join(' ');
			var that=this;
			http.get({
				host: 'www.wolframalpha.com',
				path: '/input/instantmath.jsp?i='+encodeURIComponent(req),
				port: 80},
				function(resp)
				{
					if(resp.statusCode == 200)
					{
						var content=false;
						resp.on('data', function(c)
						{
							content=true;
							that.reply(req+' = '+c.toString().match(/<\/span>(.*?)$/)[1]);
						});
						resp.on('end', function()
						{
							if(!content)
							{
								/*
								http.get({
								host: 'api.wolframalpha.com',
								path: '/v2/query?input='+encodeURIComponent(req)+'&appid=GHQ44X-E8LHK3A5JE',
								port: 80},
								function(resp)
								{
									if(resp.statusCode == 200)
									{
										resp.on('data', function(c)
										{
											console.log(c);
											console.log(c.toString());
										});
									}
								});*/
								http.get({
								host: 'www.wolframalpha.com',
								path: '/input/?i='+encodeURIComponent(req),
								port: 80},
								function(resp)
								{
									if(resp.statusCode == 200)
									{
										resp.on('data', function(c)
										{
											res=c.toString().match(/id="i_0100_1" alt="(.*?)"/);
											//that.log(c.toString());
											if(res)
											{
												content=true;
												that.reply(req+' = '+res[1]);
											}
										});
									}
								});
							}
						});
					}
					else
					{
						that.log(resp);
					}
				});
		}
	}
]