---
layout: post
title: Getting Endomondo to work with the Martian Notifier
date: '2015-06-20 09:27:12'
---

There is nothing quite as satisfying as wasting money on useless gadgets. One of my recent purchases was a dorky watch known as the [Martian Notifier](http://www.martianwatches.com/notifier/).

![Martian Notifier](/images/2015/06/martian.jpg)

This is a nifty little watch that shows notifications on a small ticker at the bottom of the watch face. It has good battery life - lasts about a week - and the watch battery is separate, which lasts for a couple of years. The best part about it is that it actually looks like a watch!

The watch is really quite simple - install an [app](https://play.google.com/store/apps/details?id=com.martianwatches.martianwatchnotifier) on your phone, select the notifications you want to receive, and the notifications will be pushed to your watch.

![Martian Notifier App](/images/2015/06/martian_notifier_app_google_play.jpg)

----

Now coming to Endomondo, the popular running app. Wouldn't it be nice if my watch would show me my current pace during my runs? Well, too bad! The Martian is compatible with few other running apps, but not Endomondo. But Endomondo does provide support for other devices like Pebble and a few others.

With a bit of APK decompilation, looking at Pebble's source code and a bunch of common sense, I could figure out how Endomondo talks to Pebble. It just uses an Android broadcast.


`Endomondo ---(Broadcast)---> Pebble App ---> Pebble Watch`


And well, I could listen to that broadcast!

`Endomondo ---(Broadcast)---> My App ---> Notification`

And so I wrote a nice little [Android app](https://github.com/akshaydewan/endo-martian) that listens to the broadcasts that Endomondo sends Pebble, and I convert it into a Notification. And it shows up on my watch! Woohoo!

Now time for some field testing.

I never realized that it's so difficult to look at the tiny text on your watch when you're running. I got a few strange readings with some extremely high/low pace values, but on an average, the values seemed to be matching Endomondo's logs.

The watch has a sensor that detects when you tap the watch face. You can tap the glass to dismiss alerts or show the last alert. Unfortunately, the sensor also gets triggered when your hands move while running. This turned out to be a major usability issue, along with the tiny text that's hard to read when you're running out of breath. Well, it's a good testament to the fact that your software never works the way you imagine when you release it into the real world.