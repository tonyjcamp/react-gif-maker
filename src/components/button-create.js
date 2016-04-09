import React, {PropTypes} from 'react'
import {render} from 'react-dom'
import fetch from 'isomorphic-fetch'

const ButtonCreate = React.createClass({

    displayName: 'Create Button',

    propTypes: {
        videoURL: PropTypes.string.isRequired
    },

    createGIF() {

        const {videoURL, inpoint, outpoint} = this.props
        const body  = {videoURL, inpoint, outpoint}

        // console.log('sending:', body)

        if(outpoint - inpoint > 6) {
          return alert('GIF Duration is too long!')
        }

        fetch('http://104.236.133.144:8081/gifs', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(function(response) {
            if (response.status >= 400) {
                throw new Error('Bad response from server', response.text())
            }
            return response.text();
        }).then(function(body) {
            document.querySelector('.final-image').innerHTML = body
        })
    },

    render() {
        const {createGIF} = this
        return <div>
            <button type="submit" className="btn btn-success button-create col-xs-12" onClick={createGIF}>Create Animated GIF</button>
            <div className="final-image"></div>
        </div>
    }

})

export default ButtonCreate
