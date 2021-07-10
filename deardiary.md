# Notes / Journal
### July 7, 2021
I made 2 reddit posts on the 5th and got lots of feedback from them, including technical tips, recommendations for vendors, affiliate sites to use, and feature requests. I'll write them here so I don't forget them.
#### Feature Requests / Bug Reports
1. Fix the favicon on dark backgrounds
1. Session PreferredUOM, set it in a small settings box
#### Vendor Recs
1. REI - maps and guidebooks
1. EE
1. Zpacks
1. Hyper light
1. Als.com
1. Backcountry.com
1. Backcountrygear.com
1. Bass Pro Shop
1. Cabelas
1. Campmor.com
1. Campsaver.com
1. The Clumb
1. Dicks Sporting Goods
1. Eastern Mountain Sports
1. EnWild.com
1. Evo.com
1. Marmot.com
1. Moosejaw.com
1. Outdoor Gear Exchange
1. Sportsman's Warehouse
1. SunnySports.com
#### Affiliate Recs
1. Activejunky.com
1. Topcashback
1. befrugal
1. *Other cashback sites - what is a cashback site

I looked into what a cashback site is and I don't think it would mesh well with MyPackPacker, mostly because there is no product API. They are an affiliate program than gives the user a large portion of the affiliate share, so they certainly won't have an affiliate program of their own (if they did it would be like 1/8th of a percent or something).

It's a cool a concept that I would still like to show to my users, but I can't work it in right now.

Someone gave me a huge list of vendor recomendations, and also made a post with a ton of detail about them. I'll be able to add some of this info to the extra sourcing info when it comes out.

### July 8, 2021
Today's Alexa rank: 3844223 (https://smallseotools.com/alexa-rank-checker/)

I got approved by FlexOffers and a ton of vendors, including MooseJaw! WOOOO! This is hype. I'm working on a scheme to find out if 2 products are the same, which will look something like

p1.manufacturer === p2.manufacturer && p1.mId == p2.mId

This is great because I can get accurate price info for multiple different websites. I am running into several problems, however, like inconsistencies and lack gear stats that lead me to believe I might have to do that by hand. I'm waiting to see if I get into AvantLink to make a decision because I think their API is better. I don't think my Alexa rank is high enough to get accepted, so I'll have to increase that. If I get denied I'll have to decide if my focus should be on increasing Alexa rank or on writing web scrapers and an admin tool for adding all of the new vendors FlexOffers has opened up to me.

### July 9, 2021
Today's Alexa rank: 3841878 (https://smallseotools.com/alexa-rank-checker/). Wooo! a 2600 decrease!

Today is also a great day because I might have found a way to get global identifiers for REI products during the webscrape phase. I spent a couple hours making a cool CL script that would go through the REI products, find the 5 closest matches FlexOffers products, and then have me pick which one was right. It ended up being super slow because the FlexOffers API can be pretty slow, but it helped me realize how I could find the REI global ids. Time to figure out how to add this to the web scraper.

Ended up making the choice that MID and UPCs will be tracked for products, but since a product can have multiple different universalIds for its different variants, a product will 