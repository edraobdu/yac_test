/**
 * Dialog Component launched when user wants to add a new user to a chat.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router-dom';

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
import Button from '@material-ui/core/Button';
import { blue } from '@material-ui/core/colors';

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
export default function AddUserToChat(props) {
    
    // Classes to style the component
    const classes = useStyles();
    // Deconstructing the props
    const { onClose, open, users } = props;

    const match = useRouteMatch();

    // State to manage the list of users
    const [usersState, setUsersState] = useState({ users: [] });
    // State to manage the new user to be added
    const initialNewUserState = {newUser: {}};
    const [newUserState, setNewUserState] = useState(initialNewUserState);
    // State to validate the new user configuration
    const [validNewUser, setValidNewUser] = useState({
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
        // We'll only make the api call to retrieve the list of users when the
        // dialog is opened ('open' is set to true true)
        if (open) {
            const fetchData = async () => {
                const result = await APIKit.get('/api/users/');
                // We need to remove the all the users already in the chat
                const filtered_users = result.data.filter(u => !users.includes(u.id))
                if (mounted) {
                    setUsersState({ users: filtered_users });
                    setUsersLoading(false);
                };
            };
            fetchData();
        }
        // Clean up the effect
        return () => {
            mounted = false;
        };        
    }, [open]);

    // Helper function to execute everytime the component is closed
    const handleClose = () => {
        // We excecute the external function passed trhough the props
        onClose();
        // Reset the chat configuration state
        setNewUserState(initialNewUserState);
        setValidNewUser({valid: true, errorMessage: ""});
    };

    // Helper function that returns true if the new user config is valid
    // and false otherwise.
    const checkValidNewUserConfig = () => {
        const {newUser} = newUserState;

        if (Object.entries(newUser).length === 0) {
            return [false, "You must select a user from the list"];
        }

        return [true, ""];
    }

    const renderInvalidNewUserError = () => {
        if (!validNewUser.valid) {
            return (
                <DialogContent className={classes.errorMessage}>
                    {validNewUser.errorMessage}
                </DialogContent>
            );
        }
        return null;
    }

    // Function to handle the new chat creation
    const handleAddNewUser = async () => {
        const [new_user_is_valid, error_message] = checkValidNewUserConfig();

        setValidNewUser({
            valid: new_user_is_valid,
            errorMessage: error_message
        });

        if (new_user_is_valid) {
            const payload = {
                users:[
                    ...users,
                    newUserState.newUser.id
                ],
                event: "new_user_added"
            }
            // Patch to -> /api/chats/{chat_id}
            await APIKit.patch(`/api/${match.url}/`, payload);

            handleClose();
        }
    };

    // Function excecuted when a user is selected from the list
    const handleListItemClick = user => setNewUserState({newUser: user});

    return (
        <Dialog onClose={handleClose} 
                aria-labelledby="simple-dialog-title" 
                open={open}
                fullWidth
                maxWidth="xs">

            <DialogTitle id="add-user-dialog-title">
                Add User to the Chat
            </DialogTitle>

            <DialogContent>
                <DisplayResultOrError isLoading={usersLoading} 
                                      somethingWentWrong={somethingWentWrong}>
                    <List>
                        {usersState.users.map((user) => (
                            <ListItem button 
                                    onClick={() => handleListItemClick(user)} key={user.id}
                                    className={user.id === newUserState.newUser.id ? classes.selectedUser : null}>
                                
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
            
            { renderInvalidNewUserError() }

            <DialogActions>

                <Button autoFocus onClick={handleClose} color="secondary">
                    Cancel
                </Button>

                <Button onClick={handleAddNewUser} 
                        color="primary"
                        variant="outlined"
                        autoFocus>
                    Add { newUserState.newUser ? newUserState.newUser.username : 'a user' }
                </Button>

            </DialogActions>     
                
        </Dialog>
    );
}

AddUserToChat.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    users: PropTypes.arrayOf(PropTypes.number).isRequired
};
