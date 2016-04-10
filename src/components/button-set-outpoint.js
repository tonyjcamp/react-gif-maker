import React, {PropTypes} from 'react'
import {render} from 'react-dom'

const ButtonSetOutpoint = React.createClass({

    // clicked, get the video currTime, store it on parent props

    displayName: 'Set Inpoint',

    propTypes: {
        handleSetCurrtime: PropTypes.func.isRequired,
        createPreviewImage: PropTypes.func.isRequired,
        inpoint: PropTypes.number.isRequired
    },

    checkDuration() {
      const video = document.querySelector('.video-player')
      const currTime = video.currentTime
      const {inpoint} = this.props

      if(currTime - inpoint > 6) {
        return alert('GIF Duration is too long! Duration must be less than 6 seconds')
      }

      if(currTime - inpoint <= 0) {
        return alert('Your outpoint must come after your inpoint')
      }
      
      this.setCurrtime(video, currTime)
    },

    setCurrtime(video, currTime) {
        const {handleSetCurrtime, createPreviewImage} = this.props

        video.pause()
        handleSetCurrtime(currTime, 'outpoint')
        createPreviewImage('outpoint')
    },

    render() {
        const {checkDuration} = this

        return <div className='col-xs-6' style={buttonStyle}><button type='button' onClick={checkDuration} className='btn btn-info btn-end col-xs-12'>Set Ending Point</button></div>
    }

})

var buttonStyle = {
    paddingRight: 0
}

export default ButtonSetOutpoint

