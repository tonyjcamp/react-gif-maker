import React, {PropTypes} from 'react'
import {render} from 'react-dom'

require('../css/finished-image.css')

const FinishedImage = React.createClass({

  displayName: 'Finished Image',
  
  copyToClipboard() {
    const copyTextarea = document.querySelector('#GIFURL')
    const copyButton = document.querySelector('.button-copy')
    copyTextarea.select();
    try {
      var successful = document.execCommand('copy');
      if (successful) {
        copyButton.innerHTML = 'Copied...'
        setTimeout(function () {
          copyButton.innerHTML = 'Copy To Clipboard'
        }, 2000)
      }
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  },

  closeModal() {
    const finishedImageContainer = document.querySelector('.finished-image-container')
    const finishedImage = document.querySelector('.finished-image')
    finishedImage.innerHTML = ''
    finishedImageContainer.style.display = 'none'
  },

  render() {
    const {closeModal} = this
    const {copyToClipboard} = this
    return <div className="finished-image-container">
      <div className="finished-image-modal">
        <span className="close" onClick={closeModal}>x</span>
        <div className="thumbnail">
          <div className="finished-image" />
          <div className="copy-clipboard clearfix">
              <span className="btn btn-success button-copy col-xs-12" onClick={copyToClipboard}>Copy To Clipboard</span>
          </div>
        </div>
      </div>
    </div>
  }

})

export default FinishedImage