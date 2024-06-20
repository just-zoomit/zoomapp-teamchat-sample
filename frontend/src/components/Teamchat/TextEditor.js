/* globals zoomSdk */
import { useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import AuthCheck from "./GuestMode"; // Adjust the import path as needed

const TOOLBAR_OPTIONS = [
    [{ toolbar: { container: '#toolbar' } }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ script: "sub" }, { script: "super" }],
];

export default function TextEditor(props) {
    const { user, showInClientOAuthPrompt, showGuestModePrompt, onClick, userContextStatus, meetingChatContext } = props;

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return;
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
    }, []);

    return (
        <>
            <AuthCheck
                user={user}
                showInClientOAuthPrompt={showInClientOAuthPrompt}
                showGuestModePrompt={showGuestModePrompt}
                onClick={onClick}
                userContextStatus={userContextStatus}
                meetingChatContext={meetingChatContext}
            />
            {user && !showInClientOAuthPrompt && !showGuestModePrompt && (
                <>
                    <div>
                        <h1>{user.last_name}</h1>
                    </div>
                    <div className="container" ref={wrapperRef}></div>
                </>
            )}
        </>
    );
}
