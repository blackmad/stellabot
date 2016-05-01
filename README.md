# stellabot

## tech
The scripts are written in javascript, rendering onto an html5 canvas. The interactive visualizations use a canvas rendered in the browser, while the twitter bots use nodejs to write out a flattened version to a file and then upload to twitter. A cron job posts them to twitter every N hours.

## "algorithms"
*Jasper's Dilemma* - draw a trapezoid, rotate, draw a trapezoid, shorten the width by line width, repeat. At the end fill it in with two little triangles. The only randomness in this one for now is picking a random color ordering - which is why the colors are terrible.

*Benjamin Moore Series* - The algos to draw each square is pretty straightforward. There's a lot of randomness here - random color, random number of lines, random positive to negative space ratio. I found these somewhat repetitive after a while, so ~1 out of every 10 "glitches" by adding random jitter to the line calculations.

## interactive visualizations
reload for new renders

http://blackmad.github.io/stellabot/benjamin_moore.html

http://blackmad.github.io/stellabot/jaspers_dilemma.html

## TODO
### Jasper's Dilemma
- pick attractive color ordering
- randomize line size / ratios
- use more available space
