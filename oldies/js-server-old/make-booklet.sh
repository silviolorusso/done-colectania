#!/bin/sh

# --- convert single page pdf to printable booklet pdf (thanks OSP)

# get filename without extension
fullfilename=$1
fname="${fullfilename%.*}"

# get filepath 
filepath=$(dirname "$1")

pdftops -paper match $fname.pdf $fname.ps
psbook -s8 $fname.ps $fname-2.ps
psnup -2 -d -w337 -h476 -s0.7 $fname-2.ps $fname-3.ps # fix these measures
ps2pdf $fname-3.ps $fname-booklet-temp.pdf
cp $fname-booklet-temp.pdf $fname-booklet.pdf # to be sure the pdf is actually ready


# -w337 -h476 
