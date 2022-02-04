import { Bitski } from "bitski";
import React, { useEffect } from "react";

export default function BitskiCallback() {
  useEffect(() => {
    Bitski.callback();
  }, []);
  return <>Loading...</>;
  // Sends a message to the parent window with the access token and dismisses the popup
}
