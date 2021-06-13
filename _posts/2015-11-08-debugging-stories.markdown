---
layout: post
title: Debugging stories
date: '2015-11-08 13:19:54'
---

When you've been programming long enough, you'll have some interesting stories to tell - about bugs that confounded you, crazy clients who didn't know what they wanted, or mad managers who wanted everything delivered yesterday.

Looking back, I can think of three fascinating bugs I've encountered. You encounter your typical timing-issues or framework idiosyncrasies every now and then, which can be quite hard to understand and fix. But these three bugs are a different species altogether.

## Out of disk space
It appeared that one of our servers couldn't process any requests because it had run out of disk space. (At least that's what the web server logs said). It seemed strange, because we didn't have that much data on the server. Doing a `df -h` showed several gigabytes of free space remaining.

It was odd, but what was odder was the database we had in place. It generated a file for each record that it created. As a result, we ended up with a very large number of small files on the system.

As it tuns out, we had hit the [maximum number of files](https://en.wikipedia.org/wiki/Inode) that the filesystem would allow us to create! Running a `df -i` confirmed that we had run out of inodes. The obvious solution was to move to a better data storage mechanism. Alas, in that company, we never took the obvious solution. But that's the subject of another blog post ;)

## The mystery of the disappearing card
We were working on an online poker game, which used virtual currency. I am thankful that we were using virtual money, considering the number of bugs we had in that piece-of-crap of a program.

So one day, the client complained that a card would disappear randomly in the game. For a long time, we couldn't replicate the issue - until it finally happened on a developer machine. It seemed completely random, and we couldn't narrow it down to a particular scenario.

Of course, to solve a bug, you first have to reproduce it. So one of the devs sat on his machine all day, playing poker while inspecting the network requests/responses and logs. He got to a point where he figured out that it was only the Ace of Diamonds that would disappear.

What was so special about the Ace of Diamonds that made it disappear? The network logs showed that the server was serving the response correctly. How the heck did it disappear? Clearly, the problem was not on the server. Even so, we decided to walk through the code again, debug it line-by-line just to ensure that the correct response was being served.

A couple of other people tried to replicate the issue. We found that it happened only on some of the boxes. Trying to narrow it down further, we tried different browsers. And that's when we realized what was happening.

The Ace of Diamonds had an image file which was named `ad.png`. The AdBlock browser extension decided that this was an advertisement and blocked the image.

To solve the problem, we simply renamed the file.

## The slow Sudoku
Remember when Sudoku had become crazy popular around 8-10 years ago? I was in college at the time, and decided to build a Sudoku program for my project.

I built it in C++ using Qt for the GUI. I also came up with a rather crazy algorithm that used three-dimensional arrays instead of two-dimensional ones. (The third dimension was the model the small 3x3 minigrid).

Well, adding that extra complexity also added a lot of computational overhead, making my program very slow. Or so I thought.

After the program was complete, it took about 5-10 seconds to solve a puzzle on my home PC. But when I deployed it on the PC in my college, it took less than a second to solve it!

Now that didn't make any sense. My home PC was much faster - it was a Pentium-4 with 1.6GHz, whereas my college PC was only a Pentium-3 800MHz. I also had more RAM and a better graphics card. It just didn't make sense. This had to be solved!

Digging further, I started looking at log files and dmesg output on my home PC. I saw a strange message popping up whenever I ran my program: "CPU running in modulated clock mode". I searched online for what it meant - apparently, my CPU was running too hot and the kernel was throttling the speed to keep it cool.

I popped open my cabinet and saw that my CPU fan wasn't working. I replaced it, and my Sudoku became fast again!