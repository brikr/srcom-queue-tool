import { deleteField, DocumentReference, setDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { UserDoc } from "../types/firestore";
import { collection, doc } from "./firestore";

// Gets the document reference for the current user
function getUserDoc(): DocumentReference | undefined {
  if (!auth.currentUser) {
    return undefined;
  }
  return doc(collection<UserDoc>(undefined, "users"), auth.currentUser.uid);
}

// Updates name in localStorage and firestore
export async function setName(name: string) {
  localStorage.setItem("name", name);

  const userDoc = getUserDoc();
  if (userDoc) {
    await setDoc(userDoc, { name }, { merge: true });
  }
}

// Clears name in localStorage and firestore
export async function clearName() {
  localStorage.removeItem("name");

  const userDoc = getUserDoc();
  if (userDoc) {
    await setDoc(userDoc, { name: deleteField() }, { merge: true });
  }
}
