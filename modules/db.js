var mongo=require('../../npm/node_modules/mongodb');
var db=new mongo.Db('moka', new mongo.Server('127.0.0.1', 27017, {}));
var client=
{
	init: function()
	{
		db.open(this.open);
	},
	open: function(err, pconn)
	{
		if(!err)
		console.log('Connected to MongoDB!');
		else
		console.log('Connection error: ', err);
	},
	find: function(coll, terms, clb, errclb)
	{
		clb=typeof clb == 'function'?clb:function(){};
		errclb=typeof errclb == 'function'?errclb:function(){};
		db.collection(coll, function(err, coll)
		{
			if(err)
			{
				errclb(err);
				return;
			}
			coll.find(terms, function(err, cur)
			{
				if(err)
				{
					errclb(err);
					return;
				}
				cur.toArray(function(err, arr)
				{
					if(err)
					{
						errclb(err);
						return;
					}
					clb(arr);
				});
			});
		});
	},
	insert: function(coll, obj, clb, errclb)
	{
		clb=typeof clb == 'function'?clb:function(){};
		errclb=typeof errclb == 'function'?errclb:function(){};
		db.collection(coll, function(err, coll)
		{
			if(err)
			{
				errclb(err);
				return;
			}
			coll.insert(obj, {safe:true}, function(err, docs)
			{
				if(err)
				{
					errclb(err);
					return;
				}
				clb(docs);
			});
		});
	},
	update: function(coll, crit, newObj, clb, errclb)
	{
		clb=typeof clb == 'function'?clb:function(){};
		errclb=typeof errclb == 'function'?errclb:function(){};
		db.collection(coll, function(err, coll)
		{
			if(err)
			{
				errclb(err);
				return;
			}
			coll.update(crit, newObj, {safe:true}, function(err, succ)
			{
				if(err)
				{
					errclb(err);
					return;
				}
				else
				{
					clb(succ);
				}
			});
		});
	}
}

exports.client=client;

exports.onInit=function()
{
	console.log('Connecting to MongoDB');
	client.init();
}