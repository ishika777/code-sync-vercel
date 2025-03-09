import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    return (
        <div className="flex items-center flex-col font-bold">
            <Avatar name={username} className='mb-1' size={45} round="15px" />
            <span className="font-semibold text-md">{username}</span>
        </div>
    );
};

export default Client;