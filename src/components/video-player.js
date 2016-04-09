import React, {PropTypes} from 'react'
import {render} from 'react-dom'

const VideoInput = React.createClass({

    displayName: 'Video Player',

    propTypes: {
        videoURL: PropTypes.string.isRequired
    },

    componentDidMount() {

        let timeout = false;
        let keyHeldDown = false;
        const $video = document.querySelector('.video-player')


        document.addEventListener('keydown', function(e) {
            var e = e || window.event;

            if (e.keyCode == 37) {
                $video.pause();

                if( !keyHeldDown ) {
                    // increment the video time by 1/30 of a second
                    $video.currentTime = $video.currentTime - .03;

                    if( !timeout ) {
                        timeout = setTimeout(function() {
                            keyHeldDown = true;
                        }, 1000);
                    }

                } else {
                    $video.currentTime = $video.currentTime - .25;
                }

                return false;

            } else if (e.keyCode == 39) {
                $video.pause();

                if( !keyHeldDown ) {
                    // increment the video time by 1/30 of a second
                    $video.currentTime = $video.currentTime + .03;

                    if( !timeout ) {
                        timeout = setTimeout(function() {
                            keyHeldDown = true;
                        }, 1000);
                    }

                } else {
                    $video.currentTime = $video.currentTime + .25;
                }

                return false;

            }
        })

        document.addEventListener('keyup', function(e) {

            var e = e || window.event;

            if (e.keyCode == 39 || e.keyCode == 37) {
                clearTimeout( timeout );
                keyHeldDown = false;
                timeout = false;
            }

            return false;

        })

    },
    render() {
        const {videoURL} = this.props
        return <div>
            <video className='video-player col-xs-8 col-xs-offset-2' style={videoStyle} src={videoURL} controls type='mp4/video' />
        </div>
    }

})

var videoStyle = {
    marginBottom: '20px',
    marginTop: '20px',
    padding: 0
}


export default VideoInput

