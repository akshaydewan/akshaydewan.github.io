---
layout: post
title: Playing Local Media on your TV in 2022
date: '2022-11-09 00:00:00'
tags:
- plex
- apple tv
- amazon basics tv
- streaming
- networking
---

Although I'm subscribed to 6 streaming services, there are TV shows that aren't available in India. I wanted to watch one such show, so I obtained it the old-fashioned way. Now my task was to somehow watch the media files on my TV.

I use an Apple TV 4k for my streaming needs. I also have a Plex Server running on my PC which has always worked beautifully. But lately, the TV had been having issues finding the Plex Server.

But surely, it's 2022 (almost 2023), and it should be easy to play local media on the TV now? (Nope!)

The media files I had were all 720p video with a mix of AC3 5.1 or Stereo sound. Not exactly large files, and not using new HDR codecs or any of that. 

So the first thing I tried was copying them onto a USB thumb drive and plugging it into my TV. (It's an AmazonBasics TV). I tried searching for the files on the TV's interface, but the drive didn't seem to be detected. I thought it might be because of the exFAT filesystem on the drive, so maybe I could reformat it to NTFS or old FAT. But I didn't investigate it further. I also have a PlayStation 5, so I decided to plug to USB drive into the PS5 and try that.

The PS5 did manage to detect and play the media files, but there was no audio. I double-checked the volume control, and did a quick 5-minute Google search to try and figure out what's wrong, but I didn't pursue further. I thought I could just copy the media files onto the Apple TV.

I remember reading somewhere that media files could just be dragged-dropped into the Apple TV app on a Mac and it should show up in the media library. Cool! Surely Apple won't fail me! So I pulled out my Macbook, plugged in the USB drive, and dragged a single media file into the Apple TV app. And...nothing! Tried again, and nothing.

Finally, I decided to go back to Plex. I had a hunch about the problem of the server not being detected. It started ever since I started using an Access Point to improve Wi-Fi coverage in my house. The PC was connecting to the Access Point instead of the main router since it was closer. A ping test confirmed that whatever devices were connected to the Access Point were somehow not reachable from other devices connected to the main router. 

```text

                 Main Router
                     │
                     │
                     │
                     │
          ┌──────────┴─────────┐
          │                    │
      Access Point         Apple TV
      TP Link RE305      (Plex Client)
          │
          │
          │
          │
      Windows PC
     (Plex Server)
```

Ok, back to Googling. I found a few leads about Firewalls and Client Isolation set on the AP, but they didn't pan out. Firewall was turned off and there was no Client Isolation setting on the TP Link Access Point. Another hint was DHCP. It was set to Auto on the Access Point, and all the devices appeared to be getting IPs from the main router. So I thought it was fine.

I was at a loss. I settled on turning off the Access Point when I wanted to use Plex. It would mean getting a lower Wi-Fi signal on the PC, but that was fine for the time being. The media files weren't high-res.

Today I started investigating the issue again. I tried setting the DHCP setting explicitly to Off instead of Auto on the Access Point, and that seemed to do the trick! Now the PC is reachable from devices connected to the main router, and Plex is working fine.

It's sad to see that even after all these years, there's no easy, user-friendly way to play local media on the TV. If you do want to do it, you'll have to plan for it and set up your system properly. Plex, Kodi, VLC are great options, but I still cannot expect anyone who's not a power-user to figure this stuff out.

We still have a long way to go to make software truly user-friendly.