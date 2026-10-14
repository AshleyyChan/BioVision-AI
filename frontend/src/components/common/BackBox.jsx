import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

/**
 * BackBox
 * -------
 * Back navigation using the shared Button component.
 * Layout-aware wrapper only.
 */
const BackBox = ({ label = "Back" }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        ← {label}
      </Button>
    </div>
  );
};

export default BackBox;

const styles = {
  wrapper: {
    alignSelf: "flex-end",
  },
};
