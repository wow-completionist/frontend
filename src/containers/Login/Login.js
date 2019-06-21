import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Login extends Component {
  dismissModal = () => {
    const { toggle } = this.props;
    toggle();
  }

  render() {
    const { showModal } = this.props;
    return (
      <div
        onClick={this.dismissModal}
        className={`modal fade WelcomeModal ${showModal ? 'show' : ''}`}
        style={{ display: `${showModal ? 'block' : 'none'}`, }}
        id="WelcomeModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <div className="camera-box">
                <h5 className="modal-title" id="exampleModalLabel">Battle.net Login</h5>
              </div>
            </div>
            <div className="modal-body">
              This will be the iframe or equivalent.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  showModal: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default Login;
