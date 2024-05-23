import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TextEditor from './TextEditor';
import { v4 as uuidV4 } from 'uuid';

const EditorRoutes = () => {
  return (
    <Switch>
      <Route path="/editor" exact>
        <Redirect to={`/editor/${uuidV4()}`} />
      </Route>

      <Route path="/editor/:id" >
        <TextEditor />
      </Route>
    </Switch>
  );
};

export default EditorRoutes;
