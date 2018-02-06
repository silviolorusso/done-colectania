#!/bin/sh

# --- convert single page pdf to printable booklet pdf

# get filename without extension
fullfilename=$1
fname="${fullfilename%.*}"

# get filepath 
filepath=$(dirname "$1")

pdftops -paper match $fname.pdf $fname.ps
psbook -s8 $fname.ps $fname-2.ps
psnup -2 -PA3 $fname-2.ps $fname-3.ps
ps2pdf $fname-3.ps $fname-booklet-temp.pdf
cp $fname-booklet-temp.pdf $fname-booklet.pdf # to be sure the pdf is actually ready
rm $filepath/*.ps $fname-booklet-temp.pdf