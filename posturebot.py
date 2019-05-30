#!/usr/bin/env python

import tweepy
import time
import postureParser

consumer_key = "ZS276TyE8wXjxiMUXVdzf72wg"
consumer_token = "XfBzWu9akYCPTA3EXla2RP2co1grZ4GzwogLXtKHmxUh6osbAz"
access_token = "965746222169403392-XmHB5Pbd1Nsf0WaxBHFg85ZTn1YcxPe"
access_token_secret = "zcUTCiCnWlsAbrrX3XZqhmBkz19bMvLsuA36I9jglAPFP"

auth = tweepy.OAuthHandler(consumer_key, consumer_token)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth)

tweets = postureParser.posParse()

for text in tweets:
    try:
        api.update_status(text)
        time.sleep(900)
    except tweepy.error.TweepError as error:
        pass
