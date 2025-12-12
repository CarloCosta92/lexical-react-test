import { useState } from "react";
import TrainingDescriptionEditor from "./components/TrainingDescriptionEditor";

export default function App() {
  const [desc, setDesc] = useState("");

  const handleSave = () => {
    console.log(desc);
  };

  const handleClear = () => {
    setDesc("");
  };

  return (
    <div className="container mt-4">
      <h3>LEXICAL</h3>
      <TrainingDescriptionEditor value={desc} onChange={setDesc} />

      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={handleSave}>
          Salva
        </button>
        <button className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>
      <div className="mt-3">
        <h5>Anteprima renderizzata:</h5>
        <div
          className="p-3"
          style={{ background: "#fafafa" }}
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      </div>
    </div>
  );
}
