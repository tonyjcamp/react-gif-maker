import React, {PropTypes} from 'react'
import {render} from 'react-dom'
import fetch from 'isomorphic-fetch'

const ButtonCreate = React.createClass({

    displayName: 'Create Button',

    propTypes: {
        videoURL: PropTypes.string.isRequired
    },

    disableCreateButton() {
      const createGIFButton = document.querySelector('.button-create')
      const loadingIcon = document.createElement('span')

      loadingIcon.className = 'glyphicon glyphicon-cog icon-loading-animate'
      createGIFButton.className = 'btn btn-success button-create col-xs-12 disabled'
      createGIFButton.innerHTML = 'Creating GIF, We Be Giffn  '

      createGIFButton.appendChild(loadingIcon)

      return createGIFButton
    },

    createGIF() {
        const {videoURL, inpoint, outpoint} = this.props
        const body  = {videoURL, inpoint, outpoint}
        const finishedImageContainer = document.querySelector('.finished-image-container')
        const finishedImage = document.querySelector('.finished-image')
        const createGIFButton = this.disableCreateButton()

        finishedImage.innerHTML = ''

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
            console.log(response)
            return response.text();
        }).then(function(body) {
            createGIFButton.className = 'btn btn-success button-create col-xs-12'
            createGIFButton.innerHTML = 'Create Another GIF'

            finishedImageContainer.style.display = 'block'
            finishedImage.innerHTML = body
        })
    },

    render() {
        const {createGIF} = this
        return <div>
            <button type="submit" className="btn btn-success button-create col-xs-12" onClick={createGIF}>Create Animated GIF</button>
        </div>
    }

})

export default ButtonCreate
