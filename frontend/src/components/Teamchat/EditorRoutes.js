import React, { useEffect } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import TextEditor from './TextEditor';
import { v4 as uuidV4 } from 'uuid';

const EditorRoutes = () => {
  const history = useHistory();

  useEffect(() => {
    if (window.location.pathname === '/editor') {
      history.replace(`/editor/${uuidV4()}`);
    }
  }, [history]);

  return (
    <Switch>
      <Route path="/editor" exact>
        <Redirect to={`/editor/${uuidV4()}`} />
      </Route>

      <Route path="/editor/:id">
        <TextEditor />
      </Route>
    </Switch>
  );
};

export default EditorRoutes;
