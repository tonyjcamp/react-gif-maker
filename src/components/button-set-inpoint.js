import React, {PropTypes} from 'react'
import {render} from 'react-dom'

const ButtonSetInpoint = React.createClass({

    // clicked, get the video currTime, store it on parent props

    displayName: 'Set Inpoint',

    propTypes: {
        handleSetCurrtime: PropTypes.func.isRequired,
        createPreviewImage: PropTypes.func.isRequired
    },

    setCurrtime() {
        const video = document.querySelector('.video-player')
        const currTime = video.currentTime
        const {handleSetCurrtime, createPreviewImage} = this.props

        video.pause()
        handleSetCurrtime(currTime, 'inpoint')
        createPreviewImage('inpoint')
    },

    render() {
        const {setCurrtime} = this
        return <div className="col-xs-6" style={buttonStyle}><button className="btn btn-info col-xs-12" type="button" onClick={setCurrtime}>Set Starting Point</button></div>
    }

})

var buttonStyle = {
    paddingLeft: 0
}

export default ButtonSetInpoint

