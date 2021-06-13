---
layout: post
title: One neat trick to avoid sending patches
date: '2017-08-09 03:01:03'
---

Imagine you have a couple of local commits, and you’re going on leave tomorrow. You can’t push the code, because the build just turned red. What do you? E-mail patches to your pair? Push on a branch?

But there’s another alternative.

Git is a distributed version control system, but we hardly ever make use of the “distributed” nature of Git. You can share code with your pair directly. There is a package called [git-daemon](https://git-scm.com/docs/git-daemon) which comes bundled with Git. Here’s how you can use it:

Go to the directory one level above your repository and run:
```
git daemon --base-path=. --informative-errors --verbose --export-all
```
This will serve all git repositories in the current directory. Your pair can then pull code from you directly. E.g. `git pull --rebase git://10.0.2.2/my-repo`

One thing to keep in mind though: **Git daemon does not have any authentication**. DO NOT use this when connected to insecure networks. As long as you’re on a closed, secure LAN, you should be fine. And terminate the daemon as soon as you’re done.

Here’s a small script that will also print out your IP so that you can share it easily:
```
#!/bin/bash
echo "git pull --rebase git://`ipconfig getifaddr en0`/`basename $PWD` `git symbolic-ref --short HEAD`"
git daemon --base-path=.. --informative-errors --verbose --export-all
```
(The script is MacOS specific. You may have to change it to make it work for you).

You can save this script with the name git-serve (or something similar) and add it to your path. Then you can just run `git serve` from your working copy.

Hope this helps. And don’t blame me if you end up with messy conflicts :)

Do you know of any neat tricks for Git? Leave a comment!