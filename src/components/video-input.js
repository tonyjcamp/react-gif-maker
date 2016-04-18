import React, {PropTypes} from 'react'
import {render} from 'react-dom'
import fetch from 'isomorphic-fetch'

const VideoInput = React.createClass({

    'displayName': 'VideoInput Bar',

    propTypes: {
        handleVideoChange: PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            'videoURL': this.props.videoURL
        }
    },

    handleChange(e) {
        this.setState({'videoURL': e.target.value})
    },

    fetchVideo() {

        const {videoURL} = this.state
        var that = this
        const body = {
            url: videoURL
        }

        fetch('http://104.236.133.144:8081/ytvideo',
        {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
        ).then(function(response) {
            if (response.status >= 400) {
                throw new Error('Bad response from server', response.text())
            }
            return response.text()
        }).then(function(body) {
            // document.querySelector('.final-image').innerHTML = body
            console.log('Success, body: ', body)

            that.props.handleVideoChange(body)
        })

        this.props.handleVideoChange(videoURL)
    },

    render() {
        const {fetchVideo, handleChange} = this
        const {videoURL, handleVideoChange} = this.props
        return <div className='input-group col-xs-8 col-xs-offset-2' style={videoInput}>
            <input className='form-control videoURL' type='url' value={this.state.videoURL} onChange={handleChange} />
            <span className='input-group-btn'>
                <input className='btn-fetch btn btn-info' type='submit' value='fetch' onClick={fetchVideo} />
            </span>
        </div>
    }

})

var videoInput = {
    marginTop: '40px'
}

export default VideoInput