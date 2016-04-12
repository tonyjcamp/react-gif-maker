import React, {PropTypes} from 'react'
import {render} from 'react-dom'
import fetch from 'isomorphic-fetch'

import FinalImage from './final-image.js'
require('../css/loading-button.css')

const ButtonCreate = React.createClass({

    displayName: 'Create Button',

    propTypes: {
        videoURL: PropTypes.string.isRequired
    },

    disableCreateButton() {
      const createButton = document.querySelector('.button-create')
      const loadingIcon = document.createElement('span')

      loadingIcon.className = 'glyphicon glyphicon-cog icon-loading-animate'
      createButton.className = 'btn btn-success button-create col-xs-12 disabled'
      createButton.innerHTML = 'Creating GIF, We Be Giffn  '
      createButton.appendChild(loadingIcon)

      return createButton
    },

    createGIF() {
        const {videoURL, inpoint, outpoint} = this.props
        const body  = {videoURL, inpoint, outpoint}
        const finalImage = document.querySelector('.final-image')
        const createButton = this.disableCreateButton()

        finalImage.innerHTML = ''

        if(outpoint - inpoint < 0) {
          return alert('Your outpoint must come after your inpoint')
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
            createButton.className = 'btn btn-success button-create col-xs-12'
            createButton.innerHTML = 'Create Another GIF'

            finalImage.innerHTML = body
        })
    },

    render() {
        const {createGIF} = this
        return <div>
            <button type="submit" className="btn btn-success button-create col-xs-12" onClick={createGIF}>Create Animated GIF</button>
            <FinishedImage />
        </div>
    }

})

export default ButtonCreate
