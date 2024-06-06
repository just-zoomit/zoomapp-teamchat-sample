import React from 'react';
import { NavLink } from 'react-router-dom';
import CollaborativeButton from './Teamchat/CollaborativeButton';
import "./Header.css";

function Header(props) {
  const { navLinks, user, userContextStatus, meetingChatContext } = props;

  return (
    <div>
      <header>
        <nav>
          <ul className="nav-links">
            {Object.entries(navLinks).map(([route, navName]) => (
              <li key={route}>
                <NavLink activeClassName="active" to={`/${route}`}>
                  {navName}
                </NavLink>
              </li>
            ))}
          </ul>
          <CollaborativeButton
            user={user}
            userContextStatus={userContextStatus}
            meetingChatContext={meetingChatContext}
          />
        </nav>
      </header>
    </div>
  );
}

export default Header;
