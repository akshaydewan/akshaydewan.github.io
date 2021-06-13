---
layout: post
title: Ship of Theseus
date: '2015-07-05 11:29:16'
---

> As the planks of Theseus' ship needed repair, it was replaced part by part, up to a point where not a single part from the original ship remained in it anymore. Is it, then, still the same ship?

> If all the discarded parts were used to build another ship, which of the two, if either, is the real Ship of Theseus?

This paradox brings forth the question of how we define objects, their purpose, and the effect of time.

![ship](/images/2015/07/USS_Boston_-1799-_small.jpg)

The resolution of this paradox largely depends on how you define the Ship of Theseus. If such a ship really existed, you would probably say that the ship was *upgraded*, and that the older parts were *recycled* to create a new ship. The upgraded ship would remain the true Ship of Theseus.

For the sake of argument, if the ship were purely defined as the collection of its planks, it would stop being the Ship of Theseus the moment its first plank was replaced. But that is not how we define objects. Most things (or even people) are defined by:

* The material they are made up of
* The configuration or arrangement of this material
* The process that brought about the creation of the thing
* The purpose of the thing

Clearly, it is not enough for an object to "stop becoming" itself unless one or more of these parameters changes beyond a particular threshold. And there is no universal constant that defines this threshold. Another important factor is the passage of time. Even if all the parameters that define an object change significantly, if this change happens over a long period of time, you could still end up with the same object. The lifecycle of a caterpillar or butterfly is an interesting topic to think about in this context, as is the evolution of complex life forms (such as ourselves) from unicellular microbes. [We are star-stuff](https://youtu.be/iE9dEAx5Sgw), aren't we?

## Theseus 2.0

You have a team of ship-builders, who are given a legacy ship called Theseus. Theseus works quite well, but it hasn't been able to keep up with the times. Now-a-days, ships have better storm-resistance, improved controls for navigation and can carry a lot more cargo. Your job is to upgrade this ship to satisfy these modern requirements.

As you're working on the Navigation Subsystem, the code baffles you and you have no idea how this ship even works in the real ocean. You annotate the source code to see if the commit messages make any sense about why that if-condition was added in the rudder subroutine.

Over a period of months, after you annotate the code of the Navigation Subsystem, you find that all lines of code have been written by your team. None of the legacy authors show up in the list. But you never set out to re-write this code, only to upgrade it part-by-part. Looking at the commit history, you see that every change has been small. And yet, over a period of months, none of the old code remains.

Who, then, is the author of the code? While you have touched all lines of the module, you also managed to capture the intent of the original authors, like that weird if-condition. Of course, you refactored it and came up with a better design. But it was the original author that told you the if-condition was needed. Otherwise, your ship would've sunk.

This is an interesting problem for Wikis and collaborating forums like [StackOverflow](http://meta.stackexchange.com/a/11741) where ownership of a post can change over time, depending on the edits. Has the intent of the post changed, or only its formatting corrected?

Your code is the Ship of Theseus.