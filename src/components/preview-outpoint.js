import React from 'react'
import ReactDOM from 'react-dom'

const PreviewEndPoint = React.createClass({

    displayName: 'Preview Starting Point',

    render() {
        console.log('Ending Point Preview Image rendered')

        return <div className='col-xs-6' style={removeRightPadding}><canvas className='outpoint-preview col-xs-12' style={removePadding}/></div>
    }

})

var removeRightPadding = {
    paddingRight: 0
}

var removePadding = {
    padding: 0
}

export default PreviewEndPoint

