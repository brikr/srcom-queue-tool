import { FormEvent, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { auth } from "../firebase";
import { nameSelector } from "../recoil/name";

export const Home: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useRecoilState(nameSelector);
  const [user, loading, error] = useAuthState(auth);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setName(inputRef.current?.value ?? "");
  };

  const handleResetName = () => {
    setName("");
  };

  return (
    <>
      <h1>speedrun.com queue tool</h1>
      {name ? (
        <>
          <p title={user?.uid}>Welcome {name}</p>
          <button onClick={handleResetName}>Reset name</button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Enter your name: </label>
          <input id="name" ref={inputRef} />
          <button type="submit">Submit</button>
        </form>
      )}
    </>
  );
};
