import React, { useState, useEffect } from 'react';
import { ListGroup } from "react-bootstrap";
import "../ApiScrollview.css";

function ChatChannels({ onChannelSelect }) {
    const [channels, setChannels] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedChannel, setSelectedChannel] = useState(null);

    useEffect(() => {
        const fetchChatChannels = async () => {
            try {
                const response = await fetch('/zoom/getChatChannels');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log("Chat Channels Data: ", data);
                setChannels(data.channels);
            } catch (error) {
                console.error("There was an error fetching the chat channels!", error);
            }
        };

        fetchChatChannels();
    }, []);

    const searchHandler = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const handleChannelSelect = (channel) => {
        setSelectedChannel(channel);
        onChannelSelect(channel.id);
        console.log(`Selected channel: ${channel.name}`);
    };

    const filteredChannels = channels.filter(channel => {
        if (searchText === '') {
            return channel;
        } else {
            return channel.name.toLowerCase().includes(searchText);
        }
    });

    return (
        <div className="api-scrollview">
            <input
                placeholder="Search for a channel"
                onChange={searchHandler}
                className="form-control mb-3"
            />

            <div className="api-buttons-list">
                <ListGroup>
                    {filteredChannels.map((channel) => (
                        <ListGroup.Item 
                            key={channel.id} 
                            active={selectedChannel && selectedChannel.id === channel.id}
                            onClick={() => handleChannelSelect(channel)}
                            action
                        >
                            {channel.name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
            <br />

            <hr className="hr-scroll-border" />

            {selectedChannel && (
                <div>
                    <h4>Selected Channel: {selectedChannel.name}</h4>
                    {/* Add additional functionality for the selected channel here */}
                </div>
            )}
        </div>
    );
}

export default ChatChannels;
