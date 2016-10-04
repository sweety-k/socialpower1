"""Retrieving 1000 tweets."""
# -*- coding: utf-8 -*-
import oauth2
import json
import retrieve_config
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
import io
import logging
import os
import sys
logging.basicConfig()
screen_name = sys.argv[1]


def oauth_req(urls, http_method="GET", post_body="", http_headers=None):
    """Function for Authentication."""
    consumer = oauth2.Consumer(key=retrieve_config.CONSUMER_KEY,
                               secret=retrieve_config.CONSUMER_SECRET)
    token = oauth2.Token(key=retrieve_config.ACCESS_TOKEN,
                         secret=retrieve_config.ACCESS_TOKEN_SECRET)
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
    all_data = []
    file_name = create_newfile()
    for data_200 in content:
        tweets = json.loads(data_200[0:len(data_200)])
        for tweet in tweets:
            count += 1
            data = {}
            data['text'] = tweet['text']
            data['favorite_count'] = tweet['favorite_count']
            data['retweet_count'] = tweet['retweet_count']
            data['created_at'] = tweet['created_at']
            data['id'] = tweet['id']
            data['source'] = tweet['source']
            all_data.append(data)
    file_name = create_newfile()
    with open(file_name, 'w') as f:
        json.dump(all_data, f, indent=1)
    f.close()


def create_newfile():
    """Function to create new file based on time."""
    newpath = r'' + screen_name
    if not os.path.exists(newpath):
        os.makedirs(newpath)
    date = datetime.today().strftime('%m_%d_%Y').replace(" ", "_")
    file_name = newpath + '/' + date + ".json"
    with io.FileIO(file_name, "w") as file:
        file.write("Json")
        file.close()
    return file_name


def start_session():
    """Function to start session everyday."""
    home_timeline = oauth_req(construct_url(screen_name))
    return home_timeline

if __name__ == "__main__":
    """Main function."""
    scheduler = BlockingScheduler()
    scheduler.add_job(start_session, 'interval', seconds=1)
    scheduler.start()
    os.system("python get_category_json.py " + screen_name)
    pass
