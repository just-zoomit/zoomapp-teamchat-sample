import { useCallback } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import SettingsPage from './SettingsPage';

const TOOLBAR_OPTIONS = [
    [{ toolbar: { container: '#toolbar' } }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
   
   
];

export default function TextEditor(props) {
   

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return;

        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
    }, []);

    return (
        <>
            <div>
               
                <SettingsPage
                    {...props}
                />
            </div>
            <div className="container" ref={wrapperRef}></div>
        </>
    );
}
