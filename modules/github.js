var https=require('https');
var template=require('../template.js').replaceString;
var util=require('../util.js');

var githubAPI=
{
	_apiCall: function(path, clb)
	{
		https.get(
		{
			'host': 'api.github.com',
			'path': path
		}, function(res)
		{
			this.remaining=res.headers['x-ratelimit-remaining'];
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
	getUser: function(name, clb)
	{
		this._apiCall('/users/'+name, clb);
	},
	getRepos: function(name, clb)
	{
		this._apiCall('/users/'+name+'/repos?per_page=100', clb);
	},
	getFollowers: function(name, clb)
	{
		this._apiCall('/users/'+name+'/followers', clb);
	},
	getFollowings: function(name, clb)
	{
		this._apiCall('/users/'+name+'/following', clb);
	},
	getRepo: function(user, repo, clb)
	{
		this._apiCall('/repos/'+user+'/'+repo, clb);
	}
}

var templates=
{
	'user': ':user:fullname: :repos public repo, :followers koveto, :following kovetett, :gists gist.',
	'repos': ':user public repoi: :repos',
	'repos_': ':name(:lang,:ownership)',
	'repo': ':name(:lang, owner: :owner, letrehozva: :created, frissitve: :lastupdate, :forks fork, :watchers watcher): :description'
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
									if(!reposArray[Math.floor(i/15)])
									{
										reposArray[Math.floor(i/15)]=[];
									}
									reposArray[Math.floor(i/15)][i%15]=template(templates['repos_'],
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
									'repos': reposArray[0].join(', ')+(reposArray.length>1?' ...':'')
								}));
								for(var i=1;i<reposArray.length;i++)
								{
									that.say('... '+reposArray[i].join(', ')+(i+1<reposArray.length?' ...':''));
								}
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
					githubAPI.getFollowers(userName, function(followers)
					{
						var followersList=[];
						for(var i=0;i<followers.length;i++)
						{
							followersList.push(followers[i]['login']);
						}
						that.reply(userName+' kovetoi ('+followersList.length+'): '+followersList.join(', '));
					});
				}
				else if(params.length == 4 && params[2] == 'followings')
				{
					var userName=util.escape(params[3]);
					githubAPI.getFollowings(userName, function(followings)
					{
						var followingsList=[];
						for(var i=0;i<followings.length;i++)
						{
							followingsList.push(followings[i]['login']);
						}
						that.reply(userName+' oket koveti ('+followingsList.length+'): '+followingsList.join(', '));
					});
				}
				else
				{
					var userName=util.escape(params[2]);
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
									'fullname': user['name']?('('+user['name']+')'):'',
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
		'regexp': /http(|s):\/\/(|www\.)github\.com\/([^\/]+)\/([a-zA-z0-9-_]+)/,
		'func': function(match)
		{
			var userName=util.escape(match[3]);
			var repoName=util.escape(match[4]);
			var that=this;
			githubAPI.getRepo(userName, repoName, function(repo)
			{
				if(repo['message'] == 'Not Found')
				{
					//that.reply('Nincs \''+userName+'\' juzer :c');
					console.log(userName, repoName);
				}
				else
				{
					that.reply(template(templates['repo'], 
					{
						'name': repo['name'],
						'lang': repo['language'],
						'owner': repo['owner']['login'],
						'created': util.dateFormatter(util.parseDate(repo['created_at']), '%Y.%m.%d %H:%i:%s'),
						'lastupdate': util.dateFormatter(util.parseDate(repo['updated_at']), '%Y.%m.%d %H:%i:%s'),
						'forks': repo['forks'],
						'watchers': repo['watchers'],
						'description': repo['description'].length>50?(repo['description'].substr(0, 50)+'...'):repo['description']
					}));
				}
			});
		}
	},
	{
		'regexp': /http(|s):\/\/(|www\.)github\.com\/([a-zA-z0-9-_]+)/,
		'func': function(match)
		{
			var userName=util.escape(match[3]);
			var that=this;
			githubAPI.getUser(userName, function(user)
			{
				if(user['message'] == 'Not Found')
				{
					//that.reply('Nincs \''+userName+'\' juzer :c');
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