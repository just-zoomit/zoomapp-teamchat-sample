/* globals zoomSdk */
import { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ApiScrollview from "../ApiScrollview";
import ContextDashboard from "../ContextDashboard";

export default function AuthCheck({ user, showInClientOAuthPrompt, showGuestModePrompt, onClick, userContextStatus, meetingChatContext }) {
    const [runningContext, setRunningContext] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (showGuestModePrompt) {
            const fetchRunningContext = async () => {
                const getRunningContext = await zoomSdk.getRunningContext();
                setRunningContext(getRunningContext.context);
            };

            fetchRunningContext();
        }
    }, [showGuestModePrompt]);

    if (showInClientOAuthPrompt) {
        return (
            <>
                <h1>In-client Add</h1>
                <p>
                    User has authorized your app and added, but the app does not know this or does not have a REST API access token. Click below to invoke the authorize API, perform 'In-client OAuth', and receive/save the access token for this user.
                </p>
                <p>
                    (If you've called this API before . . . you may be seeing this because your embedded browser session expired or was forgotten during a Docker restart. Please try closing and re-opening, or re-installing the application)
                </p>
                <Button variant="primary" onClick={onClick}>
                    authorize
                </Button>
            </>
        );
    } else if (showGuestModePrompt) {
        let bodyText;
        if (userContextStatus === "unauthenticated") {
            bodyText = "This user is unauthenticated. Zoom does not know the user, and only some Zoom App APIs are allowed. Invoking promptAuthorize will ask the user to log in to Zoom";
        } else if (userContextStatus === "authenticated") {
            bodyText = "This user is authenticated, but they have not yet added the app and/or consented to app scopes. Invoke promptAuthorize once more to ask the authenticated user to consent and add the app (this will invoke the In-client OAuth flow).";
        }

        return (
            <>
                <div>
                    <h1 style={{ textAlign: 'center' }}>You are in Guest Mode</h1>
                    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
                        <ContextDashboard
                            user={user}
                            userContextStatus={userContextStatus}
                            meetingChatContext={meetingChatContext}
                            runningContext={runningContext}
                            connected={connected}
                        />
                        <div style={{ padding: '0 20px' }}>
                            <Button onClick={onClick}>promptAuthorize</Button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p>Not all APIs will be available in Guest Mode</p>
                            <ApiScrollview />
                        </div>
                    </div>
                </div>
            </>
        );
    } else if (!user) {
        return <p className="p-loading">Loading Zoom User . . .</p>;
    }

    return null;
}
