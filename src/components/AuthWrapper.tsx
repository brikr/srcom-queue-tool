import { isBefore } from "date-fns";
import { signInAnonymously } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { auth } from "../firebase";
import { nameSelector } from "../recoil/name";
import { setName } from "../util/user";

export const AuthWrapper: React.FC = ({ children }) => {
  const [name] = useRecoilState(nameSelector);

  const [authenticating, setAuthenticating] = useState(true);

  useEffect(() => {
    (async () => {
      // anonymous sign in once on app load
      const user = (await signInAnonymously(auth)).user;

      if (
        !user.metadata.lastSignInTime ||
        isBefore(
          new Date(user.metadata.lastSignInTime),
          new Date("21 Sep 2022 GMT")
        )
      ) {
        // first sign in, or they haven't signed in since auth was added. setup user doc with name
        setName(name);
      }

      setAuthenticating(false);
    })();
  }, []);

  if (authenticating) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
};
