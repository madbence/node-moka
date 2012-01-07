var https=require('https');
var template=require('../template.js').replaceString;
var util=require('../util.js');

var githubAPI=
{
	getUser: function(name, clb)
	{
		https.get(
		{
			'host': 'api.github.com',
			'path': '/users/'+name
		}, function(res)
		{
			var responseData='';
			res.on('data', function(data)
			{
				responseData+=data;
			});
			res.on('end', function()
			{
				clb(JSON.parse(responseData));
			});
		});
	},
	getRepos: function(name, clb)
	{
		https.get(
		{
			'host': 'api.github.com',
			'path': '/users/'+name+'/repos'
		}, function(res)
		{
			var responseData='';
			res.on('data', function(data)
			{
				responseData+=data;
			});
			res.on('end', function()
			{
				clb(JSON.parse(responseData));
			});
		});
	}
}

var templates=
{
	'user': ':user:fullname: :repos public repo, :followers koveto, :following kovetett, :gists gist.',
	'repos': ':user public repoi: :repos',
	'repos_': ':name(:lang,:ownership)'
}

exports.commands=
[
	{
		name: 'github',
		func: function(params)
		{
			var that=this;
			if(params[1] == 'u' || params[1] == 'user')
			{
				if(params.length>3 && params[2] == 'r' || params[2] == 'repos')
				{
					var userName=util.escape(params[3]);
					var repoName=util.escape(params[4]?params[4]:'');
					if(!repoName.length)
					{
						githubAPI.getRepos(userName, function(repos)
						{
							try
							{
								if(repos['message'] == 'Not Found')
								{
									that.reply('Nincs \''+userName+'\' juzer :c');
									return;
								}
								var reposArray=[];
								for(var i=0;i<repos.length;i++)
								{
									if(!reposArray[Math.floor(i/10)])
									{
										reposArray[Math.floor(i/10)]=[];
									}
									reposArray[Math.floor(i/10)][i%10]=template(templates['repos_'],
									{
										'name': repos[i]['name'],
										'lang': repos[i]['language']?repos[i]['language']:'ismeretlen',
										'ownership': repos[i]['owner']['login']==userName?'o':'m',
										'fork': repos[i]['fork']?'f':'nf',
										'forks': repos[i]['forks'],
										'watchers': repos[i]['watchers'],
									});
								}
								that.reply(template(templates['repos'],
								{
									'user': userName,
									'repos': reposArray[0].join(', ')
								}));
							}
							catch(e)
							{
								that.reply(e);
							}
						});
					}
				}
				else if(params.length == 4 && params[2] == 'followers')
				{
					var userName=util.escape(params[3]);
				}
				else if(params.length == 4 && params[2] == 'following')
				{
					var userName=util.escape(params[3]);
				}
				/*
				
			switch(params[1])
			{
				case 'u':
				case 'user':
					var userName=util.escape(params[2])
					if(!userName.length)
					{
						return;
					}
					githubAPI.getUser(userName, function(user)
					{
						try
						{
							if(user['message'] == 'Not Found')
							{
								that.reply('Nincs \''+userName+'\' juzer :c');
							}
							else
							{
								that.reply(template(templates['user'], 
								{
									'user': userName,
									'repos': user['public_repos'],
									'followers': user['followers'],
									'following': user['following'],
									'gists': user['public_gists']
								}));
							}
						}
						catch(e)
						{
							//that.reply(e);
						}
					});
					break;
				default:
					//this.reply('Nem ertem :(');
			}*/
			}
		}
	},
];

exports.listeners=
[
	{
		'regexp': /^http(|s):\/\/(|www\.)github\.com\/([^\/]+)$/,
		'func': function(match)
		{
			var userName=util.escape(match[3]);
			var that=this;
			githubAPI.getUser(userName, function(user)
			{
				if(user['message'] == 'Not Found')
				{
					that.reply('Nincs \''+userName+'\' juzer :c');
				}
				else
				{
					that.reply(template(templates['user'], 
					{
						'user': userName,
						'fullname': user['name']?('('+user['name']+')'):'',
						'repos': user['public_repos'],
						'followers': user['followers'],
						'following': user['following'],
						'gists': user['public_gists']
					}));
				}
			});
		}
	},
];