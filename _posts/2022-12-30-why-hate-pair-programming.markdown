---
layout: post
title: Why I hate Pair Programming
date: '2022-12-30 00:00:00'
tags:
- pair-programming
- pairing
- xp
---

> Disclaimer: This post is about why **I** hate pair programming. It's not about why **you should** hate it. If you like pair programming, by all means, go ahead with it.

In a previous company I worked for, [Pair Programming](https://en.wikipedia.org/wiki/Pair_programming) was the default way of working. The concept was new to me, and although I was apprehensive at first, I gave it a fair chance. I tried it for almost 4 years before I decided that it sucked and I no longer wanted work that way.

So let me get right to it.

## Physical discomfort
The company gave an extra monitor and keyboard/mouse to each pair. But everyone used this setup differently (eg. mirrored display vs. non-mirrored). Because of my tendency for neck pain and weak eyesight, I need to use good/large fonts, good contrast, large line spacing, and a good deal of personal space to look at the monitor without craning my neck. Most people were empathetic and understood this. But during the course of pairing, as people discuss code and point things on the monitor, I found that I was pushed to the side and craning my neck to look at the monitor. So I had to reset my position every hour or so, (or in some cases, every few minutes).

In a remote setup, this kind of physical discomfort is avoided, but it comes with its own set of problems. Screens lag, fonts appear worse and in general it is very difficult to coordinate with a pair. (I will elaborate on this later in the "Impossible to read code" section)

## Noisy environments & Constant interruption
When everyone is pairing in an office, it gets noisy. Very noisy. There are people who naturally have a loud voice, and you will hear them ALL. THE. TIME. I prefer working in quiet environments. I find it much easier to concentrate. (I think this is true for most people, whether they realize it or not).

Software development is a collaborative endeavour. There needs to be a constant flow of information between Product Owners, Quality Analysts, Developers and basically everyone involved. I agree with this. But when Kent Beck wrote about Extreme Programming, I doubt if he pictured a shouting match happening between a Developer and a BA 10 feet away. (Believe me, this was a common occurrence).

Looking back, I think a pair could not focus for 30 minutes without getting interrupted by noise or being pulled into a discussion.

## No scope for deep thought
_Thinking_ is an important part of programming. Coming up with good abstractions, evaluating whether you need a new framework, thinking about whether you're solving the right problem, etc. The list is endless.

In my experience, pair programming created a feeling of haste in programming. All you want to do is bang out code from your keyboard. If you want to think about a problem more deeply, you will start sensing a feeling of restlessness from your pair after a few minutes. At this point, you might say that you need to communicate your thoughts with your pair. Well, good luck communicating half-formed thoughts and ideas.

Proponents of pair programming will tell you that pairing will prevent you from going down rabbit holes and wasting time on unnecessary experiments. But sometimes, rabbit holes and experiments are exactly what is needed. When I observed the tech leaders and high performers in my company to find out how they addressed this, I found that they were actually working outside office hours. They would either be working late, working at home, or coming in early to try out things by themselves.

As for me, I never had the energy left for learning and experimentation after 8+ hours of pairing.

## No scope for learning
Let's say you're working on a project that uses a framework that's new to you. The way I like to learn is by diving right in. This means there'll be periods of struggle, reading documentation and asking for feedback. But if your pair is already familiar with the framework, chances are, you'll just have to learn by observing your pair. Because of this, I never ended up learning new frameworks properly and never developed the proper confidence. Pairs almost never have the patience to watch you struggle and make mistakes while coding.

I think this created a big setback for my career. I worked on projects with Android, iOS, Python, JavaScript, Kubernetes & various cloud technologies, but I never got good enough in them to list them in my résumé.

The only time you can learn is outside working hours or weekends. This is fine as long as you energy left, which I didn't.

## Impossible to read code
Reading code is very different from reading prose. Code is not linear. We constantly have to bounce back and forth between functions and classes while we create a map of understanding in our heads. This process is very personal, depending on our familiarity with the codebase and our familiarity with what design patterns and frameworks are used.

In most pairing sessions, there is a need to pull away from our pair to build our own understanding of the code. This is especially true when reading unfamiliar code, and hunting down issues and bugs. The best way to do this IMO, is for one person to step back while the other takes the reins. This requires a good pairing dynamic — patience, communication and sometimes just splitting up and going at it alone for a while. Unfortunately, in my 4 years of pairing, I found only a handful of people whom I had a "good dynamic" with. Mostly, I found people to be impatient when I needed time absorb and internalize parts of the code. (And a few were downright jerks).

In remote pairing, navigating code even under normal circumstances is a big pain. Suddenly your pair is in a different file, and you're left wondering wtf just happened. There are no body language cues to figure out what your pair is doing and if they need more time on something. Taking control of the keyboard/mouse is also harder, depending on the tool being used. I found that people just started browsing code in their own IDE instead of looking at the shared screen.      

## Exhausting
Pair Programming is an extrovert's game. While the company said that we don't need to pair for 8 hours a day, in practice, developers paired for the whole day (sometimes more than 8 hours). Usually I was able to pair only for a couple of hours at most before needing a long break. Again, the noisy office environment and getting pulled into multiple discussions meant that I couldn't recharge even after taking a break.

So for the rest of the day, I would just not be a good pair, and not be a good developer. I became irritable and would sometimes snap at people. I wish I were more self-aware at the time, so I would have quit sooner. But I wanted to believe the company propaganda — Pair Programming is the best way of working. 

## Saying no
When I finally had enough, I decided to say no to pairing. I did not quit the company initially, I was told that I would be given the flexibility to work in my own way. But in reality, I encountered a lot of resistence from other teammates. This company had a way of gaslighting people (which is probably why I stuck around as long as I did). On one hand, they were all "Yes, we value your needs. We respect your opinions", and on the other hand I faced passive-aggressive bullying from teammates. Since I was not pairing, I was given specific tasks which didn't need pairing (meaning, relatively unimportant tasks). One time, a bigshot from the US had came down to India. The first thing he said to me was not a hello or hi, but "You're not pairing?". Basically, not pairing was an anomaly and I became a cultural misfit in the company. A few leaders still tried to help me out and offered different projects. But ultimately, this was one of the main reasons I quit.

## Conclusion
I think Pair Programming made me a worse developer and affected by career negatively. It does have a few benefits, but for me, the cons outweighed the pros by several orders of magnitude. I was always tired and I could never put in the time or energy for learning and experimentation. When I quit the company, after many months, I slowly found my energy and passion return.

Never again.