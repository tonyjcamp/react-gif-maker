import React, {PropTypes} from 'react'
import {render} from 'react-dom'

const ButtonSetOutpoint = React.createClass({

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
        handleSetCurrtime(currTime, 'outpoint')
        createPreviewImage('outpoint')
    },

    render() {
        const {setCurrtime} = this

        // console.log(document.querySelector('.btn-container'), ' element')


        // if( !this.props.inpoint ) {
        //     el.style.display = 'none'
        // } else {
        //     el.style.display = ''
        // }


        return <div className='col-xs-6' style={buttonStyle}><button type='button' onClick={setCurrtime} className='btn btn-info btn-end col-xs-12'>Set Ending Point</button></div>
    }

})

var buttonStyle = {
    paddingRight: 0
}

export default ButtonSetOutpoint

