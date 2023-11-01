---
layout: post
title: The State of Online Banking in India
date: '2023-11-01 00:00:00'
tags:
- banks
- retail-banking
- quality
---

At the start of this year, I decided to start keeping track of my expenses. My workflow involves downloading my bank statements every month, importing them into GNUCash and associating transactions to income/expense accounts. (At some point in the future, I might move to [plain-text accounting](https://plaintextaccounting.org/) instead of GNUCash for easier automation, but that's a story for another time.)

What I need is just my monthly statements in CSV format. And surprisingly (or unsurprisingly), our banks can't even manage to get this right. Here's my experience from last month, trying to download statements in CSV format from different banks. And I'm not even getting into the UX side of things, just the very basic functionality.

(All of this was done on the latest Firefox on MacOS, with my AdBlocker turned off and Enhanced Privacy turned off).

## Axis Bank
In the tab called "Last 10 transactions" I could clearly see 5-6 transactions done in the last month. But when I tried to download the detailed statement, it showed me "No transactions found for this time period". Great! I ended up manually entering transactions.

## HDFC Bank
It actually worked!

## ICICI Bank
For downloading the statement, I saw two options – CSV and PDF. The PDF option worked fine, but the CSV option just opened a window with a... blank PDF?! WTF? I ended up manually entering transactions.

## Kotak Bank
I could download the CSV, but noticed that one transaction from the end of the month was missing from the list. They seem to have some boundary condition bug. This feels worse than not being able to download the statement at all. Now I have a CSV, but I can't trust it.

## SBI
SBI is like a box of chocolates. You never know what you're gonna get! I clicked on a link in the sidebar and got thrown out back to the login page. Trying to login again, it told me that a session was already active. Great! I came back after 30 minutes and was able to login again and actually download the statement. Phew! But will it work next month? Who knows!


And there you have it! These are the institutions that we trust with our money and our life savings.
