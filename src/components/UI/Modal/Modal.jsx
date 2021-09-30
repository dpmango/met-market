import React, { useState, useContext } from 'react';
import { observer } from 'mobx-react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import cns from 'classnames';

import { UiStoreContext } from '@store/UiStore';
import { SvgIcon } from '@ui';

import styles from './Modal.module.scss';
import styles2 from './Modal.scss';

const sharedStyles = {
  content: {
    position: 'absolute',
    background: 'white',
    borderRadius: '16px',
    padding: 0,
    overflowY: 'auto',
    maxHeight: 'calc(100% - 16px)',
  },
  overlay: {
    zIndex: 99,
    // background: 'rgba(0,0,0, 0.5)',
  },
};

const mainStyles = {
  content: {
    width: 'calc(100% - 16px)',
    maxWidth: '922px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    margin: '0px auto',
  },
};

const narrowStyles = {
  content: {
    width: 'calc(100% - 16px)',
    maxWidth: '560px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    margin: '0px auto',
  },
};

Modal.setAppElement('#root');

const Variants = {
  MAIN: 'main',
  NARROW: 'narrow',
};

const VariantStyles = {
  [Variants.MAIN]: mainStyles,
  [Variants.NARROW]: narrowStyles,
};

const VariantClasses = {
  [Variants.MAIN]: '',
  [Variants.NARROW]: styles._narrow,
};

const Modifiers = {
  DEFAULT: 'default',
  FULL: 'fullheight',
};

const ModifierClasses = {
  [Modifiers.DEFAULT]: null,
  [Modifiers.FULL]: styles._full,
};

const ModalComponent = observer(({ variant, modifier, name, children }) => {
  const uiContext = useContext(UiStoreContext);

  const afterOpenModal = () => {};

  const closeModal = () => {
    uiContext.resetModal();
  };

  let CSSinJSstyles = sharedStyles;
  if (variant && VariantStyles[variant]) {
    CSSinJSstyles = {
      content: { ...CSSinJSstyles.content, ...VariantStyles[variant].content },
      overlay: { ...CSSinJSstyles.overlay, ...VariantStyles[variant].overlay },
    };
  }

  return (
    <Modal
      className={`ReactModal__Content--${variant}`}
      isOpen={uiContext.activeModal === name}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      closeTimeoutMS={300}
      style={CSSinJSstyles}
      contentLabel="Modal">
      <div className={cns(styles.container, variant && VariantClasses[variant], modifier && ModifierClasses[modifier])}>
        <div className={styles.close} onClick={closeModal}>
          <SvgIcon name="close" />
        </div>

        <div className={cns(styles.content, modifier && ModifierClasses[modifier])}>{children}</div>
      </div>
    </Modal>
  );
});

ModalComponent.propTypes = {
  variant: PropTypes.string,
  modifier: PropTypes.string,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

ModalComponent.defaultProps = {
  variant: Variants.MAIN,
  modifier: Modifiers.DEFAULT,
};

export default ModalComponent;
