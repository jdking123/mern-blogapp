import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'; 
import './Editor.css'; 

export default function Editor({ value, onChange }) {
  const modules = {
    toolbar: {
      container: "#toolbar", 
    },
  };

  return (
    <div className="custom-editor-container">
      
      <div id="toolbar">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" title="Bold"></button>
          <button className="ql-italic" title="Italic"></button>
          <button className="ql-underline" title="Underline"></button>
          <button className="ql-strike" title="Strike"></button>
        </span>
        
        <span className="ql-formats">
          <button className="ql-list" value="ordered" title="Ordered List"></button>
          <button className="ql-list" value="bullet" title="Bullet List"></button>
          <button className="ql-indent" value="-1" title="Decrease Indent"></button>
          <button className="ql-indent" value="+1" title="Increase Indent"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-link" title="Insert Link"></button>
          <button className="ql-image" title="Insert Image"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-clean" title="Clear Formatting"></button>
        </span>
      </div>

      <ReactQuill
        value={value}
        theme={'snow'}
        onChange={onChange}
        modules={modules}
        className="custom-editor"
      />
    </div>
  );
}
