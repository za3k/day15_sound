Hack-A-Day is a project I'm doing in November, where I try to make 30 new projects, in 30 days.

# Day 15: Hack-A-Sound

This is a sound mixing toy.

Features:

- 25 pre-generated random samples
- Record you own samples with a mic
- Keyboard and mouse support. Mobile probably not supported.
- 4 tracks. Set delay and loop tracks separately

![Screenshot](screenshot.png)

Demo available [here](https://tilde.za3k.com/hackaday/sound).

Source available on [github](https://github.com/za3k/day15_sound).

# Credits

- Built-in and generated soundboard sounds due to [jsfxr](https://sfxr.me/) [[source](https://github.com/chr15m/jsfxr)].

# Wishlist

- Make all loops a fixed length, but have the length be adjustable still
- Have 'delay' update loops in realtime, and rename it to "offset" or something.
- Fix the samples with a PRNG or such, so they don't change on reload? But have a few presets. Add a preset for "random" and a few other options?
- Have samples that work well together (ex. piano) and a wider variety.
- Save and load (samples and tracks)
- Have sharing links
- Visual display of notes in each track, and combined line tracing through all of them.
- .wav download
