import React from 'react'
import ReactDOM from 'react-dom'

import VideoInput from '../components/video-input'
import VideoPlayer from '../components/video-player'
import ButtonSetInpoint from '../components/button-set-inpoint'
import ButtonSetOutpoint from '../components/button-set-outpoint'
import PreviewStartingPoint from '../components/preview-inpoint'
import PreviewEndPoint from '../components/preview-outpoint'
import ButtonCreate from '../components/button-create'
import FinishedImage from '../components/finished-image.js'

require('../css/loading-button.css')

const App = React.createClass({

    displayName: 'App',

    getInitialState() {
        return {
            'videoURL': 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
            'inpoint': 0,
            'outpoint': 0
        }
    },

    handleVideoChange(videoURL) {
        this.setState({ videoURL }, function() {
            console.log(this.state.videoURL, ' videoURL state has been set')
        })
    },

    handleSetCurrtime(time, point) {
        this.setState({ [point]: time }, function() {
            console.log(this.state[point], point = ' state has been set')
        })
    },

    createPreviewImage(point) {
        const canvas = document.querySelector('.' + point + '-preview')
        const context = canvas.getContext('2d')
        const video = document.querySelector('.video-player')

        // Calculate the ratio of the video's width to height
        const ratio = video.videoWidth / video.videoHeight
        // Define the required width as 200 pixels smaller than the actual video's width
        const w = video.videoWidth - 200
        // Calculate the height based on the video's width and the ratio
        const h = parseInt(w / ratio, 10)

        // Set the canvas width and height to the values just calculated
        canvas.width = w
        canvas.height = h

        // Define the size of the rectangle that will be filled (basically the entire element)
        context.fillRect(0, 0, w, h)
        // Grab the image from the video
        context.drawImage(video, 0, 0, w, h)

    },

    render() {
      const {handleVideoChange, handleSetCurrtime, createPreviewImage} = this
      const {videoURL, inpoint, outpoint} = this.state

        return <div>
            <VideoInput videoURL={videoURL} handleVideoChange={handleVideoChange} />
            <VideoPlayer videoURL={videoURL} />

            <div className='btn-container col-xs-8 col-xs-offset-2 clearfix' style={removePadding}>
                <ButtonSetInpoint handleSetCurrtime={handleSetCurrtime} createPreviewImage={createPreviewImage} />
                <ButtonSetOutpoint handleSetCurrtime={handleSetCurrtime} createPreviewImage={createPreviewImage} inpoint={inpoint}/>
            </div>

            <div className='clearfix col-xs-8 col-xs-offset-2' style={previewImages}>
                <PreviewStartingPoint />
                <PreviewEndPoint inpoint={inpoint} />
            </div>

            <div className='col-xs-8 col-xs-offset-2' style={removePadding}>
                <ButtonCreate videoURL={videoURL} inpoint={inpoint} outpoint={outpoint} />
            </div>

            <FinishedImage />
        </div>
    }

})

var removePadding = {
    padding: 0
}

var previewImages = {
    marginTop: '20px',
    marginBottom: '20px',
    padding: 0
}
export default App