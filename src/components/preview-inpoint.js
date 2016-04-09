import React from 'react'
import ReactDOM from 'react-dom'

const PreviewStartingPoint = React.createClass({

    displayName: 'Preview Starting Point',

    render() {
        console.log('Starting Point Preview Image rendered')

        return <div className='col-xs-6' style={removeLeftPadding} ><canvas className='inpoint-preview col-xs-12' style={removePadding} /></div>
    }

})

var removeLeftPadding = {
    paddingLeft: 0
}

var removePadding = {
    padding: 0
}

export default PreviewStartingPoint
