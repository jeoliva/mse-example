'use strict';

const segments = [{
        url: 'https://login.plasticpictures.tv/stream/cb521ce80da6efb888f1efdc831ec0e0dd55bd6a/240p.webm',
        range: '0-262'

    }, {
        url: 'https://login.plasticpictures.tv/stream/cb521ce80da6efb888f1efdc831ec0e0dd55bd6a/240p.webm',
        range: '263-502098'
    }, {
        url: 'https://login.plasticpictures.tv/stream/1813f78d489c4c77b0597221218b54bae9475417/720p.webm',
        range: '0-263'
    }, {
        url: 'https://login.plasticpictures.tv/stream/1813f78d489c4c77b0597221218b54bae9475417/720p.webm',
        range: '1937111-3753617'
    }
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
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"');
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

function fetchSegment(request, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', request.url);
    xhr.responseType = 'arraybuffer';
    if (request.range) {
        xhr.setRequestHeader('Range', 'bytes=' + request.range);
    }
    xhr.onload = function () {
        console.log(`Downloaded segment ${request.url}. Status ${xhr.status}`);
        if (xhr.status < 200 || xhr.status > 299) {
            console.error(`Error ${xhr.status} while fetching the segment ${request.url}`);
            return false;
        }
        callback(xhr.response);
    };
    xhr.send();
}

// Start loading the stream!
open();