#!/usr/bin/python
# -*- coding: utf-8 -*-
import oauth2
import json
import config
from apscheduler.schedulers.blocking import BlockingScheduler
import datetime


def oauth_req(http_method="GET",
              post_body="", http_headers=None):
    url = ('https://api.twitter.com/1.1/users/'
           'lookup.json?screen_name=narendramodi')
    # data1 = []
    # today = datetime.datetime.today()
    consumer = oauth2.Consumer(key=config.CONSUMER_KEY,
                               secret=config.CONSUMER_SECRET)
    token = oauth2.Token(key=config.key, secret=config.secret)
    client = oauth2.Client(consumer, token)
    resp, content = client.request(
        url, method=http_method, body=post_body, headers=http_headers)
    data = []
    data.append(content)
    with open("twitterdata.json", 'a') as f:
        for data_200 in data:
            info = json.loads(data_200[0:len(data_200)])
            for d in info:
                # count += 1
                print d["followers_count"]
                data1 = {}
                data1["followers_count"] = d["followers_count"]
                data1["statuses_count"] = d["statuses_count"]
                data1["profile_image_url_https"] = d["profile_image_url_https"]
                data1["date-time"] = datetime.datetime.today().ctime()
                json.dump(data1, f, indent=1)


def accessing_json():
    file = open('twitterdata.json').read()
    file = file.replace('}{', '},{')
    list1 = '[%s]' % (file)
    loadfile = json.loads(list1)
    print "json loaded"
    data = []
    tweet = []
    count = 0
    for f in loadfile:
        count += 1
        data.append(f['followers_count'])
        tweet.append(f['statuses_count'])
    print sum(data) / count
    print sum(tweet) / count


scheduler = BlockingScheduler()
scheduler.add_job(oauth_req, 'interval', hours=1)
# scheduler.add_job(followers_tweet_count, 'interval', hours=24)
scheduler.start()
