/**
 * Dialog Component launched when user wants to create a new chat.
 * It's a modal window with a form requesting soem info to configure
 * the chat 
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import PersonIcon from '@material-ui/icons/Person';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { blue } from '@material-ui/core/colors';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import APIKit from '../APIKit';
import DisplayResultOrError from '../DisplayResultOrError';

// Sytles
const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
    selectedUser: {
        backgroundColor: blue[600],
        '&:hover': {
            backgroundColor: blue[100]
        }
    },
    errorMessage: {
        color: 'red',
        fontWeight: 'bold',
        fontStyle: 'italic'
    }
});


// Main component
export default function CreateChat(props) {
    
    // Classes to style the component
    const classes = useStyles();
    // Deconstructing the props
    const { onClose, open, user } = props;

    const match = useRouteMatch();
    const history = useHistory();

    // State to manage the list of users
    const [usersState, setUsersState] = useState({ users: [] });

    // Used when opening and closing the component
    const initialNewChatState = {
        private: true,
        chat_name: '',
        selectedUser: {}
    }
    // State to manage the new Chat configuration.    
    const [newChatState, setNewChatState] = useState(initialNewChatState);
    // State to validate the chat configuration
    const [validChat, setValidChat] = useState({
        valid: true,
        errorMessage: ""
    });

    // State to manage the 'is loading' status of the retrieved chats
    const [usersLoading, setUsersLoading] = useState(true);
    // State to manage the 'errors' from the server
    const [somethingWentWrong, setSomethingWentWrong] = useState({
        code: null,
        errorMessage: ''
    });

    // Fetch the users list from the server
    useEffect(() => {
        let mounted = true;        
        // We only fetch the data when the dialog is opened
        if (open) {
            const fetchData = async () => {
                const result = await APIKit.get('/api/users/');

                // We need to remove the current user from the list
                const filtered_users = result.data.filter(u => u.id !== user.id)
                if (mounted) {
                    setUsersState({ users: filtered_users })
                    setUsersLoading(false);
                };
            };
            fetchData();
        }
        // Clean up teh effect
        return () => {
            mounted = false;
        };
        
    }, [open]);

    // Helper function to execute everytime the component is closed
    const handleClose = () => {
        // We excecute the external function passed trhough the props
        onClose();
        // Reset the chat configuration state
        setNewChatState(initialNewChatState);
        setValidChat({valid: true, errorMessage: ""});
    };

    // Helper function that returns true if the chat config is valid
    // and false otherwise.
    const checkValidNewChatConfig = () => {
        // Chat config will be ok if:
        // 1) It's private and a user is selected
        // 2) It's public, a user is selected and a chat name is specified
        const {chat_name, selectedUser} = newChatState;

        if (Object.entries(selectedUser).length === 0) {
            return [false, "You must select a user from the list"];
        }

        if (!newChatState.private && chat_name.trim() === '') {
            return [false, "You must specify a name for the chat"];
        }

        return [true, ""];
    }

    const renderInvalidChatError = () => {
        if (!validChat.valid) {
            return (
                <DialogContent className={classes.errorMessage}>
                    {validChat.errorMessage}
                </DialogContent>
            );
        }
        return null;
    }

    // Function to handle the new chat creation
    const handleCreateNewChat = async () => {
        
        const [chat_is_valid, error_message] = checkValidNewChatConfig();

        setValidChat({
            valid: chat_is_valid,
            errorMessage: error_message
        });
        
        if (chat_is_valid) {
            const selected_user_id = newChatState.selectedUser.id
            const payload = {
                ...newChatState,
                users: [selected_user_id, user.id]
            }

            await APIKit.post('/api/chats/', payload)
                .catch(error => {
                    if (error.response) {
                        if (error.response.status === 400) {
                            console.log(error.response.error);
                        } else if (error.response.status === 302) {  // found
                            // Redirect to the chat
                            // A PRIVATE chat between the two users was found
                            const redirect_to = error.response.data.redirect_to;
                            history.push(`${match.url}/${redirect_to}`);
                        }
                    }
                })
                .then((response) => {
                    // redirects to the new created chat id
                    history.push(`${match.url}/${response.data.id}`);
                });

            handleClose();
        }
    };

    // Function excecuted when a user is selected from the list
    const handleListItemClick = (user) => {
        setNewChatState({
            ...newChatState,
            selectedUser: user
        });
    };

    // Function executed when the users select or unselect 
    // the Private checkbox
    const handleChangePrivate = (e) => {
        setNewChatState({
            ...newChatState,
            private: e.target.checked
        })
    }

    // Function to handle the input events to change the Chat name
    const handleChangeChatName = (e) => {
        setNewChatState({
            ...newChatState,
            chat_name: e.target.value
        })
    }

    // If the chat is 'private', then the 'chat_name' must not be specified
    // In that case we hide this component. On the other hand, if the chat
    // is not 'private', the Chat name must be specified
    const renderChatNameInput = () => {
        if (!newChatState.private) {
            return (
                <TextField
                    margin="dense"
                    id="chat-name"
                    label="Chat Name"
                    type="text"
                    fullWidth
                    autoFocus
                    required
                    value={newChatState.chat_name}
                    onChange={handleChangeChatName}
                />
            );
        }
        return null;
    }

    // Function to create the label for the 'create' button
    // Will dinamically update depending on the chat configuration
    const renderCreateButtonLabel = () => {        
        const is_private = newChatState.private ? 'private' : 'public';
        let button_label = `Create a new ${is_private} chat`;
        
        if (Object.entries(newChatState.selectedUser).length !== 0){
            button_label += ` with ${newChatState.selectedUser.username}`;
        }

        return button_label
    }

    return (
        <Dialog onClose={handleClose}
                aria-labelledby="simple-dialog-title" 
                open={open}
                fullWidth
                maxWidth="xs">
            
            <DialogTitle id="create-chat-dialog-title">
                New Chat Room
            </DialogTitle>

            <DialogContent>

                <FormControlLabel 
                    control={
                        <Checkbox checked={newChatState.private}                        
                                  name="private"
                                  color="primary"
                                  onChange={handleChangePrivate} />
                        }
                    label="Private" />
                                  
                { renderChatNameInput() }

            </DialogContent>

            <DialogContent>
                
                <DisplayResultOrError isLoading={usersLoading} 
                                        somethingWentWrong={somethingWentWrong}>
                    <List>
                        {usersState.users.map((user) => (
                            <ListItem button 
                                    onClick={() => handleListItemClick(user)} key={user.id}
                                    className={user.id === newChatState.selectedUser.id ? classes.selectedUser : null}>
                                
                                <ListItemAvatar>
                                    <Avatar className={classes.avatar}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText primary={user.username} />

                            </ListItem>
                        ))}
                    </List>
                </DisplayResultOrError>

            </DialogContent>

            { renderInvalidChatError() }

            <DialogActions>

                <Button autoFocus onClick={handleClose} color="secondary">
                    Cancel
                </Button>

                <Button onClick={handleCreateNewChat} 
                        color="primary"
                        variant="outlined"
                        autoFocus>
                    {renderCreateButtonLabel()}
                </Button>

            </DialogActions>     
                
        </Dialog>
    );
}

CreateChat.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};
