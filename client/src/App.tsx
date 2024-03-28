import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Table from "./components/table"
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
function App() {
  return (
    <div className="App">
      <Container maxWidth="md" sx={{ mt: 5, paddingLeft: "0px", paddingRight: "0px" }}>
        <Typography component="p">
          Hello, MUI!
        </Typography>
        <Table />
        {/* Other components */}
      </Container>
    </div>
  );
}

export default App;
