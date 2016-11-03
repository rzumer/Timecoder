# Timecoder
A simple interface made to generate MKV Timecodes v1 files for variable frame rate (VFR) encoding.

* Enter the base video frame rate, and the alternate frame rate for the segments to be processed
* Enter start and end frame numbers for each segment to be processed into an alternate frame rate
* Generate the timecodes file, process and encode the file (e.g. with x264 using the `--tcfile-in "[timecodes_path]"` parameter)

Timecoder easily runs locally in any modern Web browser with Javascript enabled. It is also hosted [online](http://cyprienne.me/timecoder/).
