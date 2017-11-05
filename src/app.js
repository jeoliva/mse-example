'use strict';

const segments = [
    'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_0.m4v',
    'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_1.m4v',
    'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_2.m4v'
];

const player = document.getElementById('player');
const mediaSource = new MediaSource();
let sourceBuffer;

function open() {
    if (!window.MediaSource) {
        console.error('You are trying to use MSE in a browser that is not supporting it');
        return;
    }
    player.src = window.URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', onMediaSourceOpen);
}

function onMediaSourceOpen() {
    console.log(`onMediaSourceOpen - Loading initial segment ${segments[0]}`);
    sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.640015"');
    sourceBuffer.addEventListener('updateend', next);
    fetchSegment(segments[0], appendBuffer);

    player.play();
}

function appendBuffer(data) {
    if (data) {
        console.log(`Appending buffer - ${data.byteLength} bytes`);
        sourceBuffer.appendBuffer(new Uint8Array(data));
    }
}

function next() {
    segments.shift();
    if (segments.length > 0) {
        console.log(`Loading segment ${segments[0]}`);
        fetchSegment(segments[0], appendBuffer);
    } else {
        console.log(`All segments loaded. End`);
        sourceBuffer.removeEventListener('updateend', next);
    }
}

function fetchSegment(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        console.log(`Downloaded segment ${url}. Status ${xhr.status}`);
        if (xhr.status != 200) {
            console.error(`Error ${xhr.status} while fetching the segment ${url}`);
            return false;
        }
        callback(xhr.response);
    };
    xhr.send();
}

// Start loading the stream!
open();