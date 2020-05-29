import React, { useState, useRef, useLayoutEffect } from 'react';
// import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackRounded from '@material-ui/icons/ArrowBackRounded';
import GroupAddRounded from '@material-ui/icons/GroupAddRounded';
import Send from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import useStayScrolled from 'react-stay-scrolled';

import CustomLink from '../CustomLink';
import ChatMessage from './ChatMessage';

const useStyles = makeStyles((theme) => ({
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',      
      minHeight: '300px',
      height: '500px',
      borderRadius: '4px',
      boxShadow: '0 0 15px lightgray'
    },
    chatRoomHeader: {
        borderBottom: "solid 2px grey",
        padding: '5px 10px',
        background: 'black',
        color: 'white',
        borderRadius: '4px 4px 0 0'
    },
    chatMessages: {
        overflowY: 'auto',
        height: '100%',
        padding: '5px 10px',
    },
    chatSubmit: {
        borderRadius: '0 0 4px 4px',
        padding: '5px 10px',
        borderTop: "solid 2px grey",
    },
    message: {
        width: '85%'
    },
    submitMessageButton: {
        width: '15%'
    }
}));

export default function ChatRoom(props) {
    const classes = useStyles();

    const inputMessage = useRef(null);
    const chatMessagesRef = useRef();

    const { stayScrolled } = useStayScrolled(chatMessagesRef);
 
    const [messageState, setMessageState] = useState({
        message: ''
    });

    const [chatMessagesState, setChatMessagesState] = useState({
        messages: [
            {message: 'Hola'},
            {message: 'Hola 2'},
            {message: 'Hola 3'},
            {message: 'Hola 4'},
            {message: 'Hola 5'},
            {message: 'Hola 6'},
            {message: 'Hola 7'},
        ]
    });

    useLayoutEffect(() => {
            stayScrolled();
        }, [chatMessagesState.messages.length]
    );

    const onChangeMessageHandler = (e) => {
        setMessageState({
            message: e.target.value
        });        
    }

    const onKeyPressHandler = (e) => {
        if (e.key === 'Enter') {
            submitMessageHandler();
        }
    }

    const submitMessageHandler = (e) => {
        setChatMessagesState({
            messages: [
                ...chatMessagesState.messages,
                {message: messageState.message}
            ]
        });

        setMessageState({
            message: ''
        });

        inputMessage.current.focus();
    }

    const renderChatMessages = () => {
        return chatMessagesState.messages.map(message => 
            <ChatMessage message={message.message} />
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Grid container 
                      justify="space-between"
                      alignItems="center"
                      className={classes.chatRoomHeader}>
                    <Grid item>
                        <CustomLink tag={IconButton} 
                                    to='/chats' 
                                    color="secondary">
                            <ArrowBackRounded />
                        </CustomLink>
                    </Grid>
                    <Grid item>
                        {props.chat_name}
                    </Grid>
                    <Grid item>
                        <IconButton color="primary">
                            <GroupAddRounded />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid container className={classes.chatMessages} ref={chatMessagesRef}>
                    {renderChatMessages()}
                </Grid>

                <Grid container className={classes.chatSubmit} justify="space-between">
                    <TextField 
                        id="message" 
                        name="message"
                        label="Write your message here"
                        className={classes.message}
                        value={messageState.message}
                        autoFocus
                        onChange={onChangeMessageHandler}
                        onKeyPress={onKeyPressHandler}                       
                        inputRef={inputMessage}
                    />
                    <IconButton 
                        color="primary" 
                        className={classes.submitMessageButton}
                        onClick={submitMessageHandler}>
                        <Send />
                    </IconButton>
                </Grid>              
            </div>
        </Container>
    );
}