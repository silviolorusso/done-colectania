### done-colectania

## Premise: Digital Publishing is Easy

Publishing, both for print and screen, is easy. And there are many ways to do it. Consider this very Google Doc, it took me a few seconds to create. Adding text and images, formatting it and exporting it as a PDF or as a document accessible online is not rocket science. Craig Mod evocates the speed and ease of contemporary publishing very lucidly when he speaks of mass indie:  

Mass Indie is the zine publishing of web publishing. The everyperson indie. Godaddy a domain, snag a Tumblr, fiddle a DNS and Go Go Go. Don’t have eight bucks? Skip the domain and jump straight to Go Go Go. It’s right there and it’s faster than a Xerox at Kinkos. Don’t like Tumblr? Ghost it up. Livejournal’s still a thing. Wattpad welcomes all. Geo-plaster at hi.co. Kindle Single it and give it away. Toss it on Scribd. Pastebin the notion. Splatter your post across twenty tweets. Heck, Google Doc it. The Web Is Here For You To Use. Post to multiple platforms. Pledge allegiance to no one. You don’t owe ’em nuttin’. Everybody Minecraft — stake your claim. Then restake it again tomorrow. The land’s wide open and there’s always more IPv6 to go around.

## Goal: Make Digital Publishing Challenging Again

Why making another publishing tool that mimics the functions of the already simple and effective tools available? We have already plenty of  generalist tools and workflows, and they work just fine.

So, why not making publishing challenging by defining some obstacles, limitations, etc that need to be overcome by the publisher/user? What if publishing had obstacles? What if some friction in the publishing process make the publication more rewarding? What if we apply the IKEA principle to publishing?

### Features

- purely image zine, set the textual context and title at the beginning
- Add a bit of time each time you add asset
- pages as bonus?
- combo?
- unlock achievements (in the publication itself)
- cinema-like badges
- voting
- critic

### PDF Generation Resources

- https://wkhtmltopdf.org/
- https://evanbrooks.info/bindery/
- https://github.com/eKoopmans/html2pdf
- https://jsreport.net/learn/phantom-pdf
- http://diethardsteiner.github.io/reporting/2015/02/17/CSS-for-print.html
- take a screenshot, cut it in pieces and make the pdf out of it

## Running P/P Locally

1) `git clone https://github.com/silviolorusso/done-colectania.git`
2) `cd done-colectania`
3) `mongod`
4) `gulp`
5) `npm start or [nodemon](https://nodemon.io/)`


### Code examples

## Critic
the user name should correspond directly to the filename in `assets/img/critic/*.jpg`
`criticSays(message, user);`
like
`criticSays('dance dance', 'cat');`
or
`criticSays('dance dance');`
or
`criticSays();`

## Alert
`alertMessage('The file you dropped is not allowed!')`

## Achievement animation + badges
`achievement(time, message);`
like
`achievement(200, 'Your mom bought 12 copies');`

## Timecounter Animation

`animatetimecounter(bonusTime)`
like
`animatetimecounter(200)`

## Countdown
turn on countdown on pageload/ready with this function:
`countdownWrapper()`
