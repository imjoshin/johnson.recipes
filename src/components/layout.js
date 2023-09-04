import * as React from "react";
import "../styles.css";
import Header from "./header";
import Footer from "./footer";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
