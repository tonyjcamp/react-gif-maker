import React, {PropTypes} from 'react'
import {render} from 'react-dom'

require('../css/finished-image.css')

const FinishedImage = React.createClass({

  displayName: 'Finished Image',

  closeModal() {
    const finishedImageContainer = document.querySelector('.finished-image-container')
    const finishedImage = document.querySelector('.finished-image')
    finishedImage.innerHTML = ''
    finishedImageContainer.style.display = 'none'
  },

  render() {
    const {closeModal} = this
    return <div className="finished-image-container">
      <div className="finished-image-modal">
        <span className="close" onClick={closeModal}>x</span>
        <div className="finished-image thumbnail" />
      </div>
    </div>
  }

})

export default FinishedImage