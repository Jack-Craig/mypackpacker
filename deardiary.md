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

Ended up making the choice that MID and UPCs will be tracked for products, but since a product can have multiple different universalIds for its different variants, a product will have multiple universalIds. This comes in the form of a list of MPNs and UPCs that I have no idea how to query efficiently. It might make sense to have a one-to-many collection, with the id of the product and the MID/UPC right there.

### July 10, 2021
Today's Alexa Rank: 3840596. Woo a 1282 decrease!

I need to find a way to decrease my Alexa score faster.

In other news the new REI scraper has done well, it's added/updated 2217 products with universalIds, making the total number of products 3291 with maybe 1 or 2 hundred more to come. Some problems that it has risen:
1. There are some things that do fit in a category but do NOT fit well in a category filter, I think there were some good examples in stoves.
1. Some of the photos are weird and are the last one, rather than the first one displayed. I think I can fix this with a quick .first() call or something.
1. Some of the data isn't real, it will record some weights as 0 and stuff like that. I can add a validator but I have to make sure it's not too strict. In the meantime, I'll delete them by hand.

I now want to work on adding better GID lookup (using the one-to-many) and then add FlexOffers links. After that, I can work on making FlexOffers web scrapers. After that, I need to automate the whole process to happen multiple times a day. Scraping an entire website is pretty time consuming so maybe I'll have a circular queue with URLs and only wakes up once an hour, does 20 minutes of work, then sleeps. The problem with that is it absorbs dyno time, maybe I should run it from a home machine.

I'm running google ads to try and get some traffic but it's not effective. I'm getting clicks but I don't think I'm getting much retention. I might pause the campaign but I don't know what I would do in the meantime. I guess make scrapers so the data is A+, and then add all the other features. The problem is I've been adding features for months, shouldn't there be users by now? I'm going to keep it running and work on the FlexOffers stuff. Who knows, maybe a cookie will get me a dollar to pay for 1 ad (haha).

I cannot believe this, I am such a dummy. I'm going to start making manual back-ups of the DB because I just deleted the entire products collection on accident. I meant to drop the UIDs but apparently you spell "uids" a lot like "products". The loss isn't big, I don't have any active users or shared community packs that aren't from someone I know, but still how irresponsible was that. The admin panel is going to tell a funny story thats for sure. I'm not going to unshare the empty community packs, I'm going to leave them broken and if they want they can fix them.

### July 11, 2021
Today's Alexa Rank: 3838042. Woo a 2554 decrease!

Lighterpack.com's Alexa Rank is 285246, which I think shows the minimum of the maximum range in popularity MyPackPacker can reach. BoardGameAtlas, however, is at 185482 which I think is a much better medium-end goal. I know the community is a large aspect of BGA, so I wonder how Trent was able to convince people to do their community stuff on his website, rather than reddit or some other forum. I think the advanced forum components that he build in are huge for that, like mentioning a board game with #"board game name". I could work something in if I did that for product reviews and added a pack-trip logger thing for trail reports. 


### July 12, 2021
TAR: 3834794. Woo! a 3248 decrease

I stopped running google ads and it dropped like a rock. Hmmm. I had an idea for a more specific version of product reviews where you ask the reviewer something much more specific than "Review this product". Something that open ended is tough to come up with and you only really know what to say if you really loved it or really hated it. I like structured review systems that ask for pros and cons, I think something like that but like "What did you learn about this gear item / tips and tricks" and it adds more experience and skill to the gear item. Then you can filter through the reviews to only show the pros, only the cons, or only the tips. 

Somehow the pack filters script and the gear relative stats compiler havn't been running in months which is absolutely wild I really need a better admin panel. Someone on reddit said the site feels like a regular e-commerce site and they're 100% right the site is just mediocre data with run-of-the-mill stats that's kind of cool but gets old fast. He suggested more personalized/gear list specific features like suggesting socks if you have shoes or something like that. I think the site needs a lot more connectivity, like BoardGameAtlas does so well, I just have to figure out what that is. In the meantime I'll keep adding data feeds and make the core as good as possible then go back to the user experience jaunt.

I finished linking up the FlexOffers links to the products I scraped from REI which looks super cool, you can buy products from more than just REI now! Also the site is technically monetized! I felt like when I got to this point it would feel good but I feel no different than before, I still have stuff to work on and it's nowhere near done. A nice step in the right direction though, that's for sure. I'm probably going to spend the next few days working on automating the scraping so accurate and up-to-date information flows in on the regular. Now it'll actually be worth having multiple sources, for tracking prices and stuff. I'm going to turn google ads back on and see what happens.

### July 13, 2021
TAR: 3833644. Woo! a 1150 decrease

I started google ads again yesterday evening and got about 15 clicks in that time.

Today I'm going to figure out the scraping protocol for multiple sources and do some logging to figure out how effective it actually is.

Ok I got my IP blocked from REI for a seamingly infinite period of time so that's a bit of a hurdle. I guess the focus now is to add a crawl delay to the script, try and refactor it as much as possible, and run it once a day from the AWS server. I wonder if that will get blocked? REI.com has no mention of a crawl delay in their robots.txt and, while there was no hard limit, my delay was around half a second. I think the major issue was all the requests coming in at once. Maybe I should email them? I'll see if it's temporary then try and figure some jaunt out. 

I'll finish that, though it sucks because I can't exactly test it, then look into my other sources and building scrapers for them. I need to figure out which of my advertisers actually want me to sell products, as far as I can tell it's only Moosejaw and Mountain Hardwear, everyone else either has a completely different inventory or only puts promotions on the API.

I wouldn't be lying if I said I was getting a bit overwhelmed with the complexity of this whole thing. By this whole thing I mean the web scraper network and getting accurate and consistent data. I guess I'll write it all out here and hope writing it in a list helps straighten it all out.

#### Problems
1. How to make sure the spread is enough? Like how do I ensure I am getting every single tent out there?
1. How to create a common language between scrapers? Like Moosejaw calls boot sizing something different than REI, but I need to figure out what is the same about that. 
1. What if one site has really great data and another site has really poor data, do I have to reduce the quality of the site to account for a wider reach?
1. 
#### Solutions
1. I guess there really isn't a way to do this other than time and people alerting me to missing gear. Really sucks but it is what it is.
1. Create a funnel/script that all finished products go through that translates from their site-specific dialect to mine. That works well because I can also reduce a lot of the annoying items, like how many different fuel types there are and REI's confusing ankle support language. 
1. I think quality is much better than quantity. Every layer that get's added on to the data-pipeline reduces the throughput by some percentage, but I have to think of that as a good thing and that the blocked data was data I didn't want. 
1.
I was thinking about this REI business and now I'm stressed they are going to sue me for using their images and data, but where does it say anywhere that I cannot? I think they won't because last night both the website and images on my website were blocked, but tonight only I am blocked and the images load just fine. Oops, that's wrong and I'm a dummy. The cache was active on my desktop and not my laptop, I'm just banned. Back to being stressed :/. I'll put my email on the site so they can say something before they kill me. I looked into sending them an email but I can't find the email because their /help dir is blocked (obviously I can still use my phone or a VPN).