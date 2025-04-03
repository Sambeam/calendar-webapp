// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import Modal from 'react-modal';

// 🛡 Prevent react-modal from throwing error in Jest
Modal.setAppElement = () => null;