import { useContext, useEffect } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400
};

export default function MUIErrorModal() {
    const { store } = useContext(GlobalStoreContext);
    const errorMessage = store.errorMessage;
    function handleCloseModal(event) {
        store.hideModals();
    }

    return (
        <Modal
            open={errorMessage !== null}
            style={{ zIndex: 1250 }}
        >
            <Box sx={style} m={2} pt={3}>
                <div className="modal-dialog-error">
                <div id="error-dialog-header">
                    ERROR
                </div>
                <header className="dialog-header">
                    <Alert severity="error">{errorMessage}</Alert>
                </header>
                <div id="confirm-cancel-container">
                    <Button variant="contained"
                        id="dialog-no-button"
                        className="modal-button"
                        onClick={handleCloseModal}>
                    Cancel</Button>
                </div>
            </div>
            </Box>
        </Modal>
    );
}