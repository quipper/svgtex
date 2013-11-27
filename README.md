svgtex
======

Using MathJax and PhantomJS to create SVGs on server side with minimum overhead.

MathJax is a great tool! Why not use it on a server side too?

To avoid loading whole phantomjs and MathJax into memory with every call the service is exposed via HTTP.

```
$ phantomjs main.js

loading bench page
server started on port 16000
you can post to the server at http://localhost:16000/
.. or by sending latex source in POST (not url encoded)
```

And then (in a different console).. curl it up!

For SVG:
```
$ curl localhost:16000/svg -d "<math><msup><mi>x</mi><mn>2</mn></msup></math>"

<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 1.34ex; height: 1.099ex; vertical-align: -0.124ex; margin-top: 1px; margin-right: 0px; margin-bottom: 1px; ...
```

For PNG: 
```
$ curl localhost:16000/png -d "<math><msup><mi>x</mi><mn>2</mn></msup></math>"

iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAR9JREFUOI3t07srx1EYx/HXzy383JKBSC4lkskmBovFQtiIUf4A...
```
CDN loading
-----------

Current implementation uses internet connection to load bench page (it loads the MathJax from CDN, only once, before server is started), this can be avoided by downloading mathjax into wokring dir and changing the index.html where it links with mathjax.

Stability
---------

experimental.

Read https://github.com/agrbin/svgtex/wiki for more details!

