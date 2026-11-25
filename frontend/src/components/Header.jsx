import { UserButton, useAuth } from "@clerk/react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <header>
      <Link className="brand" to="/" aria-label="Pulmo home">
        <span className="brand-mark" aria-hidden="true">+</span>
        <span><strong>pulmo</strong><small>XRAY WORKSPACE</small></span>
      </Link>
      <nav className="top-nav" aria-label="Main navigation">
        {isLoaded && isSignedIn ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/history">History</NavLink>
            <UserButton />
          </>
        ) : isLoaded ? (
          <>
            <span className="header-caption">A thoughtful way to review scans</span>
            <NavLink className="sign-in-link" to="/sign-in">Sign in</NavLink>
          </>
        ) : null}
      </nav>
    </header>
  );
}