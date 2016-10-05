"""Retrieving 1000 tweets."""
# -*- coding: utf-8 -*-
import oauth2
import json
import config
import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
import logging
logging.basicConfig()
screen_name = "narendramodi"


def oauth_req(urls, http_method="GET", post_body="", http_headers=None):
    """Function for Authentication."""
    consumer = oauth2.Consumer(key=config.CONSUMER_KEY,
                               secret=config.CONSUMER_SECRET)
    token = oauth2.Token(key=config.key,
                         secret=config.secret)
    client = oauth2.Client(consumer, token)
    data = []
    for url in urls:
        resp, content = client.request(url, method=http_method, body=post_body,
                                       headers=http_headers)
        data.append(content)
    json_write_tweets_data(data)
    return content


def construct_url(screen_name):
    """Function to construct URL,given screen_name."""
    number_of_tweets = "200"
    urls = []
    for x in xrange(1, 6):
        urls.append('https://api.twitter.com/1.1/statuses/user_timeline.json?'
                    'screen_name=' + screen_name + '&count=' +
                    number_of_tweets + '&page=' + str(x))
    return urls


def json_write_tweets_data(content):
    """Function to write required tweet data into Json file."""
    count = 0
    # file_name = create_newfile()
    # open("avgfile.js", 'w').close()
    with open("avgfile.json", 'w') as f:
        for data_200 in content:
            tweets = json.loads(data_200[0:len(data_200)])
            for tweet in tweets:
                count += 1
                data = {}
                data['favorite_count'] = tweet['favorite_count']
                data['retweet_count'] = tweet['retweet_count']
                data['date-time'] = datetime.datetime.today().ctime()
                json.dump(data, f, indent=1)
    print count
    accessing_json()


def accessing_json():
    file = open('avgfile.json').read()
    file = file.replace('}{', '},{')
    list1 = '[%s]' % (file)
    loadfile = json.loads(list1)
    # print "json loaded"
    data = []
    retweet = []
    count = 0
    for f in loadfile:
        count += 1
        data.append(f['favorite_count'])
        retweet.append(f['retweet_count'])
    print sum(data) / count
    print sum(retweet) / count


def start_session():
    """Function to start session everyday."""
    home_timeline = oauth_req(construct_url(screen_name))
    return home_timeline


scheduler = BlockingScheduler()
scheduler.add_job(start_session, 'interval', hours=24)
scheduler.start()
# start_session()
