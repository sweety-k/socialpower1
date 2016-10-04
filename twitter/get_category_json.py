"""TO get category of each tweet."""
import pickle
import json
import sys
from datetime import datetime
handle = sys.argv[1]
date = datetime.today().strftime('%m_%d_%Y').replace(" ", "_")


def read_file():
    """Function to read 1000 tweet file."""
    with open(handle + '/' + date + '.json') as json_data:
        d = json.load(json_data)
        minister_thousand = d[0:1000]
    get_category(minister_thousand)


def get_category(minister_thousand):
    """Function to get category of tweets."""
    cl = pickle.load(open("pmo-category-engine.p", "U"))
    category = []
    for tweet in minister_thousand:
        text = tweet['text'].lower()
        prob_dist = cl.prob_classify(text)
        tweet['category'] = prob_dist.max()
        category.append(tweet)
    with open(handle + '/' + date + '_results.json', 'w') as f:
        json.dump(category, f, indent=1)
        f.close()


if __name__ == "__main__":
    """Main function."""
    read_file()
    pass
