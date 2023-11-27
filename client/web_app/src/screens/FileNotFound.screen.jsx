import React from "react";

const FileNotFound = () => {
  return (
    <div style={{color: "white", display: "flex", flexDirection: "column", alignItems: "center"}}>
        <h1>File Not Found :(</h1>
        <p>Make sure required drive is mounted.</p>
    </div>
  );
};

export default FileNotFound;
