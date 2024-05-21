import React, { useEffect, useRef, useState } from "react";
import Quill from 'quill';
import QuillEditor from './QuillEditor';

const Delta = Quill.import('delta');

const ZoomAppEditor = () => {

    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();
    const [readOnly, setReadOnly] = useState(false);

    const quillRef = useRef();


  return (
      <div>
         
         <QuillEditor
           ref={quillRef}
           readOnly={readOnly}
           defaultValue={new Delta()
             .insert('Hello')
             .insert('\n', { header: 1 })
             .insert('Some ')
             .insert('initial', { bold: true })
             .insert(' ')
             .insert('content', { underline: true })
             .insert('\n')}
           onSelectionChange={setRange}
           onTextChange={setLastChange} >

         </QuillEditor>
         <br/>
          
         
         <div className="state">
             <div className="state-title">Current Range:</div>
             {range ? JSON.stringify(range) : 'Empty'}
           </div>
           <div className="state">
             <div className="state-title">Last Change:</div>
             {lastChange ? JSON.stringify(lastChange.ops) : 'Empty'}
           </div>
       </div>
       
  )
}

export default ZoomAppEditor